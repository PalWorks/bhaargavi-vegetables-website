import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import CartSidebar from './CartSidebar';
import { CartProvider, useCart } from '../context/CartContext';
import { LanguageProvider } from '../LanguageContext';
import { CartItem } from '../types';

const combo = (): CartItem => ({ id: '27', name: 'Weekly Veggie Combo', image: '/menu/x.png', price: 299, weight: '1 kg', quantity: 1 });
const small = (): CartItem => ({ id: '1', name: 'Carrot Cut', image: '/menu/carrot_cut.png', price: 40, weight: '250 g', quantity: 1 });

// Seeds the cart and opens the drawer, then renders CartSidebar within the same provider.
const Harness: React.FC<{ seed: CartItem[] }> = ({ seed }) => {
  const { addToCart, toggleCart, isCartOpen } = useCart();
  const done = React.useRef(false);
  React.useEffect(() => {
    if (done.current) return;
    done.current = true;
    seed.forEach(addToCart);
    if (!isCartOpen) toggleCart();
  }, [addToCart, toggleCart, isCartOpen, seed]);
  return null;
};

const renderCart = (seed: CartItem[]) =>
  render(
    <LanguageProvider>
      <CartProvider>
        <Harness seed={seed} />
        <CartSidebar />
      </CartProvider>
    </LanguageProvider>,
  );

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe('<CartSidebar> accessibility', () => {
  it('exposes a labelled modal dialog with a close control', () => {
    renderCart([combo()]);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('button', { name: /close cart/i })).toBeInTheDocument();
  });

  it('closes on Escape', () => {
    const { container } = renderCart([combo()]);
    const dialog = container.querySelector('[role="dialog"]')!;
    expect(dialog.getAttribute('aria-hidden')).toBe('false');
    act(() => { fireEvent.keyDown(document, { key: 'Escape' }); });
    expect(dialog.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('<CartSidebar> min-order gate', () => {
  it('disables checkout below the ₹199 minimum', () => {
    renderCart([small()]);
    const checkout = screen.getByRole('button', { name: /minimum order/i });
    expect(checkout).toBeDisabled();
  });

  it('enables checkout at or above the minimum', () => {
    renderCart([combo()]);
    expect(screen.getByRole('button', { name: /order on whatsapp/i })).toBeEnabled();
  });
});

describe('<CartSidebar> checkout flow', () => {
  it('requires a delivery address before opening WhatsApp', () => {
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
    renderCart([combo()]);
    fireEvent.click(screen.getByRole('button', { name: /order on whatsapp/i }));
    expect(openSpy).not.toHaveBeenCalled();
    expect(screen.getByText(/please enter your address/i)).toBeInTheDocument();
  });

  it('opens a wa.me link with the number and encoded order once an address is given', () => {
    const openSpy = vi.spyOn(window, 'open').mockReturnValue({} as Window);
    renderCart([combo()]);
    fireEvent.change(screen.getByPlaceholderText(/complete delivery address/i), { target: { value: '12 Main St, Chennai' } });
    fireEvent.click(screen.getByRole('button', { name: /order on whatsapp/i }));

    expect(openSpy).toHaveBeenCalledTimes(1);
    const url = openSpy.mock.calls[0][0] as string;
    expect(url).toContain('https://wa.me/919150219379?text=');
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain('Weekly Veggie Combo');
    expect(decoded).toContain('Total: ₹ 299');
  });

  it('shows a manual fallback link when the popup is blocked', () => {
    vi.spyOn(window, 'open').mockReturnValue(null);
    renderCart([combo()]);
    fireEvent.change(screen.getByPlaceholderText(/complete delivery address/i), { target: { value: '12 Main St' } });
    fireEvent.click(screen.getByRole('button', { name: /order on whatsapp/i }));
    expect(screen.getByRole('link', { name: /open whatsapp/i })).toBeInTheDocument();
  });
});
