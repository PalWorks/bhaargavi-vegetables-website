import React, { useRef, useEffect, useState } from 'react';
import { X, Plus, Minus, ShoppingBag, Info, ChevronDown, AlertCircle } from 'lucide-react';
import { useCart, buildWhatsAppMessage, recordOrder } from '../context/CartContext';
import { useLanguage } from '../LanguageContext';
import { SITE_CONFIG, CONTACT_PHONE } from '../constants';

const CartSidebar: React.FC = () => {
  const { isCartOpen, toggleCart, items, updateQuantity, removeFromCart, updateCustomNote, cartTotal, isBelowMinimum, amountNeeded } = useCart();
  const { t } = useLanguage();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);

  const totalItemsCount = items.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => { setIsInfoOpen(items.length <= 2); }, [items.length]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node) && isCartOpen) toggleCart();
    };
    if (isCartOpen) {
      document.addEventListener('mousedown', handleOutside);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen, toggleCart]);

  const handleCheckout = async () => {
    if (items.length === 0 || isBelowMinimum) return;

    // Record order best-effort before opening WhatsApp
    await recordOrder(items, cartTotal);

    const message = buildWhatsAppMessage(
      items, cartTotal,
      t.cart.whatsapp_greeting,
      t.cart.whatsapp_confirm,
      t.cart.whatsapp_custom_note,
    );

    window.open(`https://wa.me/${CONTACT_PHONE}?text=${message}`, '_blank');
  };

  const progressPct = Math.min(100, (cartTotal / SITE_CONFIG.minOrderValue) * 100);

  return (
    <>
      {/* Overlay */}
      <div className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} />

      {/* Sidebar */}
      <div ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[60] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="p-5 border-b border-bv-border flex justify-between items-center bg-bv-card">
          <h2 className="text-xl font-bold flex items-center gap-2 text-bv-dark">
            <ShoppingBag className="text-bv-green" size={22} />
            {t.cart.title}
            {totalItemsCount > 0 && (
              <span className="text-base font-medium text-bv-muted">({totalItemsCount} {t.cart.items})</span>
            )}
          </h2>
          <button onClick={toggleCart} className="p-2 hover:bg-bv-green-pale rounded-full transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-bv-muted gap-4">
              <ShoppingBag size={60} className="opacity-20" />
              <p className="font-medium text-lg">{t.cart.empty}</p>
              <button onClick={toggleCart} className="px-6 py-2 bg-bv-green text-white rounded-full hover:bg-bv-green-light transition-colors text-sm font-semibold">
                {t.products.title}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => {
                const key = `${item.id}__${item.weight}`;
                return (
                  <div key={key} className="flex gap-3 p-3 bg-bv-card rounded-xl border border-bv-border/50">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <p className="font-bold text-bv-dark text-sm leading-snug">{item.name}</p>
                          <p className="text-xs text-bv-green font-semibold">{item.weight}</p>
                        </div>
                        <button onClick={() => removeFromCart(item.id, item.weight)}
                          className="text-bv-muted hover:text-red-500 transition-colors p-0.5 shrink-0">
                          <X size={15} />
                        </button>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="font-bold text-bv-dark text-sm">Rs {item.price * item.quantity}</span>
                        <div className="flex items-center gap-2 bg-white rounded-lg px-2 py-1 border border-bv-border">
                          <button onClick={() => updateQuantity(item.id, item.weight, -1)}
                            className="text-bv-muted hover:text-bv-green transition-colors">
                            <Minus size={13} />
                          </button>
                          <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.weight, 1)}
                            className="text-bv-muted hover:text-bv-green transition-colors">
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Custom note */}
                      {editingNote === key ? (
                        <input type="text" defaultValue={item.customNote || ''}
                          autoFocus
                          onBlur={e => { updateCustomNote(item.id, item.weight, e.target.value); setEditingNote(null); }}
                          placeholder={t.products.custom_size_placeholder}
                          className="mt-2 w-full text-xs border border-bv-border rounded px-2 py-1 focus:outline-none focus:border-bv-green" />
                      ) : (
                        <button onClick={() => setEditingNote(key)}
                          className="mt-1 text-xs text-bv-green underline underline-offset-2">
                          {item.customNote || t.cart.custom_note_label}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-bv-border bg-bv-card">
            {/* Min order progress */}
            {isBelowMinimum && (
              <div className="mb-4 p-3 bg-bv-orange-light rounded-xl">
                <div className="flex items-center gap-2 text-bv-orange text-xs font-semibold mb-2">
                  <AlertCircle size={14} />
                  {t.cart.add_more.replace('{amount}', String(amountNeeded))}
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden">
                  <div className="h-full bg-bv-orange rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-bv-muted mt-1">
                  <span>Rs {cartTotal}</span>
                  <span>Rs {SITE_CONFIG.minOrderValue}</span>
                </div>
              </div>
            )}

            {/* Ordering info */}
            <div className="mb-4 border border-bv-border rounded-xl overflow-hidden">
              <button onClick={() => setIsInfoOpen(v => !v)}
                className="w-full p-3 bg-bv-green-pale flex justify-between items-center text-left hover:bg-bv-card transition-colors">
                <span className="font-bold text-bv-dark text-sm flex items-center gap-2">
                  <Info size={14} className="text-bv-green" />
                  {t.cart.ordering_title}
                </span>
                <ChevronDown size={15} className={`text-bv-green transition-transform duration-200 ${isInfoOpen ? 'rotate-180' : ''}`} />
              </button>
              {isInfoOpen && (
                <div className="p-3 bg-white text-xs text-bv-muted space-y-1">
                  <p>{t.cart.ordering_note}</p>
                  <p>&#x2022; {SITE_CONFIG.deliveryDays}</p>
                  <p>&#x2022; {SITE_CONFIG.deliveryHours}</p>
                  <p>&#x2022; {SITE_CONFIG.deliveryNote}</p>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-bv-muted font-medium">{t.cart.total}</span>
              <span className="text-2xl font-bold text-bv-dark">Rs {cartTotal}</span>
            </div>

            {/* Checkout button */}
            <button onClick={handleCheckout}
              disabled={isBelowMinimum}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all ${
                isBelowMinimum
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#25D366] hover:bg-[#128C7E] text-white hover:shadow-xl active:scale-[0.98]'
              }`}>
              <img src="/WhatsAppLogo.png" alt="" className={`w-6 h-6 ${isBelowMinimum ? '' : 'brightness-0 invert'}`} />
              {isBelowMinimum
                ? t.cart.min_order.replace('{amount}', String(SITE_CONFIG.minOrderValue))
                : t.cart.checkout}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
