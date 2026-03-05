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

  it('should pass plan model to sendMessage', async () => {
    // Clear and recreate plan with a model
    await resetDb();
    const plan = makePlan({ model: 'claude-haiku-4-5-20251001' });
    await db.plans.add(plan);

    mockSendMessage.mockResolvedValueOnce({
      message: 'Response',
      mutations: [],
    });

    const { result } = renderHook(() => useChat(plan.id));

    await act(async () => {
      await result.current.send('Hi');
    });

    // sendMessage is called with (planId, chatHistory, userMessage, model)
    const [, , , model] = mockSendMessage.mock.calls[0];
    expect(model).toBe('claude-haiku-4-5-20251001');
  });

  it('should pass undefined model when plan has no model set', async () => {
    mockSendMessage.mockResolvedValueOnce({
      message: 'Response',
      mutations: [],
    });

    const { result } = renderHook(() => useChat(planId));

    await act(async () => {
      await result.current.send('Hi');
    });

    const [, , , model] = mockSendMessage.mock.calls[0];
    expect(model).toBeUndefined();
  });

  it('should pass onToolCalls callback to sendMessage', async () => {
    mockSendMessage.mockResolvedValueOnce({
      message: 'Done!',
      mutations: [],
    });

    const { result } = renderHook(() => useChat(planId));

    await act(async () => {
      await result.current.send('Create a routine');
    });

    // sendMessage should receive an onToolCalls callback as the 5th argument
    const onToolCalls = mockSendMessage.mock.calls[0][4];
    expect(onToolCalls).toBeTypeOf('function');
  });

  it('should set pendingReview when onToolCalls is called', async () => {
    // Make sendMessage call the onToolCalls callback
    mockSendMessage.mockImplementation(
      async (_planId: string, _history: unknown[], _msg: string, _model: string | undefined, onToolCalls: (calls: unknown[]) => Promise<boolean>) => {
        // Simulate Claude proposing tool calls
        const proposed = [
          { id: 'tool-1', name: 'create_routine', input: { name: 'Leg Day', schedule: [2] }, description: 'Create routine "Leg Day"' },
        ];
        // Call the callback but don't await yet - we'll resolve it later
        const reviewPromise = onToolCalls(proposed);
        // For this test, we'll auto-approve to let the flow complete
        // But first check that pendingReview is set
        // We can't easily check intermediate state here, so just approve
        await reviewPromise;
        return { message: 'Created!', mutations: [] };
      }
    );

    const { result } = renderHook(() => useChat(planId));

    // We need to test the intermediate state when pendingReview is set.
    // The trick: make the callback NOT resolve immediately.
    mockSendMessage.mockImplementation(
      async (_planId: string, _history: unknown[], _msg: string, _model: string | undefined, onToolCalls: (calls: unknown[]) => Promise<boolean>) => {
        const proposed = [
          { id: 'tool-1', name: 'create_routine', input: { name: 'Leg Day', schedule: [2] }, description: 'Create routine "Leg Day"' },
        ];
        const approved = await onToolCalls(proposed);
        return { message: approved ? 'Created!' : 'OK, cancelled.', mutations: [] };
      }
    );

    // Start sending but don't await (it will block on review)
    let sendPromise: Promise<void>;
    act(() => {
      sendPromise = result.current.send('Create leg day');
    });

    // Wait for the hook to update state with pendingReview
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(result.current.pendingReview).not.toBeNull();
    expect(result.current.pendingReview).toHaveLength(1);
    expect(result.current.pendingReview![0].name).toBe('create_routine');

    // Approve changes
    await act(async () => {
      result.current.approveChanges();
    });

    // Wait for sendMessage to complete
    await act(async () => {
      await sendPromise!;
    });

    expect(result.current.pendingReview).toBeNull();
  });

  it('should clear pendingReview when changes are rejected', async () => {
    mockSendMessage.mockImplementation(
      async (_planId: string, _history: unknown[], _msg: string, _model: string | undefined, onToolCalls: (calls: unknown[]) => Promise<boolean>) => {
        const proposed = [
          { id: 'tool-1', name: 'create_routine', input: { name: 'Push Day', schedule: [1] }, description: 'Create routine "Push Day"' },
        ];
        const approved = await onToolCalls(proposed);
        return { message: approved ? 'Done!' : 'OK, cancelled.', mutations: [] };
      }
    );

    const { result } = renderHook(() => useChat(planId));

    let sendPromise: Promise<void>;
    act(() => {
      sendPromise = result.current.send('Create push day');
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(result.current.pendingReview).not.toBeNull();

    // Reject changes with feedback
    await act(async () => {
      result.current.rejectChanges('Too many exercises');
    });

    await act(async () => {
      await sendPromise!;
    });

    expect(result.current.pendingReview).toBeNull();
  });
});
