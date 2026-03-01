import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChatBubble from './ChatBubble';
import type { ChatMessage } from '../lib/types';

function makeMsg(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: 'msg-1',
    planId: 'plan-1',
    role: 'user',
    content: 'Hello',
    createdAt: Date.now(),
    ...overrides,
  };
}

describe('ChatBubble', () => {
  it('should render user message content', () => {
    render(<ChatBubble message={makeMsg({ content: 'Build me a plan' })} />);
    expect(screen.getByText('Build me a plan')).toBeInTheDocument();
  });

  it('should render assistant message content', () => {
    render(<ChatBubble message={makeMsg({ role: 'assistant', content: 'Here is your plan!' })} />);
    expect(screen.getByText('Here is your plan!')).toBeInTheDocument();
  });

  it('should align user messages to the right', () => {
    const { container } = render(<ChatBubble message={makeMsg()} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('justify-end');
  });

  it('should align assistant messages to the left', () => {
    const { container } = render(<ChatBubble message={makeMsg({ role: 'assistant' })} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('justify-start');
  });

  it('should style user messages with primary color', () => {
    const { container } = render(<ChatBubble message={makeMsg()} />);
    const bubble = container.querySelector('.bg-primary');
    expect(bubble).toBeInTheDocument();
  });

  it('should style error messages with danger color', () => {
    const { container } = render(
      <ChatBubble message={makeMsg({ role: 'assistant', content: 'Error: Something failed' })} />
    );
    const bubble = container.querySelector('[class*="text-danger"]');
    expect(bubble).toBeInTheDocument();
  });

  it('should show formatted timestamp', () => {
    const timestamp = new Date(2025, 5, 15, 14, 30).getTime();
    render(<ChatBubble message={makeMsg({ createdAt: timestamp })} />);
    // The time format depends on locale, just check something is rendered
    const timeEl = screen.getByText(/\d{1,2}:\d{2}/);
    expect(timeEl).toBeInTheDocument();
  });
});
