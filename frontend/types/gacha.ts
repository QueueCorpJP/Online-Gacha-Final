export interface GachaFormData {
  translations: {
    ja: LanguageContent;
    en: LanguageContent;
    zh: LanguageContent;
  };
  categoryId: string;
  type: 'normal' | 'limited' | 'special';
  price: number;
  period: number;
  dailyLimit: number | null;
  items: GachaItem[];
  isActive: boolean;
  isOneTimeFreeEnabled: boolean;
  thumbnail?: string | File;
  pityThreshold: number;
}

export interface LanguageContent {
  name: string;
  description: string;
}

export interface GachaItem {
  id: string;
  name: string;
  rarity: "S" | "A" | "B" | "C" | "D";
  probability: number;
  stock?: number;  // Make stock optional
  image?: File;
  imageUrl?: string;
  hasNewImage?: boolean;
  imageIndex?: number;
}

export interface GachaResponse extends Omit<GachaFormData, 'thumbnail'> {
  id: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    order: number;
  };
}

export interface GachaFilters {
  filter?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  ratings?: number[];
  sortBy?: string;
}

export interface GachaGridProps {
  initialFilters: GachaFilters;
}
