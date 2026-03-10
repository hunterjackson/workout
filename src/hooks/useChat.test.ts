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
    mockSendMessage.mockResolvedValueOnce({
      message: 'Got it!',
      mutations: [],
    });

    const { result } = renderHook(() => useChat(planId));

    await act(async () => {
      await result.current.send('Hello trainer');
    });

    const [, chatHistory, userMessage] = mockSendMessage.mock.calls[0];
    expect(userMessage).toBe('Hello trainer');

    const userMessagesInHistory = chatHistory.filter(
      (m: { content: string }) => m.content === 'Hello trainer'
    );
    expect(userMessagesInHistory).toHaveLength(0);
  });

  it('should pass plan model to sendMessage', async () => {
    await resetDb();
    const plan = makePlan({ model: 'claude-haiku-4-5' });
    await db.plans.add(plan);

    mockSendMessage.mockResolvedValueOnce({
      message: 'Response',
      mutations: [],
    });

    const { result } = renderHook(() => useChat(plan.id));

    await act(async () => {
      await result.current.send('Hi');
    });

    const [, , , model] = mockSendMessage.mock.calls[0];
    expect(model).toBe('claude-haiku-4-5');
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

  it('should default to planning mode', () => {
    const { result } = renderHook(() => useChat(planId));
    expect(result.current.mode).toBe('planning');
  });

  it('should toggle between planning and updating modes', () => {
    const { result } = renderHook(() => useChat(planId));

    expect(result.current.mode).toBe('planning');

    act(() => {
      result.current.toggleMode();
    });
    expect(result.current.mode).toBe('updating');

    act(() => {
      result.current.toggleMode();
    });
    expect(result.current.mode).toBe('planning');
  });

  it('should pass current mode to sendMessage', async () => {
    mockSendMessage.mockResolvedValueOnce({
      message: 'Planning response',
      mutations: [],
    });

    const { result } = renderHook(() => useChat(planId));

    await act(async () => {
      await result.current.send('Build me a plan');
    });

    // 5th argument is the mode
    const mode = mockSendMessage.mock.calls[0][4];
    expect(mode).toBe('planning');
  });

  it('should pass updating mode to sendMessage when toggled', async () => {
    mockSendMessage.mockResolvedValueOnce({
      message: 'Done!',
      mutations: [],
    });

    const { result } = renderHook(() => useChat(planId));

    act(() => {
      result.current.toggleMode();
    });

    await act(async () => {
      await result.current.send('Create it');
    });

    const mode = mockSendMessage.mock.calls[0][4];
    expect(mode).toBe('updating');
  });
});
