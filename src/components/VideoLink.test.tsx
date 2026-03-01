import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import VideoLink from './VideoLink';

describe('VideoLink', () => {
  it('should return null when no url', () => {
    const { container } = render(<VideoLink />);
    expect(container.firstChild).toBeNull();
  });

  it('should return null when url is undefined', () => {
    const { container } = render(<VideoLink url={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render a link when url is provided', () => {
    render(<VideoLink url="https://youtube.com/watch?v=test" />);
    const link = screen.getByText('Video');
    expect(link).toBeInTheDocument();
  });

  it('should have correct href', () => {
    render(<VideoLink url="https://youtube.com/watch?v=test" />);
    const link = screen.getByText('Video').closest('a');
    expect(link).toHaveAttribute('href', 'https://youtube.com/watch?v=test');
  });

  it('should open in new tab', () => {
    render(<VideoLink url="https://youtube.com/watch?v=test" />);
    const link = screen.getByText('Video').closest('a');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
