import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ShoppingBag, MessageCircle } from 'lucide-react';
import { MENU_ITEMS, WA_NUMBER } from '../constants';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../LanguageContext';
import { PackSize } from '../types';
import { productSlug, categorySlug } from '../utils/slug';
import { ProductCard } from './Products';
import Seo from './Seo';
import JsonLd from './JsonLd';
import NotFound from './NotFound';

const SITE_URL = 'https://bhaargavifreshcuts.com';

const ProductPage: React.FC = () => {
  const { slug = '' } = useParams();
  const { t, language } = useLanguage();
  const { addToCart } = useCart();

  const item = MENU_ITEMS.find((i) => productSlug(i.name) === slug);
  const [selectedSize, setSelectedSize] = useState<PackSize | undefined>(item?.packSizes[0]);

  if (!item || !item.packSizes.length) return <NotFound />;

  const loc = item.i18n?.[language];
  const name = loc?.name || item.name;
  const description = loc?.description || item.description;
  const ingredients = (loc?.ingredients && loc.ingredients.length ? loc.ingredients : item.ingredients) || [];
  const size = selectedSize || item.packSizes[0];

  const category = item.categories[0];
  const path = `/products/${slug}/`;
  const prices = item.packSizes.map((p) => p.price);
  const lowPrice = Math.min(...prices);
  const highPrice = Math.max(...prices);

  const title = `${item.name} - Buy Fresh Cut Online in Chennai | Bhaargavi Fresh Cuts`;
  const metaDescription = `${item.description} Order ${item.name} online in Chennai via WhatsApp. FSSAI-certified, RO water washed, delivered fresh.`;

  const handleAdd = () => {
    addToCart({ id: item.id, name: item.name, image: item.image, price: size.price, weight: size.weight, quantity: 1 });
  };

  const waText = encodeURIComponent(`Hi, I'd like to order ${item.name} (${size.weight}) - ₹${size.price}.`);

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.name,
    description: item.description,
    image: `${SITE_URL}${item.image}`,
    brand: { '@type': 'Brand', name: 'Bhaargavi Fresh Cuts' },
    category,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice,
      highPrice,
      offerCount: item.packSizes.length,
      availability: item.isSoldOut ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      url: `${SITE_URL}${path}`,
    },
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      ...(category
        ? [{ '@type': 'ListItem', position: 2, name: category, item: `${SITE_URL}/category/${categorySlug(category)}/` }]
        : []),
      { '@type': 'ListItem', position: category ? 3 : 2, name: item.name, item: `${SITE_URL}${path}` },
    ],
  };

  const related = MENU_ITEMS.filter(
    (i) => i.id !== item.id && i.categories.some((c) => item.categories.includes(c))
  ).slice(0, 4);

  return (
    <div className="pt-24 pb-16 min-h-screen bg-bv-cream/30">
      <Seo title={title} description={metaDescription} path={path} />
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumb} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-bv-muted mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-bv-green">
            Home
          </Link>
          {category && (
            <>
              <span className="mx-2">/</span>
              <Link to={`/category/${categorySlug(category)}/`} className="hover:text-bv-green">
                {category}
              </Link>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-bv-dark">{name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="rounded-2xl overflow-hidden bg-bv-card border border-bv-border">
            <img
              src={item.image}
              alt={name}
              width={800}
              height={800}
              onError={(e) => {
                e.currentTarget.src = '/BhaargaviLogo.jpg';
              }}
              className="w-full aspect-square object-cover"
            />
          </div>

          <div>
            <h1 className="font-display text-3xl sm:text-4xl text-bv-dark mb-3">{name}</h1>
            <p className="text-bv-muted leading-relaxed mb-6">{description}</p>

            {ingredients.length > 0 && (
              <div className="mb-6">
                <p className="text-xs text-bv-muted font-bold tracking-wider uppercase mb-2">{t.products.ingredients}</p>
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ing) => (
                    <span key={ing} className="text-xs bg-white text-bv-dark px-3 py-1 rounded-full border border-bv-border">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-5">
              <p className="text-sm text-bv-muted font-medium mb-2">{t.products.select_size}</p>
              <div className="flex flex-wrap gap-2">
                {item.packSizes.map((s) => (
                  <button
                    key={s.weight}
                    onClick={() => setSelectedSize(s)}
                    className={`text-sm font-semibold px-4 py-2 rounded-full border transition-all ${
                      size.weight === s.weight
                        ? 'bg-bv-green text-white border-bv-green'
                        : 'bg-white text-bv-dark border-bv-border hover:border-bv-green'
                    }`}
                  >
                    {s.weight} &middot; ₹{s.price}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-bv-green font-bold text-3xl">₹ {size.price}</span>
              <span className="text-bv-muted text-sm">/ {size.weight}</span>
            </div>

            {item.isSoldOut ? (
              <button disabled className="w-full py-3 bg-gray-100 text-gray-400 rounded-xl font-semibold cursor-not-allowed">
                {t.products.sold_out}
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAdd}
                  className="flex-1 py-3 bg-bv-green hover:bg-bv-green-light text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <ShoppingBag size={18} />
                  {t.products.add}
                </button>
                <a
                  href={`https://wa.me/${WA_NUMBER}?text=${waText}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 bg-white border border-bv-green text-bv-green rounded-xl font-semibold transition-all flex items-center justify-center gap-2 hover:bg-bv-green-pale"
                >
                  <MessageCircle size={18} />
                  Order on WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl text-bv-dark mb-6">You may also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.map((r) => (
                <ProductCard key={r.id} item={r} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
