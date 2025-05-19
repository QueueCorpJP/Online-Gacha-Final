import { api } from "../lib/axios";

export interface GachaData {
  id: string;
  name: string;
  description: string;
  type: string;
  price: string;
  duration: string;
  items: {
    name: string;
    rarity: string;
    probability: string;
  }[];
  isActive: boolean;
  imageUrl?: string;
  category?: string;
  rating?: number;
  reviews?: number;
  likes?: number;
  dislikes?: number;
  createdAt: string;
}

export interface CreateGachaDto {
  name: string;
  type: string;
  price: string;
  duration: string;
  description: string;
  items: {
    name: string;
    rarity: string;
    probability: string;
  }[];
  isActive: boolean;
}

export const gachaService = {
  createGacha: async (data: CreateGachaDto) => {
    const response = await api.post('/admin/gacha', data);
    return response.data;
  },
  
  updateGacha: async (id: string, data: Partial<CreateGachaDto>) => {
    const response = await api.put(`/admin/gacha/${id}`, data);
    return response.data;
  },
  
  getGacha: async (id: string) => {
    const response = await api.get<GachaData>(`/admin/gacha/${id}`);
    return response.data;
  },

  getGachas: async (filters?: {
    categories?: string[];
    minPrice?: number;
    maxPrice?: number;
    ratings?: number[];
    sortBy?: string;
  }) => {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.categories?.length) params.append('categories', filters.categories.join(','));
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.ratings?.length) params.append('ratings', filters.ratings.join(','));
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
    }

    const response = await api.get(`/admin/gacha?${params.toString()}`);
    return response.data;
  },
  
  deleteGacha: async (id: string) => {
    const response = await api.delete(`/admin/gacha/${id}`);
    return response.data;
  }
};
