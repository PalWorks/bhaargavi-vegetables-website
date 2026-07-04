import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import React from 'react';
import Products from './Products';
import { CartProvider, useCart } from '../context/CartContext';
import { LanguageProvider } from '../LanguageContext';

const CartProbe: React.FC = () => {
  const { cartCount, cartTotal } = useCart();
  return <div data-testid="probe">{cartCount}|{cartTotal}</div>;
};

const renderProducts = () =>
  render(
    <LanguageProvider>
      <CartProvider>
        <Products />
        <CartProbe />
      </CartProvider>
    </LanguageProvider>,
  );

beforeEach(() => localStorage.clear());

describe('<Products>', () => {
  it('renders the section heading and category tabs', () => {
    renderProducts();
    expect(screen.getByRole('heading', { name: /our products/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cut Vegetables' })).toBeInTheDocument();
  });

  it('renders product cards from the fallback catalog', () => {
    renderProducts();
    expect(screen.getAllByText('Add to Cart').length).toBeGreaterThan(0);
  });

  it('adds a product to the cart when "Add to Cart" is clicked', () => {
    renderProducts();
    const probe = screen.getByTestId('probe');
    expect(probe).toHaveTextContent('0|0');

    const addButtons = screen.getAllByRole('button', { name: /add to cart/i });
    fireEvent.click(addButtons[0]);

    // cart count becomes 1; total becomes a positive number
    const [count, total] = probe.textContent!.split('|').map(Number);
    expect(count).toBe(1);
    expect(total).toBeGreaterThan(0);
  });

  it('filters products when a category tab is selected', () => {
    renderProducts();
    fireEvent.click(screen.getByRole('button', { name: 'Health Packs' }));
    // Health category contains sprouts; the fallback catalog has "Mixed Sprouts"
    expect(screen.getByText('Mixed Sprouts')).toBeInTheDocument();
    // A cut-only item should no longer be shown
    expect(screen.queryByText('Carrot Cut')).not.toBeInTheDocument();
  });
});
