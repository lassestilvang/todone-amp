import { describe, it, expect } from 'vitest';
import { importTasks, detectImportSource } from './index';

describe('Task Importers', () => {
  describe('Todoist', () => {
    it('should import Todoist JSON tasks', async () => {
      const todoistData = JSON.stringify({
        items: [
          {
            id: '1',
            content: 'Test Task',
            completed: false,
            priority: 4,
          },
        ],
        projects: [
          {
            id: 'p1',
            name: 'Work',
          },
        ],
      });

      const result = await importTasks('todoist', todoistData);

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].content).toBe('Test Task');
      expect(result.tasks[0].priority).toBe('p1');
      expect(result.tasks[0].completed).toBe(false);
    });

    it('should detect Todoist format', () => {
      const data = JSON.stringify({
        items: [{ content: 'Task' }],
      });

      expect(detectImportSource(data)).toBe('todoist');
    });
  });

  describe('Google Tasks', () => {
    it('should import Google Tasks JSON', async () => {
      const googleData = JSON.stringify({
        title: 'My Tasks',
        tasks: [
          {
            title: 'Google Task',
            completed: false,
            due: '2025-12-31T00:00:00.000Z',
          },
        ],
      });

      const result = await importTasks('google-tasks', googleData);

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].content).toBe('Google Task');
      expect(result.projects).toHaveLength(1);
    });

    it('should detect Google Tasks format', () => {
      const data = JSON.stringify({
        title: 'My Tasks',
        tasks: [{ title: 'Task' }],
      });

      expect(detectImportSource(data)).toBe('google-tasks');
    });
  });

  describe('Asana', () => {
    it('should import Asana JSON tasks', async () => {
      const asanaData = JSON.stringify({
        tasks: [
          {
            name: 'Asana Task',
            completed: false,
            due_on: '2025-12-31',
          },
        ],
        projects: [
          {
            gid: 'p1',
            name: 'Project',
          },
        ],
      });

      const result = await importTasks('asana', asanaData);

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].content).toBe('Asana Task');
    });

    it('should detect Asana format', () => {
      const data = JSON.stringify({
        tasks: [{ name: 'Task' }],
      });

      expect(detectImportSource(data)).toBe('asana');
    });
  });

  describe('JSON Direct', () => {
    it('should import JSON with title field', async () => {
      const jsonData = JSON.stringify({
        tasks: [
          {
            content: 'Task 1',
            completed: false,
          },
        ],
        projects: [],
        labels: [],
      });

      const result = await importTasks('json', jsonData);

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].content).toBe('Task 1');
    });
  });

  describe('Statistics', () => {
    it('should calculate import statistics correctly', async () => {
      const data = JSON.stringify({
        tasks: [
          { content: 'Task 1', completed: true },
          { content: 'Task 2', completed: false },
          { content: 'Task 3', completed: true },
        ],
        projects: [{ name: 'Project 1' }],
        labels: [{ name: 'Label 1' }],
      });

      const result = await importTasks('json', data);

      expect(result.stats.totalTasks).toBe(3);
      expect(result.stats.totalProjects).toBe(1);
      expect(result.stats.totalLabels).toBe(1);
      expect(result.stats.completedTasks).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should throw on invalid JSON', async () => {
      expect(async () => {
        await importTasks('json', 'invalid json {');
      }).rejects.toThrow();
    });

    it('should throw on unknown source', async () => {
      expect(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await importTasks('unknown' as any, '{}');
      }).rejects.toThrow('Unknown import source');
    });
  });
});
