import React, { useState } from 'react';
import { Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../LanguageContext';
import { MENU_ITEMS } from '../constants';
import { MenuItem, PackSize } from '../types';

type Category = string;

const Badge: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${color}`}>
    {label}
  </span>
);

interface ProductCardProps {
  item: MenuItem;
}

const ProductCard: React.FC<ProductCardProps> = ({ item }) => {
  const { t, language } = useLanguage();
  const { addToCart, items } = useCart();
  const [selectedSize, setSelectedSize] = useState<PackSize>(item.packSizes[0]);

  // Display uses the auto-translated content (English fallback). The cart/order
  // always uses the English name so WhatsApp orders and server-side price
  // matching against the catalog stay consistent.
  const loc = item.i18n?.[language];
  const name = loc?.name || item.name;
  const description = loc?.description || item.description;
  const ingredients = (loc?.ingredients && loc.ingredients.length ? loc.ingredients : item.ingredients) || [];

  const cartKey = `${item.id}__${selectedSize.weight}`;
  const inCart = items.find(i => `${i.id}__${i.weight}` === cartKey);

  const handleAdd = () => {
    addToCart({
      id: item.id,
      name: item.name,
      image: item.image,
      price: selectedSize.price,
      weight: selectedSize.weight,
      quantity: 1,
    });
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 border border-bv-border/50 flex flex-col">
      {/* Image */}
      <div className="relative h-44 bg-bv-card overflow-hidden">
        <img loading="lazy" src={item.image} alt={name}
             onError={(e) => { e.currentTarget.src = '/BhaargaviLogo.jpg'; }}
             className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {item.isBestseller && <Badge label={t.products.bestseller} color="bg-bv-orange text-white" />}
          {item.isNew && <Badge label={t.products.new_label} color="bg-bv-green text-white" />}
          {item.isPreOrder && <Badge label={t.products.pre_order} color="bg-blue-500 text-white" />}
          {item.isSoldOut && <Badge label={t.products.sold_out} color="bg-gray-400 text-white" />}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-bv-dark text-base leading-snug mb-1">{name}</h3>
        <p className="text-bv-muted text-xs leading-relaxed mb-3">{description}</p>

        {/* Ingredients */}
        {ingredients.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] text-bv-muted font-bold tracking-wider uppercase mb-1.5">{t.products.ingredients}</p>
            <div className="flex flex-wrap gap-1.5">
              {ingredients.map(ing => (
                <span key={ing} className="text-[10px] bg-gray-100 text-bv-dark px-2 py-0.5 rounded border border-gray-200">
                  {ing}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="flex-1" />

        {/* Pack size selector */}
        <div className="mb-3">
          <p className="text-xs text-bv-muted font-medium mb-1.5">{t.products.select_size}</p>
          <div className="flex flex-wrap gap-1.5">
            {item.packSizes.map(size => (
              <button key={size.weight}
                onClick={() => setSelectedSize(size)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${
                  selectedSize.weight === size.weight
                    ? 'bg-bv-green text-white border-bv-green'
                    : 'bg-bv-card text-bv-dark border-bv-border hover:border-bv-green'
                }`}>
                {size.weight}
              </button>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-bv-green font-bold text-xl">₹ {selectedSize.price}</span>
          {selectedSize.listPrice && (
            <span className="text-bv-muted text-sm line-through">₹ {selectedSize.listPrice}</span>
          )}
        </div>


        {/* Add to cart */}
        {item.isSoldOut ? (
          <button disabled className="w-full py-2.5 bg-gray-100 text-gray-400 rounded-xl font-semibold text-sm cursor-not-allowed">
            {t.products.sold_out}
          </button>
        ) : inCart ? (
          <div className="flex items-center justify-between bg-bv-green-pale rounded-xl px-3 py-2">
            <span className="text-xs font-semibold text-bv-green">{t.products.in_cart} ({inCart.quantity})</span>
            <button onClick={handleAdd} className="bg-bv-green text-white rounded-full p-1 hover:bg-bv-green-light transition-colors">
              <Plus size={14} />
            </button>
          </div>
        ) : (
          <button onClick={handleAdd}
            className="w-full py-2.5 bg-bv-green hover:bg-bv-green-light text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-95">
            <ShoppingBag size={15} />
            {t.products.add}
          </button>
        )}
      </div>
    </div>
  );
};

const Products: React.FC = () => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  // Categories are data-driven: any keyword in the sheet's Category column becomes a tab.
  // An item may list several (comma-separated) and appears under each. Matching is
  // case-insensitive; the four known keys keep their translated labels, any new keyword
  // is shown exactly as typed in the sheet. "All" always shows everything.
  const knownLabels: Record<string, string> = {
    fresh: t.products.fresh, cut: t.products.cut, health: t.products.health, offers: t.products.offers,
  };
  const seen = new Map<string, string>(); // lowercased key -> display label (first occurrence)
  MENU_ITEMS.forEach(i => i.categories.forEach(c => {
    const key = c.trim().toLowerCase();
    if (key && !seen.has(key)) seen.set(key, knownLabels[key] || c.trim());
  }));
  const categories: { key: Category; label: string }[] = [
    { key: 'all', label: t.products.all },
    ...Array.from(seen, ([key, label]) => ({ key, label })),
  ];

  const filtered = activeCategory === 'all'
    ? MENU_ITEMS
    : MENU_ITEMS.filter(i => i.categories.some(c => c.trim().toLowerCase() === activeCategory));

  return (
    <section id="products" className="py-20 bg-bv-cream/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-bv-green font-semibold text-sm tracking-widest uppercase mb-3">{t.products.tag}</p>
          <h2 className="font-display text-3xl sm:text-4xl text-bv-dark">{t.products.title}</h2>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map(cat => (
            <button key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat.key
                  ? 'bg-bv-green text-white shadow-md shadow-bv-green/25'
                  : 'bg-white text-bv-muted border border-bv-border hover:border-bv-green hover:text-bv-green'
              }`}>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {filtered.length === 0 ? (
          <p className="text-center text-bv-muted py-12">{t.products.no_products}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(item => <ProductCard key={item.id} item={item} />)}
          </div>
        )}
      </div>
    </section>
  );
};

export default Products;
