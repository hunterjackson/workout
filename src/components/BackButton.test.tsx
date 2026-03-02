import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import BackButton from './BackButton';
import { renderWithRouter } from '../test/helpers';

describe('BackButton', () => {
  it('should render a button with back aria-label', () => {
    renderWithRouter(<BackButton />);
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  it('should navigate to "/" by default', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/some/page']}>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route path="/some/page" element={<BackButton />} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /back/i }));

    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });
});
