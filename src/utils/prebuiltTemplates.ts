import type { Template } from '@/types'

const SYSTEM_USER_ID = 'system-templates'

export const PREBUILT_TEMPLATES: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Work templates
  {
    name: 'Project Planning',
    description: 'Comprehensive project planning template with phases and deliverables',
    category: 'work',
    isPrebuilt: true,
    ownerId: SYSTEM_USER_ID,
    usageCount: 0,
    data: {
      sections: [
        {
          name: 'Planning',
          tasks: [
            { content: 'Define project scope and goals', priority: 'p1' },
            { content: 'Identify stakeholders', priority: 'p2' },
            { content: 'Create project timeline', priority: 'p1' },
            { content: 'Allocate resources', priority: 'p2' },
          ],
        },
        {
          name: 'Execution',
          tasks: [
            { content: 'Kick-off meeting', priority: 'p1' },
            { content: 'Set up project tools', priority: 'p2' },
            { content: 'Communicate timeline to team', priority: 'p2' },
          ],
        },
        {
          name: 'Monitoring',
          tasks: [
            { content: 'Weekly status meetings', priority: 'p2' },
            { content: 'Track progress vs timeline', priority: 'p2' },
            { content: 'Manage risks and issues', priority: 'p1' },
          ],
        },
        {
          name: 'Closure',
          tasks: [
            { content: 'Final deliverable review', priority: 'p1' },
            { content: 'Stakeholder sign-off', priority: 'p1' },
            { content: 'Team retrospective', priority: 'p2' },
            { content: 'Project documentation', priority: 'p3' },
          ],
        },
      ],
    },
  },
  {
    name: 'Sprint Planning',
    description: 'Two-week agile sprint template',
    category: 'work',
    isPrebuilt: true,
    ownerId: SYSTEM_USER_ID,
    usageCount: 0,
    data: {
      sections: [
        {
          name: 'Sprint Prep',
          tasks: [
            { content: 'Review backlog', priority: 'p1' },
            { content: 'Sprint planning meeting', priority: 'p1' },
            { content: 'Assign user stories', priority: 'p1' },
          ],
        },
        {
          name: 'Development',
          tasks: [
            { content: 'Daily standup', priority: 'p2' },
            { content: 'Code development', priority: 'p1' },
            { content: 'Code review', priority: 'p2' },
          ],
        },
        {
          name: 'Testing',
          tasks: [
            { content: 'QA testing', priority: 'p1' },
            { content: 'Bug fixes', priority: 'p2' },
            { content: 'Regression testing', priority: 'p2' },
          ],
        },
        {
          name: 'Sprint Close',
          tasks: [
            { content: 'Sprint review', priority: 'p1' },
            { content: 'Sprint retrospective', priority: 'p1' },
            { content: 'Update documentation', priority: 'p3' },
          ],
        },
      ],
    },
  },
  {
    name: 'Meeting Preparation',
    description: 'Prepare for important meetings with structured agenda',
    category: 'management',
    isPrebuilt: true,
    ownerId: SYSTEM_USER_ID,
    usageCount: 0,
    data: {
      sections: [
        {
          name: 'Before Meeting',
          tasks: [
            { content: 'Set meeting objectives', priority: 'p1' },
            { content: 'Create agenda', priority: 'p1' },
            { content: 'Gather supporting documents', priority: 'p2' },
            { content: 'Send agenda to attendees', priority: 'p2' },
          ],
        },
        {
          name: 'During Meeting',
          tasks: [
            { content: 'Start with objectives review', priority: 'p1' },
            { content: 'Follow agenda', priority: 'p2' },
            { content: 'Take notes', priority: 'p2' },
            { content: 'Capture action items', priority: 'p1' },
          ],
        },
        {
          name: 'After Meeting',
          tasks: [
            { content: 'Send meeting notes', priority: 'p1' },
            { content: 'Distribute action items', priority: 'p1' },
            { content: 'Schedule follow-ups', priority: 'p2' },
          ],
        },
      ],
    },
  },
  // Personal templates
  {
    name: 'Grocery Shopping',
    description: 'Organized grocery list by category',
    category: 'personal',
    isPrebuilt: true,
    ownerId: SYSTEM_USER_ID,
    usageCount: 0,
    data: {
      sections: [
        {
          name: 'Produce',
          tasks: [
            { content: 'Tomatoes', priority: null },
            { content: 'Lettuce', priority: null },
            { content: 'Carrots', priority: null },
          ],
        },
        {
          name: 'Dairy',
          tasks: [
            { content: 'Milk', priority: null },
            { content: 'Cheese', priority: null },
            { content: 'Yogurt', priority: null },
          ],
        },
        {
          name: 'Pantry',
          tasks: [
            { content: 'Rice', priority: null },
            { content: 'Pasta', priority: null },
            { content: 'Canned goods', priority: null },
          ],
        },
      ],
    },
  },
  {
    name: 'Trip Planning',
    description: 'Complete travel planning checklist',
    category: 'personal',
    isPrebuilt: true,
    ownerId: SYSTEM_USER_ID,
    usageCount: 0,
    data: {
      sections: [
        {
          name: 'Before Trip',
          tasks: [
            { content: 'Book flights', priority: 'p1' },
            { content: 'Reserve accommodation', priority: 'p1' },
            { content: 'Check passport expiration', priority: 'p1' },
            { content: 'Research destinations', priority: 'p2' },
            { content: 'Create packing list', priority: 'p2' },
          ],
        },
        {
          name: 'Arrangements',
          tasks: [
            { content: 'Arrange ground transportation', priority: 'p2' },
            { content: 'Book tours/activities', priority: 'p3' },
            { content: 'Make restaurant reservations', priority: 'p3' },
            { content: 'Purchase travel insurance', priority: 'p2' },
          ],
        },
        {
          name: 'Packing',
          tasks: [
            { content: 'Clothes', priority: 'p1' },
            { content: 'Toiletries', priority: 'p1' },
            { content: 'Electronics', priority: 'p1' },
            { content: 'Documents', priority: 'p1' },
          ],
        },
        {
          name: 'Day Before',
          tasks: [
            { content: 'Confirm flights', priority: 'p1' },
            { content: 'Confirm hotel', priority: 'p1' },
            { content: 'Set out luggage', priority: 'p2' },
            { content: 'Prepare documents', priority: 'p1' },
          ],
        },
      ],
    },
  },
  // Education templates
  {
    name: 'Course Planning',
    description: 'Organize a new course with modules and assignments',
    category: 'education',
    isPrebuilt: true,
    ownerId: SYSTEM_USER_ID,
    usageCount: 0,
    data: {
      sections: [
        {
          name: 'Course Setup',
          tasks: [
            { content: 'Define learning objectives', priority: 'p1' },
            { content: 'Create course outline', priority: 'p1' },
            { content: 'Gather resources', priority: 'p2' },
          ],
        },
        {
          name: 'Module 1',
          tasks: [
            { content: 'Create lessons', priority: 'p1' },
            { content: 'Prepare assignments', priority: 'p2' },
            { content: 'Record videos', priority: 'p2' },
          ],
        },
        {
          name: 'Assessment',
          tasks: [
            { content: 'Design quizzes', priority: 'p2' },
            { content: 'Create rubrics', priority: 'p2' },
            { content: 'Plan final exam', priority: 'p1' },
          ],
        },
      ],
    },
  },
  {
    name: 'Research Paper',
    description: 'Structure for writing research papers',
    category: 'education',
    isPrebuilt: true,
    ownerId: SYSTEM_USER_ID,
    usageCount: 0,
    data: {
      sections: [
        {
          name: 'Research',
          tasks: [
            { content: 'Choose topic', priority: 'p1' },
            { content: 'Gather sources', priority: 'p1' },
            { content: 'Read and annotate', priority: 'p2' },
            { content: 'Create bibliography', priority: 'p2' },
          ],
        },
        {
          name: 'Writing',
          tasks: [
            { content: 'Create outline', priority: 'p1' },
            { content: 'Write introduction', priority: 'p1' },
            { content: 'Write main sections', priority: 'p1' },
            { content: 'Write conclusion', priority: 'p2' },
          ],
        },
        {
          name: 'Editing',
          tasks: [
            { content: 'Proofread', priority: 'p1' },
            { content: 'Check citations', priority: 'p2' },
            { content: 'Format document', priority: 'p2' },
            { content: 'Final review', priority: 'p1' },
          ],
        },
      ],
    },
  },
  // Marketing templates
  {
    name: 'Campaign Launch',
    description: 'Marketing campaign launch checklist',
    category: 'marketing',
    isPrebuilt: true,
    ownerId: SYSTEM_USER_ID,
    usageCount: 0,
    data: {
      sections: [
        {
          name: 'Planning',
          tasks: [
            { content: 'Define campaign goals', priority: 'p1' },
            { content: 'Identify target audience', priority: 'p1' },
            { content: 'Create campaign concept', priority: 'p1' },
            { content: 'Set budget', priority: 'p2' },
          ],
        },
        {
          name: 'Content Creation',
          tasks: [
            { content: 'Write copy', priority: 'p1' },
            { content: 'Design graphics', priority: 'p1' },
            { content: 'Create videos', priority: 'p2' },
            { content: 'Prepare assets', priority: 'p1' },
          ],
        },
        {
          name: 'Execution',
          tasks: [
            { content: 'Schedule posts', priority: 'p1' },
            { content: 'Launch ads', priority: 'p1' },
            { content: 'Monitor performance', priority: 'p2' },
            { content: 'Engage with audience', priority: 'p2' },
          ],
        },
        {
          name: 'Analysis',
          tasks: [
            { content: 'Analyze metrics', priority: 'p2' },
            { content: 'Generate report', priority: 'p2' },
            { content: 'Document learnings', priority: 'p3' },
          ],
        },
      ],
    },
  },
  // Support/management templates
  {
    name: 'Bug Triage',
    description: 'Process for triaging and prioritizing bugs',
    category: 'support',
    isPrebuilt: true,
    ownerId: SYSTEM_USER_ID,
    usageCount: 0,
    data: {
      sections: [
        {
          name: 'Intake',
          tasks: [
            { content: 'Collect bug report', priority: 'p1' },
            { content: 'Verify reproducibility', priority: 'p1' },
            { content: 'Add to tracking system', priority: 'p2' },
          ],
        },
        {
          name: 'Assessment',
          tasks: [
            { content: 'Assess severity', priority: 'p1' },
            { content: 'Assess impact', priority: 'p1' },
            { content: 'Assign priority', priority: 'p1' },
            { content: 'Assign team member', priority: 'p2' },
          ],
        },
        {
          name: 'Resolution',
          tasks: [
            { content: 'Investigate root cause', priority: 'p1' },
            { content: 'Develop fix', priority: 'p1' },
            { content: 'Test fix', priority: 'p1' },
            { content: 'Close ticket', priority: 'p2' },
          ],
        },
      ],
    },
  },
  {
    name: 'Customer Onboarding',
    description: 'Onboard new customers with structured process',
    category: 'support',
    isPrebuilt: true,
    ownerId: SYSTEM_USER_ID,
    usageCount: 0,
    data: {
      sections: [
        {
          name: 'Welcome',
          tasks: [
            { content: 'Send welcome email', priority: 'p1' },
            { content: 'Schedule kick-off call', priority: 'p1' },
            { content: 'Provide documentation', priority: 'p2' },
          ],
        },
        {
          name: 'Setup',
          tasks: [
            { content: 'Create account', priority: 'p1' },
            { content: 'Configure settings', priority: 'p1' },
            { content: 'Provide training', priority: 'p2' },
          ],
        },
        {
          name: 'Support',
          tasks: [
            { content: 'Assign account manager', priority: 'p1' },
            { content: 'Set up communication channel', priority: 'p2' },
            { content: 'Schedule check-ins', priority: 'p2' },
          ],
        },
      ],
    },
  },
  // Health templates
  {
    name: 'Fitness Plan',
    description: 'Weekly fitness and exercise plan',
    category: 'health',
    isPrebuilt: true,
    ownerId: SYSTEM_USER_ID,
    usageCount: 0,
    data: {
      sections: [
        {
          name: 'Cardio',
          tasks: [
            { content: 'Monday - Running', priority: 'p2' },
            { content: 'Wednesday - Swimming', priority: 'p2' },
            { content: 'Friday - Cycling', priority: 'p2' },
          ],
        },
        {
          name: 'Strength',
          tasks: [
            { content: 'Tuesday - Upper body', priority: 'p2' },
            { content: 'Thursday - Lower body', priority: 'p2' },
            { content: 'Saturday - Full body', priority: 'p2' },
          ],
        },
        {
          name: 'Recovery',
          tasks: [
            { content: 'Stretching - Daily', priority: 'p3' },
            { content: 'Yoga - Sunday', priority: 'p3' },
            { content: 'Sleep 8 hours', priority: 'p2' },
          ],
        },
      ],
    },
  },
  // Finance templates
  {
    name: 'Monthly Budget Review',
    description: 'Review and plan monthly budget',
    category: 'finance',
    isPrebuilt: true,
    ownerId: SYSTEM_USER_ID,
    usageCount: 0,
    data: {
      sections: [
        {
          name: 'Income',
          tasks: [
            { content: 'Record salary', priority: 'p1' },
            { content: 'Record bonus/side income', priority: 'p2' },
            { content: 'Verify total income', priority: 'p1' },
          ],
        },
        {
          name: 'Expenses',
          tasks: [
            { content: 'Housing', priority: 'p1' },
            { content: 'Utilities', priority: 'p1' },
            { content: 'Food and groceries', priority: 'p1' },
            { content: 'Transportation', priority: 'p2' },
            { content: 'Entertainment', priority: 'p3' },
          ],
        },
        {
          name: 'Savings',
          tasks: [
            { content: 'Emergency fund', priority: 'p1' },
            { content: 'Investment', priority: 'p2' },
            { content: 'Retirement', priority: 'p1' },
          ],
        },
        {
          name: 'Review',
          tasks: [
            { content: 'Compare to budget', priority: 'p1' },
            { content: 'Identify variances', priority: 'p2' },
            { content: 'Plan adjustments', priority: 'p2' },
          ],
        },
      ],
    },
  },
]

/**
 * Seed prebuilt templates to database
 */
export async function seedPrebuiltTemplates(): Promise<void> {
  const { db } = await import('@/db/database')

  // Check if templates already exist
  const count = await db.templates.count()
  if (count > 0) return

  const now = new Date()
  const templates = PREBUILT_TEMPLATES.map((template) => ({
    ...template,
    id: `template-prebuilt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  }))

  await db.templates.bulkAdd(templates)
}
