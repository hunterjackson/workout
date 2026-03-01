import { describe, it, expect, beforeEach, vi } from 'vitest';
import { db } from './db';
import { resetDb, makePlan, makeRoutine, makeExercise, makeChatMessage } from '../test/helpers';

// Mock the Anthropic SDK with a proper constructor
const mockCreate = vi.fn();
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      messages = { create: mockCreate };
    },
  };
});

// Must import after mock setup
const { sendMessage } = await import('./chat-client');

describe('sendMessage', () => {
  let planId: string;

  beforeEach(async () => {
    await resetDb();
    vi.clearAllMocks();
    localStorage.clear();

    const plan = makePlan({ name: 'Test Plan' });
    await db.plans.add(plan);
    planId = plan.id;
  });

  it('should throw if no API key is set', async () => {
    await expect(sendMessage(planId, [], 'Hello')).rejects.toThrow('No API key set');
  });

  it('should return text response from Claude', async () => {
    localStorage.setItem('anthropic_api_key', 'sk-test-key');

    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Here is your workout plan!' }],
      stop_reason: 'end_turn',
    });

    const response = await sendMessage(planId, [], 'Build me a plan');
    expect(response.message).toBe('Here is your workout plan!');
    expect(response.mutations).toHaveLength(0);
  });

  it('should pass tools and system prompt to Claude', async () => {
    localStorage.setItem('anthropic_api_key', 'sk-test-key');
    localStorage.setItem('preferred_unit', 'kg');

    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Response' }],
      stop_reason: 'end_turn',
    });

    await sendMessage(planId, [], 'Hello');

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        tools: expect.any(Array),
        system: expect.stringContaining('kg'),
        messages: expect.any(Array),
      })
    );
  });

  it('should include chat history as messages', async () => {
    localStorage.setItem('anthropic_api_key', 'sk-test-key');

    const history = [
      makeChatMessage(planId, { role: 'user', content: 'First message', createdAt: 1000 }),
      makeChatMessage(planId, { role: 'assistant', content: 'Reply', createdAt: 2000 }),
    ];

    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'New reply' }],
      stop_reason: 'end_turn',
    });

    await sendMessage(planId, history, 'Second message');

    const callArgs = mockCreate.mock.calls[0][0];
    // history (2) + new user message (1) = 3
    expect(callArgs.messages).toHaveLength(3);
    expect(callArgs.messages[0]).toEqual({ role: 'user', content: 'First message' });
    expect(callArgs.messages[1]).toEqual({ role: 'assistant', content: 'Reply' });
    expect(callArgs.messages[2]).toEqual({ role: 'user', content: 'Second message' });
  });

  it('should handle tool use and execute tool calls', async () => {
    localStorage.setItem('anthropic_api_key', 'sk-test-key');

    const routine = makeRoutine(planId, { name: 'Existing Routine' });
    await db.routines.add(routine);

    // First call: Claude responds with a tool use
    mockCreate.mockResolvedValueOnce({
      content: [
        { type: 'text', text: 'Let me create that for you.' },
        {
          type: 'tool_use',
          id: 'tool-call-1',
          name: 'create_routine',
          input: { name: 'Leg Day', schedule: [2, 4] },
        },
      ],
      stop_reason: 'tool_use',
    });

    // Second call: Claude provides final response after tool result
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Done! I created Leg Day.' }],
      stop_reason: 'end_turn',
    });

    const response = await sendMessage(planId, [], 'Add a leg day');

    expect(response.message).toContain('Let me create that for you.');
    expect(response.message).toContain('Done! I created Leg Day.');
    expect(response.mutations).toHaveLength(1);
    expect(response.mutations[0].success).toBe(true);
    expect(response.mutations[0].toolName).toBe('create_routine');

    // Verify routine was actually created in DB
    const routines = await db.routines.where('planId').equals(planId).toArray();
    expect(routines).toHaveLength(2); // existing + new
    expect(routines.some((r) => r.name === 'Leg Day')).toBe(true);
  });

  it('should respect the 50 message history limit', async () => {
    localStorage.setItem('anthropic_api_key', 'sk-test-key');

    // Create 60 messages
    const history = Array.from({ length: 60 }, (_, i) =>
      makeChatMessage(planId, {
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
        createdAt: i * 1000,
      })
    );

    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Reply' }],
      stop_reason: 'end_turn',
    });

    await sendMessage(planId, history, 'New message');

    const callArgs = mockCreate.mock.calls[0][0];
    // 50 from history (sliced) + 1 new = 51
    expect(callArgs.messages).toHaveLength(51);
  });

  it('should include plan state in system prompt', async () => {
    localStorage.setItem('anthropic_api_key', 'sk-test-key');

    const routine = makeRoutine(planId, { name: 'Push Day' });
    await db.routines.add(routine);
    const exercise = makeExercise(routine.id, { name: 'Bench Press' });
    await db.exercises.add(exercise);

    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Reply' }],
      stop_reason: 'end_turn',
    });

    await sendMessage(planId, [], 'Show my plan');

    const systemPrompt = mockCreate.mock.calls[0][0].system;
    expect(systemPrompt).toContain('Push Day');
    expect(systemPrompt).toContain('Bench Press');
  });
});
