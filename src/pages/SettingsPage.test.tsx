import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SettingsPage from './SettingsPage';

describe('SettingsPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function renderSettings() {
    return render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );
  }

  it('should render the settings heading', () => {
    renderSettings();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should render API key input', () => {
    renderSettings();
    expect(screen.getByPlaceholderText('sk-ant-...')).toBeInTheDocument();
  });

  it('should render unit selection buttons', () => {
    renderSettings();
    expect(screen.getByText('lbs')).toBeInTheDocument();
    expect(screen.getByText('kg')).toBeInTheDocument();
  });

  it('should load existing API key from localStorage', () => {
    localStorage.setItem('anthropic_api_key', 'sk-test-123');
    renderSettings();
    const input = screen.getByPlaceholderText('sk-ant-...') as HTMLInputElement;
    expect(input.value).toBe('sk-test-123');
  });

  it('should load existing unit preference', () => {
    localStorage.setItem('preferred_unit', 'kg');
    renderSettings();
    const kgButton = screen.getByText('kg');
    expect(kgButton.className).toContain('bg-primary');
  });

  it('should save API key and unit to localStorage', async () => {
    const user = userEvent.setup();
    renderSettings();

    const input = screen.getByPlaceholderText('sk-ant-...');
    await user.type(input, 'sk-ant-new-key');
    await user.click(screen.getByText('kg'));
    await user.click(screen.getByText('Save Settings'));

    expect(localStorage.getItem('anthropic_api_key')).toBe('sk-ant-new-key');
    expect(localStorage.getItem('preferred_unit')).toBe('kg');
  });

  it('should show "Saved!" feedback after saving', async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.click(screen.getByText('Save Settings'));
    expect(screen.getByText('Saved!')).toBeInTheDocument();
  });

  it('should remove API key when cleared', async () => {
    localStorage.setItem('anthropic_api_key', 'sk-old');
    const user = userEvent.setup();
    renderSettings();

    const input = screen.getByPlaceholderText('sk-ant-...') as HTMLInputElement;
    await user.clear(input);
    await user.click(screen.getByText('Save Settings'));

    expect(localStorage.getItem('anthropic_api_key')).toBeNull();
  });

  it('should have a back button', () => {
    renderSettings();
    const buttons = screen.getAllByRole('button');
    // First button is the back button
    expect(buttons[0]).toBeInTheDocument();
  });

  it('should show security note about API key', () => {
    renderSettings();
    expect(screen.getByText(/never sent anywhere except anthropic/i)).toBeInTheDocument();
  });
});
