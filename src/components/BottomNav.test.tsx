import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import BottomNav from './BottomNav';

function renderNav(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/plan/:id/*" element={<BottomNav />} />
        <Route path="/" element={<div>Home</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('BottomNav', () => {
  it('should return null when no plan id in params', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<BottomNav />} />
        </Routes>
      </MemoryRouter>
    );
    expect(container.querySelector('nav')).toBeNull();
  });

  it('should render all 4 tab labels', () => {
    renderNav('/plan/abc');
    expect(screen.getByText('Plan')).toBeInTheDocument();
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Workout')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
  });

  it('should highlight the active tab', () => {
    renderNav('/plan/abc/chat');
    const chatButton = screen.getByText('Chat').closest('button');
    expect(chatButton?.className).toContain('text-primary');
  });

  it('should highlight Plan tab on plan root', () => {
    renderNav('/plan/abc');
    const planButton = screen.getByText('Plan').closest('button');
    expect(planButton?.className).toContain('text-primary');
  });

  it('should not highlight inactive tabs', () => {
    renderNav('/plan/abc/chat');
    const planButton = screen.getByText('Plan').closest('button');
    expect(planButton?.className).toContain('text-text-muted');
  });

  it('should navigate when tabs are clicked', async () => {
    const user = userEvent.setup();
    renderNav('/plan/abc');

    await user.click(screen.getByText('Chat'));
    const chatButton = screen.getByText('Chat').closest('button');
    expect(chatButton?.className).toContain('text-primary');
  });
});
