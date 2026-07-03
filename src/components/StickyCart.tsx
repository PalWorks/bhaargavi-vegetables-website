import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const StickyCart: React.FC = () => {
  const { cartCount, cartTotal, toggleCart } = useCart();

  if (cartCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-[85vw] max-w-sm">
      <button onClick={toggleCart}
        className="flex items-center justify-between w-full bg-bv-green hover:bg-bv-green-light text-white font-bold px-6 py-3.5 rounded-full shadow-xl shadow-bv-green/30 hover:shadow-bv-green/50 transition-all hover:scale-[1.02] active:scale-[0.98]">
        <div className="flex items-center gap-2">
          <ShoppingBag size={20} />
          <span>{cartCount} item{cartCount > 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="h-4 w-px bg-white/40" />
          <span>₹ {cartTotal}</span>
        </div>
      </button>
    </div>
  );
};

export default StickyCart;
