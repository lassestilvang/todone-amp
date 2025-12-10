import { describe, it, expect, beforeEach } from 'vitest'
import { useSectionStore } from '@/store/sectionStore'

describe('sectionStore', () => {
  beforeEach(() => {
    useSectionStore.setState({
      sections: [],
    })
  })

  it('should get sections by project', () => {
    // Manually add sections
    useSectionStore.setState({
      sections: [
        {
          id: 'section-1',
          projectId: 'project-1',
          name: 'To Do',
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'section-2',
          projectId: 'project-2',
          name: 'Doing',
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    })

    const sections = useSectionStore.getState().getSectionsByProject('project-1')
    expect(sections).toHaveLength(1)
    expect(sections[0].projectId).toBe('project-1')
  })

  it('should filter sections by project correctly', () => {
    useSectionStore.setState({
      sections: [
        {
          id: 'section-1',
          projectId: 'project-1',
          name: 'Section 1',
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'section-2',
          projectId: 'project-1',
          name: 'Section 2',
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'section-3',
          projectId: 'project-2',
          name: 'Section 3',
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    })

    const project1Sections = useSectionStore.getState().getSectionsByProject('project-1')
    expect(project1Sections).toHaveLength(2)
    expect(project1Sections.every((s) => s.projectId === 'project-1')).toBe(true)

    const project2Sections = useSectionStore.getState().getSectionsByProject('project-2')
    expect(project2Sections).toHaveLength(1)
    expect(project2Sections[0].projectId).toBe('project-2')
  })

  it('should maintain sections state', () => {
    const newSections = [
      {
        id: 'sec-1',
        projectId: 'proj-1',
        name: 'New Section',
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    useSectionStore.setState({
      sections: newSections,
    })

    const state = useSectionStore.getState()
    expect(state.sections).toEqual(newSections)
    expect(state.sections[0].name).toBe('New Section')
  })

  it('should clear sections', () => {
    useSectionStore.setState({
      sections: [
        {
          id: 'section-1',
          projectId: 'project-1',
          name: 'To Do',
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    })

    useSectionStore.setState({ sections: [] })

    const state = useSectionStore.getState()
    expect(state.sections).toHaveLength(0)
  })
})
