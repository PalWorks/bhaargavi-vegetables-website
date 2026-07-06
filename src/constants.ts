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

// Single source of truth for the WhatsApp number used in every wa.me link and the order log.
// Prefers the Sheet-managed value (SITE_CONFIG.waNumber) so the owner can change it without a
// code edit; falls back to the hardcoded constant if the config value is ever missing.
export const WA_NUMBER = (SITE_CONFIG.waNumber && String(SITE_CONFIG.waNumber).trim()) || CONTACT_PHONE;

// Build the menu from the Google Sheets ProductCatalog (synced into src/data/menu.json).
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
  categories: String(item.category || '').split(',').map(s => s.trim()).filter(Boolean),
  badge: item.badge ? String(item.badge) : undefined,
  isNew: String(item.badge).toLowerCase() === 'new',
  isBestseller: String(item.badge).toLowerCase() === 'bestseller',
  isPreOrder: String(item.badge).toLowerCase() === 'pre-order',
  ingredients: item.ingredients ? String(item.ingredients).split(',').map(s => s.trim()) : [],
  i18n: item.i18n as MenuItem['i18n'],
}));

export const MENU_ITEMS: MenuItem[] = sheetMenuItems;

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
  { id: '1', src: '/hero-banner/hero_1.png', alt: 'Fresh colourful vegetables' },
  { id: '2', src: '/hero-banner/hero_2.png', alt: 'Healthy salad bowl' },
  { id: '3', src: '/hero-banner/hero_3.png', alt: 'Fresh produce on wooden surface' },
];

export const HERO_IMAGES: HeroImage[] = sheetHeroImages.length > 0 ? sheetHeroImages : DEFAULT_HERO_IMAGES;

// Story steps
export const STORY_STEPS: StoryStep[] = [
  { id: '1', image: '/story/story_1.png', titleKey: 'step1_title', captionKey: 'step1_desc' },
  { id: '2', image: '/story/story_2.png', titleKey: 'step2_title', captionKey: 'step2_desc' },
  { id: '3', image: '/story/story_3.png', titleKey: 'step3_title', captionKey: 'step3_desc' },
  { id: '4', image: '/story/story_4.jpg', titleKey: 'step4_title', captionKey: 'step4_desc' },
  { id: '5', image: '/story/story_5.jpg', titleKey: 'step5_title', captionKey: 'step5_desc' },
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