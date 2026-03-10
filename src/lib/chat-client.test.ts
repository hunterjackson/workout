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

  it('should pass tools and system prompt to Claude in updating mode', async () => {
    localStorage.setItem('anthropic_api_key', 'sk-test-key');
    localStorage.setItem('preferred_unit', 'kg');

    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Response' }],
      stop_reason: 'end_turn',
    });

    await sendMessage(planId, [], 'Hello', undefined, 'updating');

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-sonnet-4-latest',
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

  it('should handle tool use and execute tool calls in updating mode', async () => {
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

    const response = await sendMessage(planId, [], 'Add a leg day', undefined, 'updating');

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

  it('should use model parameter when provided', async () => {
    localStorage.setItem('anthropic_api_key', 'sk-test-key');

    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Response' }],
      stop_reason: 'end_turn',
    });

    await sendMessage(planId, [], 'Hello', 'claude-haiku-4-5-latest');

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-haiku-4-5-latest',
      })
    );
  });

  it('should default to claude-sonnet-4-latest when no model provided', async () => {
    localStorage.setItem('anthropic_api_key', 'sk-test-key');

    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Response' }],
      stop_reason: 'end_turn',
    });

    await sendMessage(planId, [], 'Hello');

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-sonnet-4-latest',
      })
    );
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

  describe('planning mode', () => {
    it('should only pass web tools in planning mode (no user-defined tools)', async () => {
      localStorage.setItem('anthropic_api_key', 'sk-test-key');

      mockCreate.mockResolvedValueOnce({
        content: [{ type: 'text', text: 'Here is my plan for your workout...' }],
        stop_reason: 'end_turn',
      });

      await sendMessage(planId, [], 'Build me a plan', undefined, 'planning');

      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.tools).toHaveLength(2);
      expect(callArgs.tools).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: 'web_search_20250305', name: 'web_search' }),
          expect.objectContaining({ type: 'web_fetch_20250910', name: 'web_fetch' }),
        ])
      );
    });

    it('should include planning instructions in system prompt', async () => {
      localStorage.setItem('anthropic_api_key', 'sk-test-key');

      mockCreate.mockResolvedValueOnce({
        content: [{ type: 'text', text: 'Plan description...' }],
        stop_reason: 'end_turn',
      });

      await sendMessage(planId, [], 'Build me a plan', undefined, 'planning');

      const systemPrompt = mockCreate.mock.calls[0][0].system;
      expect(systemPrompt).toContain('PLANNING');
    });

    it('should return no mutations in planning mode', async () => {
      localStorage.setItem('anthropic_api_key', 'sk-test-key');

      mockCreate.mockResolvedValueOnce({
        content: [{ type: 'text', text: 'Here is what I would create...' }],
        stop_reason: 'end_turn',
      });

      const response = await sendMessage(planId, [], 'Create a push pull plan', undefined, 'planning');
      expect(response.mutations).toHaveLength(0);
    });
  });

  describe('updating mode', () => {
    it('should auto-execute tool calls without review callback', async () => {
      localStorage.setItem('anthropic_api_key', 'sk-test-key');

      mockCreate.mockResolvedValueOnce({
        content: [
          { type: 'text', text: 'Creating...' },
          {
            type: 'tool_use',
            id: 'tool-1',
            name: 'create_routine',
            input: { name: 'Push Day', schedule: [1, 3, 5] },
          },
        ],
        stop_reason: 'tool_use',
      });

      mockCreate.mockResolvedValueOnce({
        content: [{ type: 'text', text: 'Created!' }],
        stop_reason: 'end_turn',
      });

      const response = await sendMessage(planId, [], 'Create push day', undefined, 'updating');

      const routines = await db.routines.where('planId').equals(planId).toArray();
      expect(routines).toHaveLength(1);
      expect(routines[0].name).toBe('Push Day');
      expect(response.mutations).toHaveLength(1);
      expect(response.mutations[0].success).toBe(true);
    });

    it('should pass tools to Claude in updating mode', async () => {
      localStorage.setItem('anthropic_api_key', 'sk-test-key');

      mockCreate.mockResolvedValueOnce({
        content: [{ type: 'text', text: 'Done!' }],
        stop_reason: 'end_turn',
      });

      await sendMessage(planId, [], 'Create push day', undefined, 'updating');

      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.tools).toBeDefined();
      expect(callArgs.tools.length).toBeGreaterThan(0);
    });

    it('should include updating instructions in system prompt', async () => {
      localStorage.setItem('anthropic_api_key', 'sk-test-key');

      mockCreate.mockResolvedValueOnce({
        content: [{ type: 'text', text: 'Done!' }],
        stop_reason: 'end_turn',
      });

      await sendMessage(planId, [], 'Do it', undefined, 'updating');

      const systemPrompt = mockCreate.mock.calls[0][0].system;
      expect(systemPrompt).toContain('UPDATING');
    });

    it('should handle multiple tool calls in updating mode', async () => {
      localStorage.setItem('anthropic_api_key', 'sk-test-key');

      mockCreate.mockResolvedValueOnce({
        content: [
          { type: 'text', text: 'Creating routine with exercises.' },
          {
            type: 'tool_use',
            id: 'tool-1',
            name: 'create_routine',
            input: { name: 'Full Body', schedule: [1, 3, 5] },
          },
          {
            type: 'tool_use',
            id: 'tool-2',
            name: 'add_exercise',
            input: { routineId: 'placeholder', name: 'Squat', sets: 4, reps: '8' },
          },
        ],
        stop_reason: 'tool_use',
      });

      mockCreate.mockResolvedValueOnce({
        content: [{ type: 'text', text: 'All done!' }],
        stop_reason: 'end_turn',
      });

      const response = await sendMessage(planId, [], 'Create full body', undefined, 'updating');
      expect(response.mutations).toHaveLength(2);
    });
  });

  describe('web search and web fetch', () => {
    it('should include web search and web fetch tools in all API calls', async () => {
      localStorage.setItem('anthropic_api_key', 'sk-test-key');

      mockCreate.mockResolvedValueOnce({
        content: [{ type: 'text', text: 'Response' }],
        stop_reason: 'end_turn',
      });

      await sendMessage(planId, [], 'Hello');

      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.tools).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'web_search_20250305',
            name: 'web_search',
          }),
          expect.objectContaining({
            type: 'web_fetch_20250910',
            name: 'web_fetch',
            max_content_tokens: 8192,
          }),
        ])
      );
    });

    it('should include web search and web fetch tools alongside other tools in updating mode', async () => {
      localStorage.setItem('anthropic_api_key', 'sk-test-key');

      mockCreate.mockResolvedValueOnce({
        content: [{ type: 'text', text: 'Response' }],
        stop_reason: 'end_turn',
      });

      await sendMessage(planId, [], 'Hello', undefined, 'updating');

      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.tools).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'web_search_20250305',
            name: 'web_search',
          }),
          expect.objectContaining({
            type: 'web_fetch_20250910',
            name: 'web_fetch',
            max_content_tokens: 8192,
          }),
        ])
      );
      // Should also still have the user-defined tools
      expect(callArgs.tools.length).toBeGreaterThan(2);
    });
  });

  describe('default mode', () => {
    it('should default to planning mode when no mode specified', async () => {
      localStorage.setItem('anthropic_api_key', 'sk-test-key');

      mockCreate.mockResolvedValueOnce({
        content: [{ type: 'text', text: 'Here is my plan...' }],
        stop_reason: 'end_turn',
      });

      await sendMessage(planId, [], 'Build me a plan');

      const callArgs = mockCreate.mock.calls[0][0];
      // Should only have web tools, no user-defined tools
      expect(callArgs.tools).toHaveLength(2);
      expect(callArgs.tools).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: 'web_search_20250305', name: 'web_search' }),
          expect.objectContaining({ type: 'web_fetch_20250910', name: 'web_fetch' }),
        ])
      );
    });
  });
});
