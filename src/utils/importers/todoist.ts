/**
 * Todoist Task Import Utilities
 * Converts Todoist export format to Todone tasks
 */

import { Task, Project } from '@/types';

interface TodoistTask {
  id?: string;
  content: string;
  completed?: boolean;
  priority?: number; // 1-4, where 4 is highest
  due?: {
    date?: string;
    datetime?: string;
    string?: string;
  };
  labels?: string[];
  project_id?: string;
  parent_id?: string;
  description?: string;
}

interface TodoistProject {
  id: string;
  name: string;
  color?: string;
  parent_id?: string;
  is_archived?: boolean;
}

export function convertTodoistTaskToTodone(
  todoistTask: TodoistTask,
  labelIdMap: Map<string, string>,
  projectIdMap: Map<string, string>,
): Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>> {
  // Map Todoist priority (1-4) to Todone priority (p1-p4)
  const priorityMap: { [key: number]: 'p1' | 'p2' | 'p3' | 'p4' } = {
    4: 'p1',
    3: 'p2',
    2: 'p3',
    1: 'p4',
  };

  // Parse due date
  let dueDate: Date | undefined;
  if (todoistTask.due?.datetime) {
    dueDate = new Date(todoistTask.due.datetime);
  } else if (todoistTask.due?.date) {
    dueDate = new Date(todoistTask.due.date);
  }

  return {
    content: todoistTask.content,
    description: todoistTask.description || '',
    completed: todoistTask.completed || false,
    priority: priorityMap[todoistTask.priority || 1] || 'p4',
    dueDate: dueDate,
    projectId: projectIdMap.get(todoistTask.project_id || ''),
    parentTaskId: todoistTask.parent_id ? `todoist-${todoistTask.parent_id}` : undefined,
    labels: (todoistTask.labels || [])
      .map(label => labelIdMap.get(label))
      .filter((id): id is string => !!id),
    assigneeIds: [],
    attachments: [],
    reminders: [],
    duration: 0,
  };
}

export function convertTodoistProjectToTodone(
  todoistProject: TodoistProject,
): Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>> {
  const colorMap: { [key: string]: string } = {
    'red': '#ef4444',
    'orange': '#f97316',
    'yellow': '#eab308',
    'green': '#22c55e',
    'teal': '#14b8a6',
    'blue': '#3b82f6',
    'purple': '#a855f7',
    'pink': '#ec4899',
  };

  return {
    name: todoistProject.name,
    description: '',
    color: colorMap[todoistProject.color || 'blue'] || '#3b82f6',
    parentProjectId: todoistProject.parent_id
      ? `todoist-${todoistProject.parent_id}`
      : undefined,
    archived: todoistProject.is_archived || false,
    isFavorite: false,
    isShared: false,
  };
}

export function parseTodoistJSONExport(
  jsonData: string,
): {
  tasks: TodoistTask[];
  projects: TodoistProject[];
} {
  try {
    const data = JSON.parse(jsonData);

    if (data.items && Array.isArray(data.items)) {
      return {
        tasks: data.items,
        projects: data.projects || [],
      };
    }

    // Handle array export format
    if (Array.isArray(data)) {
      return {
        tasks: data,
        projects: [],
      };
    }

    throw new Error('Invalid Todoist export format');
  } catch (error) {
    throw new Error(`Failed to parse Todoist export: ${error}`);
  }
}

export function validateTodoistExport(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData);
    // Check for items array or array format
    return (data.items && Array.isArray(data.items)) || Array.isArray(data);
  } catch {
    return false;
  }
}
