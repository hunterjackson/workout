import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ScheduleBadges from './ScheduleBadges';

describe('ScheduleBadges', () => {
  it('should render all 7 day labels', () => {
    render(<ScheduleBadges schedule={[]} />);
    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Thu')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
    expect(screen.getByText('Sat')).toBeInTheDocument();
  });

  it('should highlight scheduled days with primary color', () => {
    render(<ScheduleBadges schedule={[1, 3, 5]} />);

    const mon = screen.getByText('Mon');
    const wed = screen.getByText('Wed');
    const fri = screen.getByText('Fri');

    expect(mon.className).toContain('text-primary');
    expect(wed.className).toContain('text-primary');
    expect(fri.className).toContain('text-primary');
  });

  it('should not highlight non-scheduled days', () => {
    render(<ScheduleBadges schedule={[1]} />);

    const tue = screen.getByText('Tue');
    const sun = screen.getByText('Sun');

    expect(tue.className).toContain('text-text-muted');
    expect(sun.className).toContain('text-text-muted');
  });

  it('should handle empty schedule', () => {
    render(<ScheduleBadges schedule={[]} />);

    const allBadges = screen.getAllByText(/Sun|Mon|Tue|Wed|Thu|Fri|Sat/);
    allBadges.forEach((badge) => {
      expect(badge.className).toContain('text-text-muted');
    });
  });

  it('should handle all days scheduled', () => {
    render(<ScheduleBadges schedule={[0, 1, 2, 3, 4, 5, 6]} />);

    const allBadges = screen.getAllByText(/Sun|Mon|Tue|Wed|Thu|Fri|Sat/);
    allBadges.forEach((badge) => {
      expect(badge.className).toContain('text-primary');
    });
  });
});
