import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MutationToast from './MutationToast';
import type { MutationResult } from '../lib/tool-handler';

function makeMutation(overrides: Partial<MutationResult> = {}): MutationResult {
  return {
    toolUseId: 'tool-1',
    toolName: 'create_routine',
    success: true,
    result: '{}',
    description: 'Created routine "Push Day"',
    ...overrides,
  };
}

describe('MutationToast', () => {
  it('should return null when no mutations', () => {
    const { container } = render(<MutationToast mutations={[]} onDismiss={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render mutation descriptions', () => {
    const mutations = [
      makeMutation({ description: 'Created routine "Push Day"' }),
      makeMutation({ description: 'Added "Bench Press" to routine' }),
    ];
    render(<MutationToast mutations={mutations} onDismiss={vi.fn()} />);

    expect(screen.getByText('Created routine "Push Day"')).toBeInTheDocument();
    expect(screen.getByText('Added "Bench Press" to routine')).toBeInTheDocument();
  });

  it('should show check mark for successful mutations', () => {
    render(<MutationToast mutations={[makeMutation({ success: true })]} onDismiss={vi.fn()} />);
    const checkContainer = screen.getByText('Created routine "Push Day"').parentElement;
    expect(checkContainer?.textContent).toContain('✓');
  });

  it('should show X mark for failed mutations', () => {
    render(
      <MutationToast
        mutations={[makeMutation({ success: false, description: 'Error executing tool' })]}
        onDismiss={vi.fn()}
      />
    );
    const container = screen.getByText('Error executing tool').parentElement;
    expect(container?.textContent).toContain('✗');
  });

  it('should call onDismiss when close button is clicked', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<MutationToast mutations={[makeMutation()]} onDismiss={onDismiss} />);

    const closeButton = screen.getByRole('button');
    await user.click(closeButton);

    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
