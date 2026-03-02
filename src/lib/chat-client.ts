import Anthropic from '@anthropic-ai/sdk';
import { tools } from './tools';
import { serializePlan } from './plan-serializer';
import { handleToolCall, type MutationResult } from './tool-handler';
import type { ChatMessage } from './types';

const SYSTEM_PROMPT = `You are a knowledgeable, encouraging fitness coach and workout planner. You help users create and refine workout plans through conversation.

CAPABILITIES:
- Create, update, and delete routines (workout day templates)
- Add, update, and delete exercises within routines
- Set weekly schedules for routines
- Suggest YouTube video URLs for exercise form demonstrations when you know good ones

GUIDELINES:
- When the user wants to create a plan, use tools to actually create the routines and exercises — don't just describe them
- You can call multiple tools in a single response to batch-create routines and exercises
- Always explain your reasoning briefly before making changes
- Be conversational and encouraging
- When suggesting exercises, include sets, reps, and rest periods
- For video URLs, include YouTube links for exercises when you're confident about good instructional videos
- The user's preferred weight unit is: {UNIT}

CURRENT PLAN STATE:
{PLAN_STATE}`;

export interface ChatResponse {
  message: string;
  mutations: MutationResult[];
}

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

export async function sendMessage(
  planId: string,
  chatHistory: ChatMessage[],
  userMessage: string,
  model?: string,
): Promise<ChatResponse> {
  const apiKey = localStorage.getItem('anthropic_api_key');
  if (!apiKey) throw new Error('No API key set. Go to Settings to add your Anthropic API key.');

  const unit = localStorage.getItem('preferred_unit') || 'lbs';
  const planState = await serializePlan(planId);

  const client = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  const systemPrompt = SYSTEM_PROMPT
    .replace('{UNIT}', unit)
    .replace('{PLAN_STATE}', planState ? JSON.stringify(planState, null, 2) : 'No plan data yet. The plan exists but has no routines or exercises.');

  // Build messages from chat history (last 50 messages for context window management)
  const recentHistory = chatHistory.slice(-50);
  const messages: Anthropic.MessageParam[] = recentHistory.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));
  messages.push({ role: 'user', content: userMessage });

  const allMutations: MutationResult[] = [];
  let finalMessage = '';

  // Tool use loop
  let currentMessages = [...messages];
  const maxLoops = 10;

  for (let i = 0; i < maxLoops; i++) {
    const response = await client.messages.create({
      model: model || DEFAULT_MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      tools,
      messages: currentMessages,
    });

    // Collect text from the response
    const textBlocks = response.content.filter(
      (block): block is Anthropic.TextBlock => block.type === 'text'
    );
    if (textBlocks.length > 0) {
      finalMessage += textBlocks.map((b) => b.text).join('\n');
    }

    // Check for tool use
    const toolUseBlocks = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
    );

    if (toolUseBlocks.length === 0 || response.stop_reason === 'end_turn') {
      break;
    }

    // Execute tool calls
    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const toolUse of toolUseBlocks) {
      const result = await handleToolCall(planId, {
        id: toolUse.id,
        name: toolUse.name,
        input: toolUse.input as Record<string, unknown>,
      });
      allMutations.push(result);
      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: result.result,
        is_error: !result.success,
      });
    }

    // Continue conversation with tool results
    currentMessages = [
      ...currentMessages,
      { role: 'assistant' as const, content: response.content },
      { role: 'user' as const, content: toolResults },
    ];
  }

  return {
    message: finalMessage,
    mutations: allMutations,
  };
}
