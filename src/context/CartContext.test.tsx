import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { CartProvider, useCart, buildWhatsAppMessage } from './CartContext';
import { CartItem } from '../types';

const wrapper = ({ children }: { children: React.ReactNode }) => <CartProvider>{children}</CartProvider>;

const item = (over: Partial<CartItem> = {}): CartItem => ({
  id: '1', name: 'Carrot Cut', image: '/menu/carrot_cut.png',
  price: 40, weight: '250 g', quantity: 1, ...over,
});

beforeEach(() => localStorage.clear());

describe('buildWhatsAppMessage', () => {
  it('formats items, per-line total (price * qty), address and grand total', () => {
    const msg = buildWhatsAppMessage(
      [item({ quantity: 2 })], 80,
      'Hello Bhaargavi!', 'Please confirm.', 'Note', '12 Main St\nChennai 600044',
    );
    expect(msg).toContain('2 x Carrot Cut (250 g) - ₹ 80');
    expect(msg).toContain('*Total: ₹ 80*');
    expect(msg).toContain('Hello Bhaargavi!');
    expect(msg).toContain('Please confirm.');
  });

  it('encodes newlines in the delivery address as %0A', () => {
    const msg = buildWhatsAppMessage([item()], 40, 'g', 'c', 'Note', 'Line1\nLine2');
    expect(msg).toContain('Line1%0ALine2');
    expect(msg).not.toContain('Line1\nLine2');
  });

  it('includes a custom note under the line when present', () => {
    const msg = buildWhatsAppMessage([item({ customNote: 'no plastic bag' })], 40, 'g', 'c', 'Packing', 'addr');
    expect(msg).toContain('Packing: no plastic bag');
  });
});

describe('cart operations', () => {
  it('adds an item and computes total/count', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addToCart(item()));
    expect(result.current.cartCount).toBe(1);
    expect(result.current.cartTotal).toBe(40);
  });

  it('increments quantity when the same id+weight is added again', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addToCart(item()));
    act(() => result.current.addToCart(item()));
    expect(result.current.cartCount).toBe(2);
    expect(result.current.cartTotal).toBe(80);
    expect(result.current.items).toHaveLength(1);
  });

  it('keeps the same product in different sizes as separate line items', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addToCart(item({ weight: '250 g', price: 40 })));
    act(() => result.current.addToCart(item({ weight: '500 g', price: 75 })));
    expect(result.current.items).toHaveLength(2);
    expect(result.current.cartTotal).toBe(115);
  });

  it('removes a line when its quantity drops to zero', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addToCart(item()));
    act(() => result.current.updateQuantity('1', '250 g', -1));
    expect(result.current.items).toHaveLength(0);
    expect(result.current.cartCount).toBe(0);
  });

  it('flags below-minimum orders and reports the shortfall', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addToCart(item({ price: 40 })));
    expect(result.current.isBelowMinimum).toBe(true);
    expect(result.current.amountNeeded).toBe(199 - 40);
  });

  it('clears the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addToCart(item()));
    act(() => result.current.clearCart());
    expect(result.current.items).toHaveLength(0);
  });
});

describe('localStorage hydration', () => {
  it('loads a valid persisted cart', () => {
    localStorage.setItem('bhaargavi-cart', JSON.stringify([item({ quantity: 3 })]));
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.cartCount).toBe(3);
  });

  it('discards a tampered/invalid-schema cart', () => {
    localStorage.setItem('bhaargavi-cart', JSON.stringify([{ id: 1, price: 'free' }]));
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toHaveLength(0);
  });

  it('discards non-JSON garbage without throwing', () => {
    localStorage.setItem('bhaargavi-cart', 'not-json');
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toHaveLength(0);
  });
});
