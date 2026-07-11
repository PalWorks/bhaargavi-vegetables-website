import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import GoogleReviews from './GoogleReviews';
import { LanguageProvider } from '../LanguageContext';

// VITE_GOOGLE_PLACE_ID is unset in the test env, so the section must degrade gracefully:
// a working WhatsApp CTA and NO broken Google review links.
describe('<GoogleReviews> without a Place ID', () => {
  const renderIt = () => render(<LanguageProvider><GoogleReviews /></LanguageProvider>);

  it('shows the trust heading and a working WhatsApp CTA', () => {
    renderIt();
    expect(screen.getByRole('heading', { name: /rated 5\.0/i })).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: /order/i });
    expect(cta.getAttribute('href')).toContain('wa.me/919150219379');
  });

  it('renders no Google review links (no broken placeholders)', () => {
    const { container } = renderIt();
    const googleLinks = Array.from(container.querySelectorAll('a'))
      .filter(a => (a.getAttribute('href') || '').includes('search.google.com'));
    expect(googleLinks).toHaveLength(0);
  });
});
