import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatModeToggle from './ChatModeToggle';

describe('ChatModeToggle', () => {
  it('should show planning mode as active when mode is planning', () => {
    render(<ChatModeToggle mode="planning" onToggle={vi.fn()} />);
    const planningButton = screen.getByRole('button', { name: /planning/i });
    expect(planningButton.className).toContain('bg-primary');
  });

  it('should show updating mode as active when mode is updating', () => {
    render(<ChatModeToggle mode="updating" onToggle={vi.fn()} />);
    const updatingButton = screen.getByRole('button', { name: /updating/i });
    expect(updatingButton.className).toContain('bg-primary');
  });

  it('should call onToggle when inactive mode button is clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(<ChatModeToggle mode="planning" onToggle={onToggle} />);

    await user.click(screen.getByRole('button', { name: /updating/i }));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('should not call onToggle when active mode button is clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(<ChatModeToggle mode="planning" onToggle={onToggle} />);

    await user.click(screen.getByRole('button', { name: /planning/i }));
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<ChatModeToggle mode="planning" onToggle={vi.fn()} disabled />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });
});
