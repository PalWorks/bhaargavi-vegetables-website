import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem } from '../types';
import { SITE_CONFIG, CONTACT_PHONE } from '../constants';

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string, weight: string) => void;
  updateQuantity: (itemId: string, weight: string, delta: number) => void;
  updateCustomNote: (itemId: string, weight: string, note: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  cartTotal: number;
  cartCount: number;
  isBelowMinimum: boolean;
  amountNeeded: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = 'bhaargavi-cart';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  // Cart items are keyed by (id + weight) since same product in different sizes = different line items
  const itemKey = (id: string, weight: string) => `${id}__${weight}`;

  const addToCart = (item: CartItem) => {
    setItems(prev => {
      const key = itemKey(item.id, item.weight);
      const existing = prev.find(i => itemKey(i.id, i.weight) === key);
      if (existing) {
        return prev.map(i =>
          itemKey(i.id, i.weight) === key ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string, weight: string) => {
    setItems(prev => prev.filter(i => itemKey(i.id, i.weight) !== itemKey(id, weight)));
  };

  const updateQuantity = (id: string, weight: string, delta: number) => {
    setItems(prev =>
      prev
        .map(i => itemKey(i.id, i.weight) === itemKey(id, weight) ? { ...i, quantity: i.quantity + delta } : i)
        .filter(i => i.quantity > 0)
    );
  };

  const updateCustomNote = (id: string, weight: string, note: string) => {
    setItems(prev =>
      prev.map(i => itemKey(i.id, i.weight) === itemKey(id, weight) ? { ...i, customNote: note } : i)
    );
  };

  const clearCart = () => setItems([]);
  const toggleCart = () => setIsCartOpen(prev => !prev);

  const cartTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const isBelowMinimum = cartTotal < SITE_CONFIG.minOrderValue;
  const amountNeeded = Math.max(0, SITE_CONFIG.minOrderValue - cartTotal);

  return (
    <CartContext.Provider value={{
      items, isCartOpen, addToCart, removeFromCart, updateQuantity,
      updateCustomNote, clearCart, toggleCart,
      cartTotal, cartCount, isBelowMinimum, amountNeeded,
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Build WhatsApp message from cart items
export const buildWhatsAppMessage = (items: CartItem[], cartTotal: number, greeting: string, confirmText: string, customNoteLabel: string): string => {
  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  let msg = `[${timestamp}]%0A%0A${greeting}%0A%0A`;

  items.forEach(item => {
    msg += `${item.quantity} x ${item.name} (${item.weight}) - Rs ${item.price * item.quantity}%0A`;
    if (item.customNote) {
      msg += `  ${customNoteLabel}: ${item.customNote}%0A`;
    }
  });

  msg += `%0A*Total: Rs ${cartTotal}*%0A%0A${confirmText}`;
  return msg;
};

// Record order to Google Apps Script endpoint (best-effort)
export const recordOrder = async (items: CartItem[], cartTotal: number): Promise<void> => {
  const endpointUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
  if (!endpointUrl) return;

  const itemsSummary = items.map(i => `${i.quantity}x ${i.name} ${i.weight}`).join(', ');
  const customNotes = items.filter(i => i.customNote).map(i => `${i.name}: ${i.customNote}`).join('; ');
  const orderId = `BV-${Date.now()}`;

  try {
    await fetch(endpointUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        timestamp: new Date().toISOString(),
        items: itemsSummary,
        total: cartTotal,
        customNote: customNotes || '',
        status: 'New',
        waNumber: CONTACT_PHONE,
      }),
    });
  } catch {
    // non-blocking — WhatsApp still opens
  }
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
