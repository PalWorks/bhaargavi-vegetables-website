import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const StickyCart: React.FC = () => {
  const { cartCount, cartTotal, toggleCart } = useCart();

  if (cartCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
      <button onClick={toggleCart}
        className="flex items-center gap-3 bg-bv-green hover:bg-bv-green-light text-white font-bold px-6 py-3 rounded-full shadow-xl shadow-bv-green/30 hover:shadow-bv-green/50 transition-all hover:scale-105 active:scale-95">
        <ShoppingCart size={18} />
        <span>{cartCount} item{cartCount > 1 ? 's' : ''}</span>
        <span className="h-4 w-px bg-white/40" />
        <span>Rs {cartTotal}</span>
      </button>
    </div>
  );
};

export default StickyCart;
