import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ChatPage from './ChatPage';
import { db } from '../lib/db';
import { resetDb, makePlan, makeChatMessage } from '../test/helpers';

// Mock the chat client to avoid real API calls
vi.mock('../lib/chat-client', () => ({
  sendMessage: vi.fn().mockResolvedValue({
    message: 'Mocked response',
    mutations: [],
  }),
}));

describe('ChatPage', () => {
  let planId: string;

  beforeEach(async () => {
    await resetDb();
    localStorage.clear();
    const plan = makePlan();
    await db.plans.add(plan);
    planId = plan.id;
  });

  function renderChat(id: string = planId) {
    return render(
      <MemoryRouter initialEntries={[`/plan/${id}/chat`]}>
        <Routes>
          <Route path="/plan/:id/chat" element={<ChatPage />} />
          <Route path="/settings" element={<div>Settings Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  }

  it('should show API key required when no key is set', () => {
    renderChat();
    expect(screen.getByText('API Key Required')).toBeInTheDocument();
    expect(screen.getByText('Go to Settings')).toBeInTheDocument();
  });

  it('should show the chat interface when API key is set', () => {
    localStorage.setItem('anthropic_api_key', 'sk-test');
    renderChat();
    expect(screen.getByText('AI Workout Coach')).toBeInTheDocument();
  });

  it('should show suggestion buttons when no messages', () => {
    localStorage.setItem('anthropic_api_key', 'sk-test');
    renderChat();
    expect(screen.getByText(/create a 4-day upper/i)).toBeInTheDocument();
    expect(screen.getByText(/build me a ppl/i)).toBeInTheDocument();
    expect(screen.getByText(/3-day full body/i)).toBeInTheDocument();
  });

  it('should render existing chat messages', async () => {
    localStorage.setItem('anthropic_api_key', 'sk-test');

    await db.chatMessages.add(
      makeChatMessage(planId, { role: 'user', content: 'Build me a plan', createdAt: 1000 })
    );
    await db.chatMessages.add(
      makeChatMessage(planId, { role: 'assistant', content: 'Here is your plan!', createdAt: 2000 })
    );

    renderChat();

    await waitFor(() => {
      expect(screen.getByText('Build me a plan')).toBeInTheDocument();
    });
    expect(screen.getByText('Here is your plan!')).toBeInTheDocument();
  });

  it('should have chat input', () => {
    localStorage.setItem('anthropic_api_key', 'sk-test');
    renderChat();
    expect(screen.getByPlaceholderText(/ask ai/i)).toBeInTheDocument();
  });

  it('should use dvh unit for container height to support mobile keyboard', () => {
    localStorage.setItem('anthropic_api_key', 'sk-test');
    const { container } = renderChat();
    const chatContainer = container.firstElementChild as HTMLElement;
    // dvh ensures the layout resizes when the mobile keyboard opens
    expect(chatContainer.className).toContain('h-[calc(100dvh-64px)]');
    expect(chatContainer.className).not.toContain('h-[calc(100vh-64px)]');
  });

  it('should show proposed changes when AI suggests tool calls', async () => {
    localStorage.setItem('anthropic_api_key', 'sk-test');

    // Make sendMessage invoke the onToolCalls callback to trigger review
    const { sendMessage } = await import('../lib/chat-client');
    const mockSendMessage = vi.mocked(sendMessage);

    mockSendMessage.mockImplementation(
      async (_planId, _history, _msg, _model, onToolCalls) => {
        if (onToolCalls) {
          const proposed = [
            { id: 'tool-1', name: 'create_routine', input: { name: 'Leg Day', schedule: [2] }, description: 'Create routine "Leg Day"' },
          ];
          await onToolCalls(proposed);
        }
        return { message: 'Done!', mutations: [] };
      }
    );

    renderChat();
    const user = userEvent.setup();

    // Type and send a message
    const input = screen.getByPlaceholderText(/ask ai/i);
    await user.type(input, 'Create a leg day');
    await user.keyboard('{Enter}');

    // The proposed changes review should appear
    await waitFor(() => {
      expect(screen.getByText(/proposed changes/i)).toBeInTheDocument();
    });
    expect(screen.getByText('Create routine "Leg Day"')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
  });

  it('should hide proposed changes after clicking apply', async () => {
    localStorage.setItem('anthropic_api_key', 'sk-test');

    const { sendMessage } = await import('../lib/chat-client');
    const mockSendMessage = vi.mocked(sendMessage);

    mockSendMessage.mockImplementation(
      async (_planId, _history, _msg, _model, onToolCalls) => {
        if (onToolCalls) {
          const proposed = [
            { id: 'tool-1', name: 'create_routine', input: { name: 'Leg Day', schedule: [2] }, description: 'Create routine "Leg Day"' },
          ];
          await onToolCalls(proposed);
        }
        return { message: 'Created Leg Day!', mutations: [] };
      }
    );

    renderChat();
    const user = userEvent.setup();

    const input = screen.getByPlaceholderText(/ask ai/i);
    await user.type(input, 'Create a leg day');
    await user.keyboard('{Enter}');

    // Wait for proposed changes
    await waitFor(() => {
      expect(screen.getByText(/proposed changes/i)).toBeInTheDocument();
    });

    // Click apply
    await user.click(screen.getByRole('button', { name: /apply/i }));

    // Proposed changes should disappear
    await waitFor(() => {
      expect(screen.queryByText(/proposed changes/i)).not.toBeInTheDocument();
    });
  });
});
