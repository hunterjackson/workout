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
          <Route path="/" element={<div>Plans Page</div>} />
          <Route path="/plan/:id/chat" element={<ChatPage />} />
          <Route path="/settings" element={<div>Settings Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  }

  it('should navigate back to plans page when back button is clicked', async () => {
    localStorage.setItem('anthropic_api_key', 'sk-test');
    const user = userEvent.setup();
    renderChat();

    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);

    await waitFor(() => {
      expect(screen.getByText('Plans Page')).toBeInTheDocument();
    });
  });

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
});
