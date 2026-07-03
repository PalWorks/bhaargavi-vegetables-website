import React, { useState } from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../LanguageContext';
import { MENU_ITEMS } from '../constants';
import { MenuItem, PackSize } from '../types';

type Category = 'all' | 'fresh' | 'cut' | 'health' | 'offers';

const Badge: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${color}`}>
    {label}
  </span>
);

interface ProductCardProps {
  item: MenuItem;
}

const ProductCard: React.FC<ProductCardProps> = ({ item }) => {
  const { t } = useLanguage();
  const { addToCart, items } = useCart();
  const [selectedSize, setSelectedSize] = useState<PackSize>(item.packSizes[0]);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [customNote, setCustomNote] = useState('');

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
      customNote: customNote || undefined,
    });
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 border border-bv-border/50 flex flex-col">
      {/* Image */}
      <div className="relative h-44 bg-bv-card overflow-hidden">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {item.isBestseller && <Badge label={t.products.bestseller} color="bg-bv-orange text-white" />}
          {item.isNew && <Badge label={t.products.new_label} color="bg-bv-green text-white" />}
          {item.isPreOrder && <Badge label={t.products.pre_order} color="bg-blue-500 text-white" />}
          {item.isSoldOut && <Badge label={t.products.sold_out} color="bg-gray-400 text-white" />}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-bv-dark text-base leading-snug mb-1">{item.name}</h3>
        <p className="text-bv-muted text-xs leading-relaxed mb-3 flex-1">{item.description}</p>

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
          <span className="text-bv-green font-bold text-xl">Rs {selectedSize.price}</span>
          {selectedSize.listPrice && (
            <span className="text-bv-muted text-sm line-through">Rs {selectedSize.listPrice}</span>
          )}
        </div>

        {/* Custom note toggle */}
        <button onClick={() => setShowNoteInput(v => !v)}
          className="text-xs text-bv-green underline underline-offset-2 mb-2 text-left hover:text-bv-green-light transition-colors">
          {t.products.custom_size}
        </button>
        {showNoteInput && (
          <input type="text" value={customNote} onChange={e => setCustomNote(e.target.value)}
            placeholder={t.products.custom_size_placeholder}
            className="text-xs border border-bv-border rounded-lg px-3 py-2 mb-3 w-full focus:outline-none focus:border-bv-green focus:ring-1 focus:ring-bv-green/20" />
        )}

        {/* Add to cart */}
        {item.isSoldOut ? (
          <button disabled className="w-full py-2.5 bg-gray-100 text-gray-400 rounded-xl font-semibold text-sm cursor-not-allowed">
            {t.products.sold_out}
          </button>
        ) : inCart ? (
          <div className="flex items-center justify-between bg-bv-green-pale rounded-xl px-3 py-2">
            <span className="text-xs font-semibold text-bv-green">In cart ({inCart.quantity})</span>
            <button onClick={handleAdd} className="bg-bv-green text-white rounded-full p-1 hover:bg-bv-green-light transition-colors">
              <Plus size={14} />
            </button>
          </div>
        ) : (
          <button onClick={handleAdd}
            className="w-full py-2.5 bg-bv-green hover:bg-bv-green-light text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-95">
            <ShoppingCart size={15} />
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

  const categories: { key: Category; label: string }[] = [
    { key: 'all', label: t.products.all },
    { key: 'fresh', label: t.products.fresh },
    { key: 'cut', label: t.products.cut },
    { key: 'health', label: t.products.health },
    { key: 'offers', label: t.products.offers },
  ];

  const filtered = activeCategory === 'all'
    ? MENU_ITEMS
    : MENU_ITEMS.filter(i => i.category === activeCategory);

  return (
    <section id="products" className="py-20 bg-bv-cream">
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
