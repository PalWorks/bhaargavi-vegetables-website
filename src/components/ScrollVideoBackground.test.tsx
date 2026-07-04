import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import ScrollVideoBackground from './ScrollVideoBackground';

/**
 * jsdom does not implement window.matchMedia, so chooseMode() takes its guarded path and
 * returns 'poster'. This verifies the hero degrades safely (static poster, no crash, no
 * canvas/video) in the least-capable environment — the reliability floor of the overhaul.
 */
describe('<ScrollVideoBackground>', () => {
  it('renders the static poster fallback without crashing when capabilities are unknown', () => {
    const { container } = render(<ScrollVideoBackground />);
    const root = container.querySelector('div[aria-hidden="true"]') as HTMLElement;
    expect(root).toBeTruthy();
    expect(root.style.backgroundImage).toContain('hero-poster.jpg');
  });

  it('does not mount a <video> or <canvas> in the poster fallback', () => {
    const { container } = render(<ScrollVideoBackground />);
    expect(container.querySelector('video')).toBeNull();
    expect(container.querySelector('canvas')).toBeNull();
  });
});
