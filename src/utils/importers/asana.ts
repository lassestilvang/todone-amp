/**
 * Asana Task Import Utilities
 * Converts Asana export format to Todone tasks
 */

import { Task, Project } from '@/types';

interface AsanaTask {
  id?: string;
  name: string;
  completed?: boolean;
  due_on?: string;
  due_at?: string;
  notes?: string;
  assignee?: {
    name: string;
    email: string;
  };
  projects?: Array<{
    name: string;
    gid: string;
  }>;
  parent?: {
    name: string;
    gid: string;
  };
  custom_fields?: Array<{
    name: string;
    text_value?: string;
    enum_value?: { name: string };
  }>;
  created_at?: string;
  modified_at?: string;
}

interface AsanaProject {
  gid: string;
  name: string;
  description?: string;
  archived?: boolean;
  color?: string;
}

export function convertAsanaTaskToTodone(
  asanaTask: AsanaTask,
  projectIdMap: Map<string, string>,
): Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>> {
  // Parse due date
  let dueDate: Date | undefined;
  if (asanaTask.due_at) {
    dueDate = new Date(asanaTask.due_at);
  } else if (asanaTask.due_on) {
    dueDate = new Date(asanaTask.due_on);
  }

  // Get project ID from first assigned project
  const projectId = asanaTask.projects?.[0]
    ? projectIdMap.get(asanaTask.projects[0].gid)
    : undefined;

  // Extract priority from custom fields if available
  let priority: 'p1' | 'p2' | 'p3' | 'p4' = 'p2';
  const priorityField = asanaTask.custom_fields?.find(
    f => f.name?.toLowerCase().includes('priority'),
  );
  if (priorityField?.enum_value?.name) {
    const priorityName = priorityField.enum_value.name.toLowerCase();
    if (priorityName.includes('high') || priorityName.includes('urgent')) {
      priority = 'p1';
    } else if (priorityName.includes('low')) {
      priority = 'p4';
    }
  }

  return {
    content: asanaTask.name,
    description: asanaTask.notes || '',
    completed: asanaTask.completed || false,
    priority: priority,
    dueDate: dueDate,
    projectId: projectId,
    parentTaskId: asanaTask.parent ? `asana-${asanaTask.parent.gid}` : undefined,
    labels: [],
    assigneeIds: asanaTask.assignee ? [asanaTask.assignee.email] : [],
    attachments: [],
    reminders: [],
    duration: 0,
  };
}

export function convertAsanaProjectToTodone(
  asanaProject: AsanaProject,
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
    name: asanaProject.name,
    description: asanaProject.description || '',
    color: colorMap[asanaProject.color?.toLowerCase() || ''] || '#3b82f6',
    parentProjectId: undefined,
    archived: asanaProject.archived || false,
    isFavorite: false,
    isShared: true,
  };
}

export function parseAsanaJSONExport(
  jsonData: string,
): {
  tasks: AsanaTask[];
  projects: AsanaProject[];
} {
  try {
    const data = JSON.parse(jsonData);

    // Handle Asana export format
    if (data.tasks && Array.isArray(data.tasks)) {
      return {
        tasks: data.tasks,
        projects: data.projects || [],
      };
    }

    // Handle array format
    if (Array.isArray(data)) {
      return {
        tasks: data,
        projects: [],
      };
    }

    throw new Error('Invalid Asana export format');
  } catch (error) {
    throw new Error(`Failed to parse Asana export: ${error}`);
  }
}

export function parseAsanaCSVExport(csvData: string): AsanaTask[] {
  const lines = csvData.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

  const tasks: AsanaTask[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const nameIndex = headers.indexOf('name');
    const completedIndex = headers.indexOf('completed');
    const dueIndex = headers.indexOf('due date') || headers.indexOf('due on');
    const notesIndex = headers.indexOf('notes') || headers.indexOf('description');

    if (nameIndex >= 0) {
      tasks.push({
        name: values[nameIndex] || 'Untitled',
        completed:
          completedIndex >= 0 &&
          (values[completedIndex]?.toLowerCase() === 'true' ||
            values[completedIndex]?.toLowerCase() === 'yes'),
        due_on: dueIndex >= 0 ? values[dueIndex] : undefined,
        notes: notesIndex >= 0 ? values[notesIndex] : undefined,
      });
    }
  }

  return tasks;
}

export function validateAsanaExport(content: string): boolean {
  try {
    const data = JSON.parse(content);
    return (data.tasks && Array.isArray(data.tasks)) || Array.isArray(data);
  } catch {
    return content.includes('name') && (content.includes('completed') || content.includes('due'));
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}
