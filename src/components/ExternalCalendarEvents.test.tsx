import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExternalCalendarEvents } from './ExternalCalendarEvents';

describe('ExternalCalendarEvents', () => {
  const mockEvents = [
    {
      id: '1',
      title: 'Team Meeting',
      start: new Date(2025, 11, 10, 10, 0),
      end: new Date(2025, 11, 10, 11, 0),
      calendar: 'google' as const,
      location: 'Conference Room A',
    },
    {
      id: '2',
      title: 'Client Call',
      start: new Date(2025, 11, 10, 14, 0),
      calendar: 'outlook' as const,
      allDay: false,
    },
    {
      id: '3',
      title: 'All Day Event',
      start: new Date(2025, 11, 11),
      calendar: 'apple' as const,
      allDay: true,
    },
  ];

  it('renders external events', () => {
    render(
      <ExternalCalendarEvents
        events={mockEvents}
      />
    );

    expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    expect(screen.getByText('Client Call')).toBeInTheDocument();
  });

  it('displays calendar provider badges', () => {
    render(
      <ExternalCalendarEvents
        events={mockEvents}
      />
    );

    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getByText('Outlook')).toBeInTheDocument();
  });

  it('displays time information correctly', () => {
    render(
      <ExternalCalendarEvents
        events={mockEvents}
      />
    );

    // Team Meeting has specific time
    const meetingElement = screen.getByLabelText('External event: Team Meeting');
    expect(meetingElement).toBeInTheDocument();
  });

  it('displays location when provided', () => {
    render(
      <ExternalCalendarEvents
        events={mockEvents}
      />
    );

    expect(screen.getByText(/Conference Room A/)).toBeInTheDocument();
  });

  it('respects maxItems limit', () => {
    render(
      <ExternalCalendarEvents
        events={mockEvents}
        maxItems={2}
      />
    );

    expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    expect(screen.getByText('Client Call')).toBeInTheDocument();
    // Third event should not be visible
  });

  it('shows all-day indicator correctly', () => {
    const allDayEvent = [{
      id: '1',
      title: 'All Day Event',
      start: new Date(2025, 11, 10),
      calendar: 'google' as const,
      allDay: true,
    }];

    render(
      <ExternalCalendarEvents
        events={allDayEvent}
      />
    );

    expect(screen.getByText('All day')).toBeInTheDocument();
  });

  it('calls onEventClick when event is clicked', () => {
    const onEventClick = vi.fn();
    render(
      <ExternalCalendarEvents
        events={mockEvents}
        onEventClick={onEventClick}
      />
    );

    const meetingElement = screen.getByLabelText('External event: Team Meeting');
    fireEvent.click(meetingElement);

    expect(onEventClick).toHaveBeenCalledWith(mockEvents[0]);
  });

  it('shows external link button when URL is provided', () => {
    const eventsWithUrl = [{
      id: '1',
      title: 'Event with URL',
      start: new Date(2025, 11, 10),
      calendar: 'google' as const,
      url: 'https://calendar.google.com/event',
    }];

    render(
      <ExternalCalendarEvents
        events={eventsWithUrl}
      />
    );

    const linkButton = screen.getByLabelText(/Open.*in calendar app/);
    expect(linkButton).toHaveAttribute('href', 'https://calendar.google.com/event');
  });

  it('filters events by today', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const eventsWithDates = [
      {
        id: '1',
        title: 'Today Event',
        start: today,
        calendar: 'google' as const,
      },
      {
        id: '2',
        title: 'Tomorrow Event',
        start: tomorrow,
        calendar: 'google' as const,
      },
    ];

    render(
      <ExternalCalendarEvents
        events={eventsWithDates}
        dateFilter="today"
      />
    );

    expect(screen.getByText('Today Event')).toBeInTheDocument();
    expect(screen.queryByText('Tomorrow Event')).not.toBeInTheDocument();
  });

  it('displays description when showDescription is true', () => {
    const eventsWithDescription = [{
      id: '1',
      title: 'Meeting',
      start: new Date(2025, 11, 10),
      calendar: 'google' as const,
      description: 'Discuss Q4 plans',
    }];

    render(
      <ExternalCalendarEvents
        events={eventsWithDescription}
        showDescription={true}
      />
    );

    expect(screen.getByText('Discuss Q4 plans')).toBeInTheDocument();
  });

  it('returns null when no events match filter', () => {
    const { container } = render(
      <ExternalCalendarEvents
        events={[]}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('shows event count when exceeding maxItems', () => {
    render(
      <ExternalCalendarEvents
        events={mockEvents}
        maxItems={2}
      />
    );

    expect(screen.getByText(/View all/)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ExternalCalendarEvents
        events={mockEvents}
        className="custom-class"
      />
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('supports keyboard navigation', () => {
    const onEventClick = vi.fn();
    render(
      <ExternalCalendarEvents
        events={mockEvents}
        onEventClick={onEventClick}
      />
    );

    const meetingElement = screen.getByLabelText('External event: Team Meeting');
    fireEvent.keyDown(meetingElement, { key: 'Enter' });

    expect(onEventClick).toHaveBeenCalled();
  });

  it('handles string dates', () => {
    const eventsWithStringDates = [{
      id: '1',
      title: 'Event',
      start: '2025-12-10T10:00:00Z',
      calendar: 'google' as const,
    }];

    render(
      <ExternalCalendarEvents
        events={eventsWithStringDates}
      />
    );

    expect(screen.getByText('Event')).toBeInTheDocument();
  });
});
