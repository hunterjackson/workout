import { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { nanoid } from 'nanoid';
import { db } from '../lib/db';
import { sendMessage, type ChatResponse } from '../lib/chat-client';
import type { ChatMessage, ChatMode } from '../lib/types';
import type { MutationResult } from '../lib/tool-handler';

export function useChat(planId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mutations, setMutations] = useState<MutationResult[]>([]);
  const [mode, setMode] = useState<ChatMode>('planning');

  const messages = useLiveQuery(
    () => db.chatMessages.where('planId').equals(planId).sortBy('createdAt'),
    [planId]
  ) ?? [];

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'planning' ? 'updating' : 'planning'));
  }, []);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    setError(null);
    setMutations([]);

    // Look up the plan to get its model preference
    const plan = await db.plans.get(planId);

    // Fetch prior history BEFORE saving the new user message,
    // since sendMessage appends userMessage separately
    const priorMessages = await db.chatMessages
      .where('planId').equals(planId)
      .sortBy('createdAt');

    // Save user message
    const userMsg: ChatMessage = {
      id: nanoid(),
      planId,
      role: 'user',
      content: text.trim(),
      createdAt: Date.now(),
    };
    await db.chatMessages.add(userMsg);

    setLoading(true);

    try {
      const response: ChatResponse = await sendMessage(
        planId,
        priorMessages,
        text.trim(),
        plan?.model,
        mode,
      );

      // Save assistant message
      if (response.message) {
        const assistantMsg: ChatMessage = {
          id: nanoid(),
          planId,
          role: 'assistant',
          content: response.message,
          createdAt: Date.now(),
        };
        await db.chatMessages.add(assistantMsg);
      }

      if (response.mutations.length > 0) {
        setMutations(response.mutations);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setError(errorMessage);
      // Save error as assistant message so it's visible
      const errorMsg: ChatMessage = {
        id: nanoid(),
        planId,
        role: 'assistant',
        content: `Error: ${errorMessage}`,
        createdAt: Date.now(),
      };
      await db.chatMessages.add(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [planId, loading, mode]);

  const clearMutations = useCallback(() => setMutations([]), []);

  return {
    messages,
    loading,
    error,
    mutations,
    mode,
    send,
    clearMutations,
    toggleMode,
  };
}
