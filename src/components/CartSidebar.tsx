import React, { useRef, useEffect, useState } from 'react';
import { X, Plus, Minus, ShoppingBag, Info, ChevronDown, AlertCircle, MapPin } from 'lucide-react';
import { useCart, buildWhatsAppMessage, recordOrder } from '../context/CartContext';
import { useLanguage } from '../LanguageContext';
import { SITE_CONFIG, WA_NUMBER, MENU_ITEMS } from '../constants';
import { track } from '../utils/analytics';
import { reconcileCartPrices } from '../utils/pricing';

const CartSidebar: React.FC = () => {
  const { isCartOpen, toggleCart, items, updateQuantity, removeFromCart, cartTotal, isBelowMinimum, amountNeeded } = useCart();
  const { t } = useLanguage();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isAddressOpen, setIsAddressOpen] = useState(true);
  const [address, setAddress] = useState('');
  const [addressError, setAddressError] = useState(false);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(true);
  const [waFallbackUrl, setWaFallbackUrl] = useState<string | null>(null);
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

  // Accessibility: Escape closes, focus is trapped inside the drawer, and focus is
  // moved into the drawer on open and restored to the trigger on close.
  useEffect(() => {
    if (!isCartOpen) return;

    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    const focusTimer = window.setTimeout(() => closeBtnRef.current?.focus(), 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); toggleCart(); return; }
      if (e.key !== 'Tab' || !sidebarRef.current) return;
      const focusables = sidebarRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      lastFocusedRef.current?.focus?.();
    };
  }, [isCartOpen, toggleCart]);

  const handleCheckout = () => {
    if (items.length === 0 || isBelowMinimum) return;

    if (address.trim() === '') {
      setAddressError(true);
      setIsAddressOpen(true);
      return;
    }
    setAddressError(false);
    setWaFallbackUrl(null);

    // Authoritative prices from the catalog, not the (potentially tampered) persisted cart.
    const { items: safeItems } = reconcileCartPrices(items, MENU_ITEMS);
    const safeTotal = safeItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const message = buildWhatsAppMessage(
      safeItems, safeTotal,
      t.cart.whatsapp_greeting,
      t.cart.whatsapp_confirm,
      t.cart.whatsapp_custom_note,
      address.trim()
    );
    const url = `https://wa.me/${WA_NUMBER}?text=${message}`;

    // Open WhatsApp synchronously inside the click gesture so mobile popup blockers
    // don't reject it. If it's still blocked (returns null), surface a manual link.
    const win = window.open(url, '_blank');
    if (!win) setWaFallbackUrl(url);

    track('checkout_click', { total: safeTotal, itemCount: totalItemsCount });

    // Best-effort order log — fire and forget so it never blocks the WhatsApp handoff.
    void recordOrder(safeItems, safeTotal, address.trim());
  };

  const progressPct = Math.min(100, (cartTotal / SITE_CONFIG.minOrderValue) * 100);

  return (
    <>
      {/* Overlay */}
      <div aria-hidden="true" className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} />

      {/* Sidebar */}
      <div ref={sidebarRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.cart.title}
        aria-hidden={!isCartOpen}
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
          <button ref={closeBtnRef} onClick={toggleCart} aria-label="Close cart" className="p-2 hover:bg-bv-green-pale rounded-full transition-colors">
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
                      <img loading="lazy" src={item.image} alt={item.name} 
                           onError={(e) => { e.currentTarget.src = '/BhaargaviLogo.jpg'; }}
                           className="w-full h-full object-cover" />
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
                        <span className="font-bold text-bv-dark text-sm">₹ {item.price * item.quantity}</span>
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
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-bv-border bg-bv-card relative">
            
            {/* Collapse/Expand Handle */}
            <button 
              onClick={() => setIsDetailsExpanded(v => !v)}
              className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white border border-bv-border rounded-full p-1 shadow-sm text-bv-muted hover:text-bv-green transition-colors z-10 flex items-center justify-center"
              title={isDetailsExpanded ? "Hide Details" : "Show Details"}
            >
              <ChevronDown size={16} className={`transition-transform duration-300 ${isDetailsExpanded ? '' : 'rotate-180'}`} />
            </button>

            <div className={`transition-all duration-300 overflow-hidden ${isDetailsExpanded ? 'opacity-100 max-h-[800px]' : 'opacity-0 max-h-0'}`}>
              <div className="mb-4 space-y-4">
                {/* Min order progress */}
                {isBelowMinimum && (
                  <div className="p-3 bg-bv-orange-light rounded-xl">
                    <div className="flex items-center gap-2 text-bv-orange text-xs font-semibold mb-2">
                      <AlertCircle size={14} />
                      {t.cart.add_more.replace('{amount}', String(amountNeeded))}
                    </div>
                    <div className="h-2 bg-white rounded-full overflow-hidden">
                      <div className="h-full bg-bv-orange rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-bv-muted mt-1">
                      <span>₹ {cartTotal}</span>
                      <span>₹ {SITE_CONFIG.minOrderValue}</span>
                    </div>
                  </div>
                )}

                {/* Delivery Address */}
                <div className={`border rounded-xl overflow-hidden ${addressError ? 'border-red-400' : 'border-bv-border'}`}>
                  <button onClick={() => setIsAddressOpen(v => !v)}
                    className={`w-full p-3 flex justify-between items-center text-left transition-colors ${addressError ? 'bg-red-50 hover:bg-red-100' : 'bg-bv-green-pale hover:bg-bv-card'}`}>
                    <span className={`font-bold text-sm flex items-center gap-2 ${addressError ? 'text-red-600' : 'text-bv-dark'}`}>
                      <MapPin size={14} className={addressError ? 'text-red-500' : 'text-bv-green'} />
                      Delivery Address
                    </span>
                    <ChevronDown size={15} className={`transition-transform duration-200 ${addressError ? 'text-red-500' : 'text-bv-green'} ${isAddressOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isAddressOpen && (
                    <div className="p-3 bg-white">
                      <textarea
                        value={address}
                        onChange={(e) => { setAddress(e.target.value); if (e.target.value.trim() !== '') setAddressError(false); }}
                        placeholder="Enter your complete delivery address here..."
                        className={`w-full text-sm border rounded-lg px-3 py-2 min-h-[80px] focus:outline-none focus:ring-1 ${addressError ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-bv-border focus:border-bv-green focus:ring-bv-green/20'}`}
                      />
                      {addressError && (
                        <p className="text-red-500 text-xs font-semibold mt-1">Please enter your address to proceed.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Ordering info */}
                <div className="border border-bv-border rounded-xl overflow-hidden">
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
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-bv-muted font-medium">{t.cart.total}</span>
              <span className="text-2xl font-bold text-bv-dark">₹ {cartTotal}</span>
            </div>

            {/* Checkout button */}
            <button onClick={handleCheckout}
              disabled={isBelowMinimum}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all ${
                isBelowMinimum
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#25D366] hover:bg-[#128C7E] text-white hover:shadow-xl active:scale-[0.98]'
              }`}>
              <img loading="lazy" src="/WhatsApp Icon.png" alt="" className={`w-6 h-6 object-contain ${isBelowMinimum ? 'opacity-50 grayscale' : ''}`} />
              {isBelowMinimum
                ? t.cart.min_order.replace('{amount}', String(SITE_CONFIG.minOrderValue))
                : t.cart.checkout}
            </button>

            {/* Fallback if the browser blocked the WhatsApp popup */}
            {waFallbackUrl && (
              <a href={waFallbackUrl} target="_blank" rel="noreferrer"
                className="mt-3 block w-full text-center py-3 rounded-xl font-semibold text-sm bg-bv-green-pale text-bv-green underline underline-offset-2">
                Tap here to open WhatsApp and send your order
              </a>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
