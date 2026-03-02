import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../hooks/useChat';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import MutationToast from '../components/MutationToast';
import BackButton from '../components/BackButton';

export default function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { messages, loading, mutations, send, clearMutations } = useChat(id!);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasApiKey = !!localStorage.getItem('anthropic_api_key');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!hasApiKey) {
    return (
      <div className="min-h-full bg-bg p-6 pb-20">
        <div className="mb-6">
          <BackButton />
        </div>
        <div className="flex flex-col items-center text-center pt-12">
          <div className="text-5xl mb-4">🔑</div>
          <h2 className="text-xl font-semibold mb-2">API Key Required</h2>
          <p className="text-text-muted mb-6">
            Add your Anthropic API key in Settings to start chatting with your AI workout coach.
          </p>
          <button
            onClick={() => navigate('/settings')}
            className="bg-primary text-white px-6 py-3 rounded-xl font-medium"
          >
            Go to Settings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-64px)] bg-bg">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-0">
        <BackButton />
        <h1 className="text-2xl font-bold">Chat</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🤖</div>
            <h2 className="text-lg font-semibold mb-2">AI Workout Coach</h2>
            <p className="text-text-muted text-sm max-w-xs mx-auto">
              Tell me about your fitness goals and I'll build a workout plan for you. Try:
            </p>
            <div className="mt-4 space-y-2">
              {[
                'Create a 4-day upper/lower split',
                'Build me a PPL routine for muscle gain',
                'I want a 3-day full body program for beginners',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => send(suggestion)}
                  className="block w-full text-left text-sm bg-surface rounded-xl px-4 py-3 text-text-muted hover:text-text transition-colors"
                >
                  "{suggestion}"
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-surface rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Mutation toast */}
      <MutationToast mutations={mutations} onDismiss={clearMutations} />

      {/* Input */}
      <ChatInput onSend={send} disabled={loading} />
    </div>
  );
}
