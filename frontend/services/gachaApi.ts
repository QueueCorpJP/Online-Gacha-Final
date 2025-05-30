import { api } from '@/lib/axios';
import { GachaFormData, GachaResponse } from '@/types/gacha';

export const gachaApi = {
  createGacha: async (data: GachaFormData) => {
    const formData = new FormData();
    
    // Append JSON data
    formData.append('data', JSON.stringify({
      translations: data.translations,
      type: data.type,
      price: data.price,
      period: data.period,
      dailyLimit: data.dailyLimit,
      items: data.items,
      isActive: data.isActive,
    }));

    // Append thumbnail if exists
    if (data.thumbnail) {
      formData.append('thumbnail', data.thumbnail);
    }

    const response = await api.post<GachaResponse>('/admin/gacha', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateGacha: async (id: string, data: GachaFormData) => {
    const formData = new FormData();
    
    formData.append('data', JSON.stringify({
      translations: data.translations,
      type: data.type,
      price: data.price,
      period: data.period,
      dailyLimit: data.dailyLimit,
      items: data.items,
      isActive: data.isActive,
    }));

    if (data.thumbnail) {
      formData.append('thumbnail', data.thumbnail);
    }

    const response = await api.put<GachaResponse>(`/admin/gacha/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getGacha: async (id: string) => {
    const response = await api.get<GachaResponse>(`/admin/gacha/${id}`);
    return response.data;
  },

  getGachas: async (filters?: {
    categories?: string[];
    minPrice?: number;
    maxPrice?: number;
    ratings?: number[];
    sortBy?: string;
    filter?: string;
  }) => {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.categories?.length) {
        // Ensure we're properly handling multiple categories
        filters.categories.forEach(category => {
          params.append('categories', category);
        });
      }
      if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.ratings?.length) {
        // カンマ区切りの文字列として送信
        params.append('ratings', filters.ratings.join(','));
      }
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.filter) params.append('filter', filters.filter);
    }

    const response = await api.get<GachaResponse[]>('/gacha', { params });
    return response.data;
  },

  getAdminGachas: async ({ 
    page = 1, 
    limit = 10,
    filters
  }: {
    page?: number;
    limit?: number;
    filters?: {
      categories?: string[];
      minPrice?: number;
      maxPrice?: number;
      ratings?: number[];
      sortBy?: string;
      filter?: string;
    };
  }) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (filters) {
      if (filters.categories?.length) {
        filters.categories.forEach(category => {
          params.append('categories', category);
        });
      }
      if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.ratings?.length) {
        // カンマ区切りの文字列として送信
        params.append('ratings', filters.ratings.join(','));
      }
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.filter) params.append('filter', filters.filter);
    }

    const response = await api.get<{ data: GachaResponse[]; total: number }>('/admin/gacha/fetch/all', { params });
    return response.data;
  },
};
