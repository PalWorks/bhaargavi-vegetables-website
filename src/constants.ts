import { MenuItem, Review, ReviewImage, HeroImage, StoryStep, InstagramPost, SiteConfig } from './types';
import menuData from './data/menu.json';
import heroBannerData from './data/hero-banner.json';
import testimonialsData from './data/testimonials.json';
import instagramData from './data/instagram.json';
import configData from './data/config.json';

export const LOGO_SRC = '/BhaargaviLogo.jpg';
export const CONTACT_PHONE = '916385114580';
export const CONTACT_PHONE_DISPLAY = '+91 63851 14580';
export const EMAIL = 'bhaargavifreshvegetables@gmail.com';
export const INSTAGRAM_HANDLE = 'bhaargavifreshvegetables';
export const INSTAGRAM_URL = 'https://www.instagram.com/bhaargavifreshvegetables';
export const ADDRESS = 'Plot No. 28, ORR Diamond Avenue, Saibaba Nagar, Pazhanthandalam, Chennai 600044';
export const GOOGLE_MAPS_URL = 'https://maps.google.com/?q=Bhaargavi+Fresh+Vegetables+Chennai+600044';
export const FSSAI_REG = '22426075000434';

// Site config sourced from Sheet 2 via fetch-config.cjs
export const SITE_CONFIG: SiteConfig = configData as SiteConfig;

// Default products (fallback when menu.json is empty)
const DEFAULT_MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    name: 'Sambar Onion Peeled',
    description: 'Fresh sambar onions peeled and ready to use. RO water washed, hygienically processed.',
    packSizes: [{ weight: '200 g', price: 35 }, { weight: '500 g', price: 80 }, { weight: '1 kg', price: 150 }],
    image: '/menu/sambar_onion.png',
    category: 'cut', isBestseller: true,
    ingredients: ['Sambar onion'],
  },
  {
    id: '2',
    name: 'Peeled Garlic',
    description: 'Hand-peeled fresh garlic cloves. Saves prep time, retains full flavour.',
    packSizes: [{ weight: '100 g', price: 30 }, { weight: '200 g', price: 55 }, { weight: '500 g', price: 120 }],
    image: '/menu/peeled_garlic.png',
    category: 'cut',
    ingredients: ['Garlic'],
  },
  {
    id: '3',
    name: 'Carrot Cut',
    description: 'Crisp carrots precision-cut and washed in RO purified water. Ready to cook.',
    packSizes: [{ weight: '250 g', price: 40 }, { weight: '500 g', price: 75 }, { weight: '1 kg', price: 140 }],
    image: '/menu/carrot_cut.png',
    category: 'cut', isBestseller: true,
    ingredients: ['Carrot'],
  },
  {
    id: '4',
    name: 'Beans Cut',
    description: 'Fresh green beans trimmed and cut to perfect poriyal size.',
    packSizes: [{ weight: '250 g', price: 40 }, { weight: '500 g', price: 75 }, { weight: '1 kg', price: 140 }],
    image: '/menu/beans_cut.png',
    category: 'cut',
    ingredients: ['Green beans'],
  },
  {
    id: '5',
    name: 'Carrot and Beans Poriyal Cut',
    description: 'Classic Tamil poriyal mix — carrot and beans cut together and ready to temper.',
    packSizes: [{ weight: '300 g', price: 55 }, { weight: '600 g', price: 100 }, { weight: '1 kg', price: 160 }],
    image: '/menu/poriyal_cut.png',
    category: 'cut', isBestseller: true,
    ingredients: ['Carrot', 'Green beans'],
  },
  {
    id: '6',
    name: 'Sambar Mix',
    description: 'Pre-cut sambar vegetables — drumstick, brinjal, tomato, onion — mixed and washed.',
    packSizes: [{ weight: '200 g', price: 45 }, { weight: '500 g', price: 100 }, { weight: '1 kg', price: 180 }],
    image: '/menu/sambar_mix.png',
    category: 'cut', isBestseller: true,
    ingredients: ['Drumstick', 'Brinjal', 'Tomato', 'Onion'],
  },
  {
    id: '7',
    name: 'Cauliflower Florets',
    description: 'Fresh cauliflower broken into bite-sized florets, RO water washed.',
    packSizes: [{ weight: '200 g', price: 40 }, { weight: '500 g', price: 90 }, { weight: '1 kg', price: 170 }],
    image: '/menu/cauliflower_florets.png',
    category: 'cut',
    ingredients: ['Cauliflower'],
  },
  {
    id: '8',
    name: 'Broccoli Florets',
    description: 'Premium broccoli cut into florets and washed with purified water.',
    packSizes: [{ weight: '200 g', price: 55 }, { weight: '500 g', price: 120 }],
    image: '/menu/broccoli_florets.png',
    category: 'cut',
    ingredients: ['Broccoli'],
  },
  {
    id: '9',
    name: 'Drumstick Cut',
    description: 'Murungakkai pieces cut to sambar length — the cornerstone of Tamil cooking.',
    packSizes: [{ weight: '125 g', price: 30 }, { weight: '250 g', price: 55 }, { weight: '500 g', price: 100 }],
    image: '/menu/drumstick_cut.png',
    category: 'cut',
    ingredients: ['Drumstick (murungakkai)'],
  },
  {
    id: '10',
    name: 'Pumpkin Cut',
    description: 'Golden pumpkin peeled and diced, ready for kootu or halwa.',
    packSizes: [{ weight: '250 g', price: 35 }, { weight: '500 g', price: 65 }, { weight: '1 kg', price: 120 }],
    image: '/menu/pumpkin_cut.png',
    category: 'cut',
    ingredients: ['Pumpkin'],
  },
  {
    id: '11',
    name: 'Lady Finger Diced',
    description: 'Fresh okra diced and ready to fry or add to sambar.',
    packSizes: [{ weight: '200 g', price: 40 }, { weight: '500 g', price: 90 }],
    image: '/menu/lady_finger.png',
    category: 'cut',
    ingredients: ['Lady finger (okra)'],
  },
  {
    id: '12',
    name: 'Yam Cut',
    description: 'Elephant yam cut and ready for frying or curry. No sticky prep needed.',
    packSizes: [{ weight: '250 g', price: 45 }, { weight: '500 g', price: 85 }, { weight: '1 kg', price: 160 }],
    image: '/menu/yam_cut.png',
    category: 'cut',
    ingredients: ['Elephant yam (senai)'],
  },
  {
    id: '13',
    name: 'Peeled Ginger',
    description: 'Fresh ginger peeled and ready to grind or grate.',
    packSizes: [{ weight: '100 g', price: 25 }, { weight: '200 g', price: 45 }],
    image: '/menu/peeled_ginger.png',
    category: 'cut',
    ingredients: ['Ginger'],
  },
  {
    id: '14',
    name: 'Ginger Chopped',
    description: 'Ginger finely chopped and ready to add directly to your masala.',
    packSizes: [{ weight: '100 g', price: 30 }, { weight: '200 g', price: 55 }],
    image: '/menu/ginger_chopped.png',
    category: 'cut',
    ingredients: ['Ginger'],
  },
  {
    id: '15',
    name: 'Grated Coconut',
    description: 'Freshly grated coconut for chutney, kootu, or curry. No mess, no hassle.',
    packSizes: [{ weight: '200 g', price: 45 }, { weight: '500 g', price: 100 }],
    image: '/menu/grated_coconut.png',
    category: 'cut', isBestseller: true,
    ingredients: ['Fresh brown coconut'],
  },
  {
    id: '16',
    name: 'Brown Coconut Chunks',
    description: 'Coconut broken into chunks — perfect for grinding chutney.',
    packSizes: [{ weight: '200 g', price: 35 }, { weight: '500 g', price: 80 }],
    image: '/menu/coconut_chunks.png',
    category: 'cut',
    ingredients: ['Brown coconut'],
  },
  {
    id: '17',
    name: 'Papaya Cut',
    description: 'Ripe papaya peeled and cubed, ready to eat or blend.',
    packSizes: [{ weight: '200 g', price: 40 }, { weight: '500 g', price: 90 }],
    image: '/menu/papaya_cut.png',
    category: 'cut',
    ingredients: ['Papaya'],
  },
  {
    id: '18',
    name: 'Pineapple Cut',
    description: 'Fresh pineapple cored, peeled, and sliced into bite-sized pieces.',
    packSizes: [{ weight: '200 g', price: 45 }, { weight: '500 g', price: 100 }],
    image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&q=80',
    category: 'cut',
    ingredients: ['Pineapple'],
  },
  {
    id: '19',
    name: 'Pomegranate Peeled',
    description: 'Pomegranate arils separated and ready to eat, garnish, or juice.',
    packSizes: [{ weight: '100 g', price: 55 }, { weight: '200 g', price: 100 }],
    image: 'https://images.unsplash.com/photo-1541344999736-83eca272f6fc?w=400&q=80',
    category: 'cut',
    ingredients: ['Pomegranate'],
  },
  {
    id: '20',
    name: 'Raw Mango Cut',
    description: 'Tangy raw mango cut and ready for pickle, chutney, or rice.',
    packSizes: [{ weight: '200 g', price: 40 }, { weight: '500 g', price: 90 }],
    image: 'https://images.unsplash.com/photo-1601493700631-2851526337da?w=400&q=80',
    category: 'cut',
    ingredients: ['Raw mango'],
  },
  {
    id: '21',
    name: 'Muskmelon Cut',
    description: 'Sweet muskmelon deseeded and cut — a refreshing summer snack.',
    packSizes: [{ weight: '200 g', price: 40 }, { weight: '500 g', price: 90 }],
    image: 'https://images.unsplash.com/photo-1571770095004-6b61b1cf308a?w=400&q=80',
    category: 'cut',
    ingredients: ['Muskmelon'],
  },
  {
    id: '22',
    name: 'Ripe Peeled Jackfruit',
    description: 'Ripe jackfruit segments peeled and cleaned — sweet, fragrant, effort-free.',
    packSizes: [{ weight: '250 g', price: 60 }, { weight: '500 g', price: 110 }],
    image: 'https://images.unsplash.com/photo-1590005354167-6da97870c757?w=400&q=80',
    category: 'cut',
    ingredients: ['Jackfruit'],
  },
  // Health Packs
  {
    id: '23',
    name: 'Brown Channa Sprouts',
    description: 'Freshly sprouted brown chickpeas — high protein, no cooking needed.',
    packSizes: [{ weight: '200 g', price: 50 }, { weight: '500 g', price: 115 }],
    image: 'https://images.unsplash.com/photo-1562184552-997c461abbe6?w=400&q=80',
    category: 'health', isNew: true,
    ingredients: ['Brown chickpeas'],
  },
  {
    id: '24',
    name: 'Mixed Sprouts',
    description: 'A nutritious blend of sprouted lentils, chickpeas, and moong.',
    packSizes: [{ weight: '200 g', price: 50 }, { weight: '500 g', price: 115 }],
    image: 'https://images.unsplash.com/photo-1562184552-997c461abbe6?w=400&q=80',
    category: 'health', isBestseller: true,
    ingredients: ['Chickpeas', 'Moong', 'Lentils'],
  },
  {
    id: '25',
    name: 'Green Moong Sprouts',
    description: 'Crisp green moong sprouts — great for salads, sundal, or a quick snack.',
    packSizes: [{ weight: '200 g', price: 45 }, { weight: '500 g', price: 100 }],
    image: 'https://images.unsplash.com/photo-1562184552-997c461abbe6?w=400&q=80',
    category: 'health',
    ingredients: ['Green moong'],
  },
  {
    id: '26',
    name: 'Salad Mix',
    description: 'A fresh blend of salad vegetables — cucumber, carrot, tomato, lettuce.',
    packSizes: [{ weight: '200 g', price: 55 }, { weight: '500 g', price: 120 }],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
    category: 'health',
    ingredients: ['Cucumber', 'Carrot', 'Tomato', 'Lettuce'],
  },
  // Offers
  {
    id: '27',
    name: 'Weekly Veggie Combo',
    description: 'Our handpicked combo of the freshest vegetables for the week — sambar mix, poriyal cut, sprouts and salad mix.',
    packSizes: [{ weight: '1 kg', price: 299, listPrice: 380 }],
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
    category: 'offers', isPreOrder: true, badge: 'Best Value',
    ingredients: ['Sambar mix', 'Poriyal mix', 'Mixed sprouts', 'Salad mix'],
  },
];

// Build menu from Google Sheets data if available; else use defaults
const buildPackSizes = (item: Record<string, unknown>): import('./types').PackSize[] => {
  const sizes = ['100g', '200g', '250g', '300g', '500g', '1kg', '2kg', '3kg', '5kg', '10kg'];
  const labelMap: Record<string, string> = {
    '100g': '100 g', '200g': '200 g', '250g': '250 g', '300g': '300 g',
    '500g': '500 g', '1kg': '1 kg', '2kg': '2 kg', '3kg': '3 kg', '5kg': '5 kg', '10kg': '10 kg',
  };
  return sizes
    .filter(s => item[s] && !isNaN(Number(item[s])))
    .map(s => ({ weight: labelMap[s], price: Number(item[s]) }));
};

const sheetMenuItems: MenuItem[] = (menuData as Record<string, unknown>[]).map(item => ({
  id: String(item.id),
  name: String(item.name),
  description: String(item.description || ''),
  packSizes: buildPackSizes(item),
  image: String(item.image || ''),
  category: (item.category as MenuItem['category']) || 'cut',
  badge: item.badge ? String(item.badge) : undefined,
  isNew: String(item.badge).toLowerCase() === 'new',
  isBestseller: String(item.badge).toLowerCase() === 'bestseller',
  isPreOrder: String(item.badge).toLowerCase() === 'pre-order',
  ingredients: item.ingredients ? String(item.ingredients).split(',').map(s => s.trim()) : [],
}));

export const MENU_ITEMS: MenuItem[] = sheetMenuItems.length > 0 ? sheetMenuItems : DEFAULT_MENU_ITEMS;

// Reviews
export const REVIEWS: Review[] = [
  { id: '1', customerName: 'Kavitha Rajan', text: 'No more morning prep stress! The cut vegetables are always fresh and perfectly sized. A true lifesaver for working moms in Chennai.', rating: 5 },
  { id: '2', customerName: 'Senthil Kumar', text: 'The sambar mix pack saves me 30 minutes every evening. Quality is consistent every single time. Highly recommend!', rating: 5 },
  { id: '3', customerName: 'Priya Sundaram', text: 'My kids actually eat their vegetables now because they look so fresh and appealing. Brilliant quality and great service.', rating: 5 },
  { id: '4', customerName: 'Meenakshi Anand', text: 'The sprouts are incredibly fresh — no smell, no sliminess. I order every week without fail. Best in Chennai!', rating: 5 },
  { id: '5', customerName: 'Arun Venkatesh', text: 'FSSAI certified and RO washed — that is what won me over. Finally a brand I can fully trust for my family.', rating: 5 },
];

// Default testimonial colours
const TESTIMONIAL_COLORS = ['#2E7D32', '#66BB6A', '#F57C00', '#1B2720', '#388E3C'];

const sheetTestimonials: ReviewImage[] = (testimonialsData as Record<string, unknown>[]).map((item, i) => ({
  id: String(item.id),
  src: String(item.src),
  alt: String(item.alt || 'Customer feedback'),
  type: (item.type || 'chat') as ReviewImage['type'],
  color: String(item.color || TESTIMONIAL_COLORS[i % TESTIMONIAL_COLORS.length]),
}));

const DEFAULT_REVIEW_GALLERY: ReviewImage[] = [
  { id: '1', src: '', alt: 'Kavitha Rajan', type: 'illustration', color: '#2E7D32' },
  { id: '2', src: '', alt: 'Senthil Kumar', type: 'illustration', color: '#66BB6A' },
  { id: '3', src: '', alt: 'Priya Sundaram', type: 'illustration', color: '#F57C00' },
  { id: '4', src: '', alt: 'Meenakshi Anand', type: 'illustration', color: '#1B2720' },
  { id: '5', src: '', alt: 'Arun Venkatesh', type: 'illustration', color: '#388E3C' },
];

export const REVIEW_GALLERY: ReviewImage[] = sheetTestimonials.length > 0 ? sheetTestimonials : DEFAULT_REVIEW_GALLERY;

// Hero images
const sheetHeroImages: HeroImage[] = (heroBannerData as Record<string, unknown>[]).map(item => ({
  id: String(item.id),
  src: String(item.src),
  alt: String(item.alt || 'Bhaargavi Fresh Cuts'),
}));

const DEFAULT_HERO_IMAGES: HeroImage[] = [
  { id: '1', src: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&q=80', alt: 'Fresh colourful vegetables' },
  { id: '2', src: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=80', alt: 'Healthy salad bowl' },
  { id: '3', src: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80', alt: 'Fresh produce on wooden surface' },
];

export const HERO_IMAGES: HeroImage[] = sheetHeroImages.length > 0 ? sheetHeroImages : DEFAULT_HERO_IMAGES;

// Story steps
export const STORY_STEPS: StoryStep[] = [
  { id: '1', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80', titleKey: 'step1_title', captionKey: 'step1_desc' },
  { id: '2', image: 'https://images.unsplash.com/photo-1465379944081-7f47de8d74ac?w=400&q=80', titleKey: 'step2_title', captionKey: 'step2_desc' },
  { id: '3', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80', titleKey: 'step3_title', captionKey: 'step3_desc' },
  { id: '4', image: 'https://images.unsplash.com/photo-1627483262769-04d0a1401487?w=400&q=80', titleKey: 'step4_title', captionKey: 'step4_desc' },
  { id: '5', image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&q=80', titleKey: 'step5_title', captionKey: 'step5_desc' },
];

// Instagram posts
const cleanedInstagramData: InstagramPost[] = (instagramData as Record<string, unknown>[]).map(
  ({ _imageUrl, _videoUrl, ...post }) => post as unknown as InstagramPost
);

const DEFAULT_INSTAGRAM_POSTS: InstagramPost[] = [
  { id: '1', image: 'https://picsum.photos/seed/bv1/400/400', caption: 'Fresh sambar mix ready for your kitchen! Order now via WhatsApp. #FreshVegetables #Chennai', likes: 124, link: INSTAGRAM_URL, mediaType: 'image' },
  { id: '2', image: 'https://picsum.photos/seed/bv2/400/400', caption: 'RO water washed broccoli florets. Zero compromise on hygiene. #HealthyEating', likes: 89, link: INSTAGRAM_URL, mediaType: 'image' },
  { id: '3', image: 'https://picsum.photos/seed/bv3/400/400', caption: 'Monday morning sprouts — the best way to start your week. #Sprouts #Nutrition', likes: 245, link: INSTAGRAM_URL, mediaType: 'image' },
  { id: '4', image: 'https://picsum.photos/seed/bv4/400/400', caption: 'Our AC room cutting process ensures maximum hygiene. #FSSAI #FoodSafety', likes: 167, link: INSTAGRAM_URL, mediaType: 'image' },
  { id: '5', image: 'https://picsum.photos/seed/bv5/400/400', caption: 'Poriyal cut ready in minutes. Your evening cooking just got easier! #ChennaiFood', likes: 310, link: INSTAGRAM_URL, mediaType: 'image' },
  { id: '6', image: 'https://picsum.photos/seed/bv6/400/400', caption: 'Fresh grated coconut — the soul of South Indian cooking. #Coconut #SouthIndian', likes: 190, link: INSTAGRAM_URL, mediaType: 'image' },
  { id: '7', image: 'https://picsum.photos/seed/bv7/400/400', caption: 'Minimum order ₹ 199. Delivery across Chennai. Order on WhatsApp! #Delivery', likes: 210, link: INSTAGRAM_URL, mediaType: 'image' },
  { id: '8', image: 'https://picsum.photos/seed/bv8/400/400', caption: 'Jackfruit season is here! Ripe peeled jackfruit available now. #Jackfruit', likes: 155, link: INSTAGRAM_URL, mediaType: 'image' },
  { id: '9', image: 'https://picsum.photos/seed/bv9/400/400', caption: 'Cold chain storage keeps every vegetable farm fresh. #ColdChain #FreshCuts', likes: 280, link: INSTAGRAM_URL, mediaType: 'image' },
  { id: '10', image: 'https://picsum.photos/seed/bv10/400/400', caption: 'Pomegranate arils — ready to garnish your biriyani. #Pomegranate', likes: 300, link: INSTAGRAM_URL, mediaType: 'image' },
  { id: '11', image: 'https://picsum.photos/seed/bv11/400/400', caption: 'Weekly combo pack now available. Pre-order to secure yours! #Combo', likes: 188, link: INSTAGRAM_URL, mediaType: 'image' },
  { id: '12', image: 'https://picsum.photos/seed/bv12/400/400', caption: 'Thank you Chennai for the love! 500+ happy customers and growing. #ChennaiLoves', likes: 400, link: INSTAGRAM_URL, mediaType: 'image' },
  { id: '13', image: 'https://picsum.photos/seed/bv13/400/400', caption: 'Custom pack sizes available! DM us for special requirements. #CustomPack', likes: 140, link: INSTAGRAM_URL, mediaType: 'image' },
  { id: '14', image: 'https://picsum.photos/seed/bv14/400/400', caption: 'Healthy · Fresh · Ready to Cook. That is our promise every day. #BhaargaviFreshCuts', likes: 222, link: INSTAGRAM_URL, mediaType: 'image' },
];

export const INSTAGRAM_POSTS: InstagramPost[] = cleanedInstagramData.length > 0
  ? cleanedInstagramData
  : DEFAULT_INSTAGRAM_POSTS;