import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { CartProvider } from '../context/CartContext';
import { LanguageProvider } from '../LanguageContext';

const renderNavbar = () =>
  render(
    <MemoryRouter>
      <LanguageProvider>
        <CartProvider>
          <Navbar />
        </CartProvider>
      </LanguageProvider>
    </MemoryRouter>,
  );

describe('<Navbar> accessibility', () => {
  it('labels the icon-only controls for screen readers', () => {
    renderNavbar();
    expect(screen.getByRole('button', { name: /change language/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /your cart/i })).toBeInTheDocument();
    // the WhatsApp order CTA is a labelled link
    expect(screen.getAllByRole('link', { name: /order/i }).length).toBeGreaterThan(0);
  });

  it('points the WhatsApp CTA at the configured number', () => {
    renderNavbar();
    const waLinks = screen.getAllByRole('link', { name: /order/i })
      .filter(a => a.getAttribute('href')?.includes('wa.me'));
    expect(waLinks.length).toBeGreaterThan(0);
    expect(waLinks[0].getAttribute('href')).toContain('wa.me/919150219379');
  });
});
