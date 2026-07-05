export interface PackSize {
  weight: string;
  price: number;
  listPrice?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  packSizes: PackSize[];
  image: string;
  categories: string[];
  isNew?: boolean;
  isBestseller?: boolean;
  isSoldOut?: boolean;
  isPreOrder?: boolean;
  badge?: string;
  ingredients?: string[];
}

export interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  weight: string;
  quantity: number;
  customNote?: string;
}

export interface SiteConfig {
  minOrderValue: number;
  waNumber: string;
  deliveryDays: string;
  deliveryHours: string;
  deliveryNote: string;
}

export interface Review {
  id: string;
  customerName: string;
  text: string;
  rating: number;
}

export interface ReviewImage {
  id: string;
  src: string;
  alt: string;
  type: 'chat' | 'food' | 'illustration';
  color: string;
}

export interface HeroImage {
  id: string;
  src: string;
  alt: string;
}

export interface InstagramPost {
  id: string;
  image: string;
  caption: string;
  likes: number;
  link: string;
  mediaType: 'image' | 'video';
  videoSrc?: string;
}

export interface StoryStep {
  id: string;
  image: string;
  titleKey: string;
  captionKey: string;
}