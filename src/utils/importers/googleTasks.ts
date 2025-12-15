/**
 * Google Tasks Import Utilities
 * Converts Google Tasks export format to Todone tasks
 */

import { Task, Project } from '@/types';

interface GoogleTask {
  title: string;
  notes?: string;
  status?: 'needsAction' | 'completed';
  due?: string;
  parent?: string;
  position?: string;
  etag?: string;
  id?: string;
}

interface GoogleTasksList {
  title: string;
  id?: string;
  tasks?: GoogleTask[];
}

export function convertGoogleTaskToTodone(
  googleTask: GoogleTask,
  projectId: string,
): Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>> {
  // Parse due date (RFC 3339 format)
  let dueDate: Date | undefined;
  if (googleTask.due) {
    dueDate = new Date(googleTask.due);
  }

  return {
    content: googleTask.title,
    description: googleTask.notes || '',
    completed: googleTask.status === 'completed',
    priority: 'p2',
    dueDate: dueDate,
    projectId: projectId,
    parentTaskId: googleTask.parent ? `google-${googleTask.parent}` : undefined,
    labels: [],
    assigneeIds: [],
    attachments: [],
    reminders: [],
    duration: 0,
  };
}

export function convertGoogleTasksListToTodoneProject(
  googleList: GoogleTasksList,
): Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>> {
  return {
    name: googleList.title,
    description: '',
    color: '#3b82f6',
    parentProjectId: undefined,
    archived: false,
    isFavorite: false,
    isShared: false,
  };
}

export function parseGoogleTasksJSONExport(
  jsonData: string,
): GoogleTasksList[] {
  try {
    const data = JSON.parse(jsonData);

    // Handle single list format
    if (data.title && (data.tasks || Array.isArray(data.tasks))) {
      return [data];
    }

    // Handle array of lists
    if (Array.isArray(data)) {
      return data;
    }

    throw new Error('Invalid Google Tasks export format');
  } catch (error) {
    throw new Error(`Failed to parse Google Tasks export: ${error}`);
  }
}

export function parseGoogleTasksCSVExport(csvData: string): GoogleTask[] {
  const lines = csvData.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

  const tasks: GoogleTask[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const titleIndex = headers.indexOf('title');
    const notesIndex = headers.indexOf('notes');
    const dueIndex = headers.indexOf('due');
    const statusIndex = headers.indexOf('status');

    if (titleIndex >= 0) {
      tasks.push({
        title: values[titleIndex] || 'Untitled',
        notes: notesIndex >= 0 ? values[notesIndex] : undefined,
        due: dueIndex >= 0 ? values[dueIndex] : undefined,
        status:
          statusIndex >= 0 && values[statusIndex]?.toLowerCase() === 'completed'
            ? 'completed'
            : 'needsAction',
      });
    }
  }

  return tasks;
}

export function validateGoogleTasksExport(content: string): boolean {
  try {
    // Try JSON first
    const data = JSON.parse(content);
    return (
      (data.title && data.tasks) || Array.isArray(data)
    );
  } catch {
    // Try CSV
    return content.includes('title') || content.includes('Title');
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
