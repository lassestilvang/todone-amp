import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { render, screen, fireEvent } from '@testing-library/react';
import { Plus } from 'lucide-react';
import { FloatingActionButton } from './FloatingActionButton';

describe('FloatingActionButton', () => {
  const mockOnClick = mock();
  const mockMainAction = mock();

  const defaultActions = [
    {
      id: 'add-task',
      label: 'Add Task',
      icon: <Plus size={20} />,
      onClick: mockOnClick,
    },
    {
      id: 'add-project',
      label: 'Add Project',
      icon: <Plus size={20} />,
      onClick: mockOnClick,
    },
  ];

  beforeEach(() => {
    mockOnClick.mockClear();
    mockMainAction.mockClear();
  });

  it('renders main button', () => {
    render(
      <FloatingActionButton
        actions={defaultActions}
        mainLabel="Add"
      />
    );
    const mainButton = screen.getByLabelText('Add');
    expect(mainButton).toBeInTheDocument();
  });

  it('toggles action menu when main button is clicked', () => {
    render(
      <FloatingActionButton
        actions={defaultActions}
        mainLabel="Add"
      />
    );
    const mainButton = screen.getByLabelText('Add');
    
    fireEvent.click(mainButton);
    expect(screen.getByLabelText('Add Task')).toBeInTheDocument();
    
    fireEvent.click(mainButton);
    expect(screen.queryByLabelText('Add Task')).not.toBeInTheDocument();
  });

  it('executes action callback when action button is clicked', () => {
    const onAddTask = mock();
    const actions = [
      {
        id: 'add-task',
        label: 'Add Task',
        icon: <Plus size={20} />,
        onClick: onAddTask,
      },
    ];

    render(
      <FloatingActionButton
        actions={actions}
        mainLabel="Add"
      />
    );
    
    const mainButton = screen.getByLabelText('Add');
    fireEvent.click(mainButton);
    
    const actionButton = screen.getByLabelText('Add Task');
    fireEvent.click(actionButton);
    
    expect(onAddTask).toHaveBeenCalled();
  });

  it('closes menu after action is clicked', () => {
    render(
      <FloatingActionButton
        actions={defaultActions}
        mainLabel="Add"
      />
    );
    
    const mainButton = screen.getByLabelText('Add');
    fireEvent.click(mainButton);
    expect(screen.getByLabelText('Add Task')).toBeInTheDocument();
    
    const actionButton = screen.getByLabelText('Add Task');
    fireEvent.click(actionButton);
    expect(screen.queryByLabelText('Add Task')).not.toBeInTheDocument();
  });

  it('calls mainAction when no actions provided', () => {
    render(
      <FloatingActionButton
        actions={[]}
        mainAction={mockMainAction}
        mainLabel="Add"
      />
    );
    
    const mainButton = screen.getByLabelText('Add');
    fireEvent.click(mainButton);
    expect(mockMainAction).toHaveBeenCalled();
  });

  it('applies position classes correctly', () => {
    const renderResult = render(
      <FloatingActionButton
        actions={defaultActions}
        position="top-left"
      />
    );
    
    const wrapper = renderResult.container.querySelector('.fixed');
    expect(wrapper).toHaveClass('top-6', 'left-6');
  });

  it('applies size classes correctly', () => {
    render(
      <FloatingActionButton
        actions={defaultActions}
        size="lg"
      />
    );
    
    const mainButton = screen.getByLabelText('Add');
    expect(mainButton).toHaveClass('w-16', 'h-16');
  });

  it('rotates main button icon when menu is open', () => {
    render(
      <FloatingActionButton
        actions={defaultActions}
        mainLabel="Add"
      />
    );
    
    const mainButton = screen.getByLabelText('Add');
    expect(mainButton).not.toHaveClass('rotate-45');
    
    fireEvent.click(mainButton);
    expect(mainButton).toHaveClass('rotate-45');
  });

  it('has accessible aria labels', () => {
    render(
      <FloatingActionButton
        actions={defaultActions}
        mainLabel="Add Items"
      />
    );
    
    const mainButton = screen.getByLabelText('Add Items');
    expect(mainButton).toHaveAttribute('aria-label', 'Add Items');
    expect(mainButton).toHaveAttribute('aria-expanded', 'false');
    
    fireEvent.click(mainButton);
    expect(mainButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes menu when backdrop is clicked', () => {
    const renderResult = render(
      <FloatingActionButton
        actions={defaultActions}
        mainLabel="Add"
      />
    );
    
    const mainButton = screen.getByLabelText('Add');
    fireEvent.click(mainButton);
    expect(screen.getByLabelText('Add Task')).toBeInTheDocument();
    
    const backdrop = renderResult.container.querySelector('.fixed.inset-0');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(screen.queryByLabelText('Add Task')).not.toBeInTheDocument();
    }
  });

  it('supports custom colors for actions', () => {
    const actions = [
      {
        id: 'delete',
        label: 'Delete',
        icon: <Plus size={20} />,
        onClick: mock(),
        color: 'danger' as const,
      },
    ];

    render(
      <FloatingActionButton
        actions={actions}
        mainLabel="Add"
      />
    );
    
    const mainButton = screen.getByLabelText('Add');
    fireEvent.click(mainButton);
    
    const deleteButton = screen.getByLabelText('Delete');
    expect(deleteButton).toHaveClass('text-semantic-error', 'bg-semantic-error-light');
  });

  it('applies theme classes correctly', () => {
    render(
      <FloatingActionButton
        actions={defaultActions}
        theme="dark"
      />
    );
    
    const mainButton = screen.getByLabelText('Add');
    expect(mainButton).toHaveClass('bg-surface-primary');
  });

  it('has minimum touch areas of 44px', () => {
    render(
      <FloatingActionButton
        actions={defaultActions}
        size="sm"
      />
    );
    
    const mainButton = screen.getByLabelText('Add');
    fireEvent.click(mainButton);
    const actionButton = screen.getByLabelText('Add Task');
    
    // Action buttons have min touch area requirements
    expect(actionButton).toHaveClass('min-h-[44px]', 'min-w-[44px]');
  });
});
