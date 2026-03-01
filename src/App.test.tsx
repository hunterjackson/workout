import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { db } from './lib/db';
import { resetDb, makePlan } from './test/helpers';

// We need to mock the SW register since it's imported in main.tsx
// but App doesn't use it directly - no mock needed here.

describe('App', () => {
  beforeEach(async () => {
    await resetDb();
    localStorage.clear();
  });

  it('should render the plans page at root', async () => {
    // Set the route
    window.history.pushState({}, '', '/workout/');

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('My Plans')).toBeInTheDocument();
    });
  });

  it('should render settings page', async () => {
    window.history.pushState({}, '', '/workout/settings');

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });
});
