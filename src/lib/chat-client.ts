import Anthropic from '@anthropic-ai/sdk';
import { tools } from './tools';
import { serializePlan } from './plan-serializer';
import { handleToolCall, type MutationResult } from './tool-handler';
import type { ChatMessage, ChatMode } from './types';

const BASE_PROMPT = `You are a knowledgeable, encouraging fitness coach and workout planner. You help users create and refine workout plans through conversation.

CAPABILITIES:
- Create, update, and delete routines (workout day templates)
- Add, update, and delete exercises within routines
- Set weekly schedules for routines
- Suggest YouTube video URLs for exercise form demonstrations when you know good ones
- Remember important facts about the user by updating the plan context

GUIDELINES:
- Always explain your reasoning briefly
- Be conversational and encouraging
- When suggesting exercises, include sets, reps, and rest periods
- For video URLs, include YouTube links for exercises when you're confident about good instructional videos
- The user's preferred weight unit is: {UNIT}
- When you learn important facts about the user (injuries, preferences, experience level, schedule constraints, equipment access, etc.), use the update_plan_context tool to save them. This context persists across conversations so you can provide personalized advice.`;

const PLANNING_ADDENDUM = `

MODE: PLANNING
You are in PLANNING mode. Present what you would create or change in detail, but do NOT make any changes yet. Structure your response clearly so the user can review your plan before applying it. Use bullet points or numbered lists for clarity. The user will switch to updating mode when they're ready for you to apply the changes.`;

const UPDATING_ADDENDUM = `

MODE: UPDATING
You are in UPDATING mode. Use tools to directly create, update, or delete routines and exercises as needed. You can call multiple tools in a single response to batch changes.`;

const PLAN_CONTEXT_SECTION = `

PLAN CONTEXT (important facts about the user and this plan):
{PLAN_CONTEXT}`;

const PLAN_STATE_SECTION = `

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
  mode: ChatMode = 'planning',
): Promise<ChatResponse> {
  const apiKey = localStorage.getItem('anthropic_api_key');
  if (!apiKey) throw new Error('No API key set. Go to Settings to add your Anthropic API key.');

  const unit = localStorage.getItem('preferred_unit') || 'lbs';
  const planState = await serializePlan(planId);

  const client = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  const planContext = planState?.plan?.context || 'No context saved yet.';
  const modeAddendum = mode === 'updating' ? UPDATING_ADDENDUM : PLANNING_ADDENDUM;
  const systemPrompt = (BASE_PROMPT + modeAddendum + PLAN_CONTEXT_SECTION + PLAN_STATE_SECTION)
    .replace('{UNIT}', unit)
    .replace('{PLAN_CONTEXT}', planContext)
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

  const isUpdating = mode === 'updating';

  const webTools = [
    { type: 'web_search_20250305' as const, name: 'web_search' as const },
    { type: 'web_fetch_20250305' as const, name: 'web_fetch' as const, max_content_tokens: 8192 },
  ];

  for (let i = 0; i < maxLoops; i++) {
    const response = await client.messages.create({
      model: model || DEFAULT_MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      tools: isUpdating ? [...tools, ...webTools] : [...webTools],
      messages: currentMessages,
    });

    // Collect text from the response
    const textBlocks = response.content.filter(
      (block): block is Anthropic.TextBlock => block.type === 'text'
    );
    if (textBlocks.length > 0) {
      finalMessage += textBlocks.map((b) => b.text).join('\n');
    }

    // In planning mode, there are no tools so no tool use blocks
    if (!isUpdating) break;

    // Check for tool use
    const toolUseBlocks = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
    );

    if (toolUseBlocks.length === 0 || response.stop_reason === 'end_turn') {
      break;
    }

    // Execute tool calls directly in updating mode
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
