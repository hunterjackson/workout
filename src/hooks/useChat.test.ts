import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { db } from '../lib/db';
import { resetDb, makePlan } from '../test/helpers';

// Mock the chat-client module
const mockSendMessage = vi.fn();
vi.mock('../lib/chat-client', () => ({
  sendMessage: (...args: unknown[]) => mockSendMessage(...args),
}));

const { useChat } = await import('./useChat');

describe('useChat', () => {
  let planId: string;

  beforeEach(async () => {
    await resetDb();
    vi.clearAllMocks();

    const plan = makePlan();
    await db.plans.add(plan);
    planId = plan.id;
  });

  it('should not duplicate user message when calling sendMessage', async () => {
    // Bug: useChat saves the user message to DB, fetches all messages
    // (including the just-saved one), then passes them to sendMessage()
    // which appends the user message AGAIN via the userMessage parameter.
    // This means the user's message appears twice in the API call.

    mockSendMessage.mockResolvedValueOnce({
      message: 'Got it!',
      mutations: [],
    });

    const { result } = renderHook(() => useChat(planId));

    await act(async () => {
      await result.current.send('Hello trainer');
    });

    // sendMessage is called with (planId, chatHistory, userMessage)
    // The chatHistory should NOT include the current user message,
    // since it's passed separately as userMessage
    const [, chatHistory, userMessage] = mockSendMessage.mock.calls[0];
    expect(userMessage).toBe('Hello trainer');

    // The chat history should not contain the message we're currently sending
    const userMessagesInHistory = chatHistory.filter(
      (m: { content: string }) => m.content === 'Hello trainer'
    );
    expect(userMessagesInHistory).toHaveLength(0);
  });
});
