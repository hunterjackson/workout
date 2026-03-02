import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInput from './ChatInput';

describe('ChatInput', () => {
  it('should render textarea with placeholder', () => {
    render(<ChatInput onSend={vi.fn()} />);
    expect(screen.getByPlaceholderText(/ask ai/i)).toBeInTheDocument();
  });

  it('should call onSend when send button is clicked', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);

    const input = screen.getByPlaceholderText(/ask ai/i);
    await user.type(input, 'Build me a plan');
    await user.click(screen.getByRole('button'));

    expect(onSend).toHaveBeenCalledWith('Build me a plan');
  });

  it('should clear input after sending', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSend={vi.fn()} />);

    const input = screen.getByPlaceholderText(/ask ai/i) as HTMLTextAreaElement;
    await user.type(input, 'Hello');
    await user.click(screen.getByRole('button'));

    expect(input.value).toBe('');
  });

  it('should not send on Enter key (allows newline)', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);

    const input = screen.getByPlaceholderText(/ask ai/i);
    await user.type(input, 'Test message{Enter}more text');

    expect(onSend).not.toHaveBeenCalled();
  });

  it('should not send empty/whitespace messages', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);

    await user.click(screen.getByRole('button'));
    expect(onSend).not.toHaveBeenCalled();

    const input = screen.getByPlaceholderText(/ask ai/i);
    await user.type(input, '   ');
    await user.click(screen.getByRole('button'));
    expect(onSend).not.toHaveBeenCalled();
  });

  it('should disable input and show spinner when disabled', () => {
    render(<ChatInput onSend={vi.fn()} disabled />);

    const input = screen.getByPlaceholderText(/ask ai/i);
    expect(input).toBeDisabled();

    // Should show spinner (animate-spin class)
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should disable send button when disabled prop is true', () => {
    render(<ChatInput onSend={vi.fn()} disabled />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
