/**
 * Unified Task Import Handler
 * Supports importing from multiple task managers
 */

import { Task, Project, Label } from '@/types';
import * as TodoistImporter from './todoist';
import * as GoogleTasksImporter from './googleTasks';
import * as AsanaImporter from './asana';

export type ImportSource = 'todoist' | 'google-tasks' | 'asana' | 'json';

export interface ImportResult {
  tasks: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>[];
  projects: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>[];
  labels: Partial<Omit<Label, 'id' | 'createdAt' | 'updatedAt'>>[];
  stats: {
    totalTasks: number;
    totalProjects: number;
    totalLabels: number;
    completedTasks: number;
  };
}

export async function importTasks(
  source: ImportSource,
  content: string,
): Promise<ImportResult> {
  switch (source) {
    case 'todoist':
      return importTodoistTasks(content);
    case 'google-tasks':
      return importGoogleTasks(content);
    case 'asana':
      return importAsanaTasks(content);
    case 'json':
      return importJSONTasks(content);
    default:
      throw new Error(`Unknown import source: ${source}`);
  }
}

function importTodoistTasks(content: string): ImportResult {
  const { tasks: todoistTasks, projects: todoistProjects } =
    TodoistImporter.parseTodoistJSONExport(content);

  const projectIdMap = new Map<string, string>();
  const projects: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>[] = [];

  // Convert projects
  for (const todoistProject of todoistProjects) {
    const projectId = `todoist-${todoistProject.id}`;
    projectIdMap.set(todoistProject.id, projectId);

    const convertedProject = TodoistImporter.convertTodoistProjectToTodone(todoistProject);
    projects.push(convertedProject);
  }

  // Convert tasks
  const labelMap = new Map<string, string>();
  const tasks: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>[] = [];

  for (const todoistTask of todoistTasks) {
    const convertedTask = TodoistImporter.convertTodoistTaskToTodone(
      todoistTask,
      labelMap,
      projectIdMap,
    );
    tasks.push(convertedTask);

    // Track labels
    if (todoistTask.labels) {
      for (const label of todoistTask.labels) {
        if (!labelMap.has(label)) {
          labelMap.set(label, `label-${label.toLowerCase().replace(/\s+/g, '-')}`);
        }
      }
    }
  }

  // Convert labels
  const labels: Partial<Omit<Label, 'id' | 'createdAt' | 'updatedAt'>>[] = Array.from(labelMap.entries()).map(
    ([name]) => ({
      name,
      color: '#3b82f6',
      isShared: false,
    }),
  );

  return {
    tasks,
    projects,
    labels,
    stats: {
      totalTasks: tasks.length,
      totalProjects: projects.length,
      totalLabels: labels.length,
      completedTasks: tasks.filter(t => t.completed).length,
    },
  };
}

function importGoogleTasks(content: string): ImportResult {
  const lists = GoogleTasksImporter.parseGoogleTasksJSONExport(content);

  const tasks: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>[] = [];
  const projects: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>[] = [];

  const projectIdMap = new Map<string, string>();

  for (const list of lists) {
    const projectId = `google-${list.id || list.title.toLowerCase().replace(/\s+/g, '-')}`;
    projectIdMap.set(list.title, projectId);

    const project = GoogleTasksImporter.convertGoogleTasksListToTodoneProject(list);
    projects.push(project);

    // Convert tasks
    if (list.tasks) {
      for (const googleTask of list.tasks) {
        const task = GoogleTasksImporter.convertGoogleTaskToTodone(googleTask, projectId);
        tasks.push(task);
      }
    }
  }

  return {
    tasks,
    projects,
    labels: [],
    stats: {
      totalTasks: tasks.length,
      totalProjects: projects.length,
      totalLabels: 0,
      completedTasks: tasks.filter(t => t.completed).length,
    },
  };
}

function importAsanaTasks(content: string): ImportResult {
  const { tasks: asanaTasks, projects: asanaProjects } =
    AsanaImporter.parseAsanaJSONExport(content);

  const projectIdMap = new Map<string, string>();
  const projects: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>[] = [];

  // Convert projects
  for (const asanaProject of asanaProjects) {
    const projectId = `asana-${asanaProject.gid}`;
    projectIdMap.set(asanaProject.gid, projectId);

    const convertedProject = AsanaImporter.convertAsanaProjectToTodone(asanaProject);
    projects.push(convertedProject);
  }

  // Convert tasks
  const tasks: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>[] = [];

  for (const asanaTask of asanaTasks) {
    const convertedTask = AsanaImporter.convertAsanaTaskToTodone(asanaTask, projectIdMap);
    tasks.push(convertedTask);
  }

  return {
    tasks,
    projects,
    labels: [],
    stats: {
      totalTasks: tasks.length,
      totalProjects: projects.length,
      totalLabels: 0,
      completedTasks: tasks.filter(t => t.completed).length,
    },
  };
}

function importJSONTasks(content: string): ImportResult {
  const data = JSON.parse(content);

  // Handle direct Todone export format
  if (data.tasks && Array.isArray(data.tasks)) {
    return {
      tasks: data.tasks || [],
      projects: data.projects || [],
      labels: data.labels || [],
      stats: {
        totalTasks: (data.tasks || []).length,
        totalProjects: (data.projects || []).length,
        totalLabels: (data.labels || []).length,
        completedTasks: ((data.tasks || []) as Task[]).filter(t => t.completed).length,
      },
    };
  }

  throw new Error('Invalid JSON format for import');
}

export function detectImportSource(content: string): ImportSource | null {
  // Try to detect JSON-based formats first
  try {
    const data = JSON.parse(content);

    // Check for Todoist format first (has items array)
    if (data.items && Array.isArray(data.items)) {
      return 'todoist';
    }

    // Check for Google Tasks (has title and tasks, but not 'name' property in first task)
    if (
      data.title &&
      typeof data.title === 'string' &&
      data.tasks &&
      Array.isArray(data.tasks)
    ) {
      const firstTask = data.tasks[0];
      // If first task has 'title' property (not 'name'), it's Google Tasks
      if (firstTask && 'title' in firstTask && !('name' in firstTask)) {
        return 'google-tasks';
      }
    }

    // Check for Asana or Todone format
    if (data.tasks && Array.isArray(data.tasks)) {
      const firstTask = data.tasks[0];
      if (!firstTask) return 'json'; // Empty tasks array = assume JSON

      // Asana uses 'name' property for task title
      if ('name' in firstTask && !('title' in firstTask)) {
        return 'asana';
      }

      // Todone uses 'title' property and has other Todone-specific fields
      if ('title' in firstTask) {
        // Check for Todone-specific fields
        if ('labelIds' in firstTask || 'projectId' in firstTask) {
          return 'json';
        }
        // If it has other fields like 'completed', 'dueDate', assume JSON
        return 'json';
      }
    }

    // Default to json for array format with title fields
    if (Array.isArray(data) && data.length > 0) {
      if (data[0]?.title) {
        return 'json';
      }
      if (data[0]?.content) {
        return 'todoist';
      }
    }
  } catch {
    // Not JSON, try CSV detection
  }

  // CSV format detection
  if (AsanaImporter.validateAsanaExport(content)) {
    return 'asana';
  }

  if (GoogleTasksImporter.validateGoogleTasksExport(content)) {
    return 'google-tasks';
  }

  if (TodoistImporter.validateTodoistExport(content)) {
    return 'todoist';
  }

  return null;
}
