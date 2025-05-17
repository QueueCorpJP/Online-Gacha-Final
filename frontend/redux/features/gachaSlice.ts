import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { gachaApi } from '@/services/gachaApi';
import { api } from '@/lib/axios';
import { GachaFormData } from '@/types/gacha';

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface GachaData {
  id: string;
  translations: {
    ja: { name: string; description: string };
    en: { name: string; description: string };
    zh: { name: string; description: string };
  };
  name: string;
  description: string;
  type: string;
  price: string;
  period?: string;
  duration?: string;
  items: {
    id: string,
    name: string;
    rarity: string;
    probability: string;
    exchangeRate?: number;
    image?: string;
    stock?: number;
    psaGrading?: string;
    unopened?: boolean;
  }[];
  isActive: boolean;
  isOneTimeFreeEnabled: boolean;
  thumbnail: string;
  lastOnePrize?: {
    id: string;
    name: string;
    image?: string;
  };
  category?: {
    id: string;
    name: string;
    order: number;
  };
  rating?: number;
  reviews?: number;
  likes?: number;
  dislikes?: number;
  dropRates?: Record<string, number>;
  pricePerDraw?: number;
  totalStock?: number;
  animationVideo?: string;
  dailyLimit?: number;
  createdAt: string;
  pityThreshold: number;
}

interface GachaState {
  loading: boolean;
  error: string | null;
  currentGacha: GachaData | null;
  gachas: GachaData[];
  filters?: {
    categories: string[];
    minPrice: number | null;
    maxPrice: number | null;
    ratings: number[];
    sortBy: string;
  };
  total: number;
}

const initialState: GachaState = {
  loading: false,
  error: null,
  currentGacha: null,
  gachas: [],
  filters: {
    categories: [],
    minPrice: null,
    maxPrice: null,
    ratings: [],
    sortBy: 'recommended'
  },
  total: 0
};

export const fetchGachaById = createAsyncThunk(
  'gacha/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await gachaApi.getGacha(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch gacha details');
    }
  }
);

export const fetchGachas = createAsyncThunk(
  'gacha/fetchAll',
  async (filters: {
    categories?: string[];
    minPrice?: number;
    maxPrice?: number;
    ratings?: number[];
    sortBy?: string;
    filter?: string;
  } | undefined, { rejectWithValue }) => {
    try {
      const response = await gachaApi.getGachas(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch gachas');
    }
  }
);

export const createGacha = createAsyncThunk(
  'gacha/create',
  async (formData: FormData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/admin/gacha`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData, // FormData will automatically set the correct Content-Type
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    return response.json();
  }
);

export const updateGacha = createAsyncThunk(
  'gacha/update',
  async ({ id, data }: { id: string; data: FormData }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/admin/gacha/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: data, // FormData will automatically set the correct Content-Type
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    return response.json();
  }
);

export const fetchAdminGachas = createAsyncThunk(
  'gacha/fetchAdmin',
  async ({ 
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
  }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      if (filters) {
        // ... your existing filter logic ...
      }
      
      const response = await gachaApi.getAdminGachas({ page, limit, ...filters });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch gachas');
    }
  }
);

export const deleteGacha = createAsyncThunk(
  'gacha/deleteGacha',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/gacha/${id}`);
      return id;
    } catch (error: any) {
      // Return the specific error message from the backend
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete gacha'
      );
    }
  }
);

export const fetchGachasByFilters = createAsyncThunk(
  'gachas/fetchByFilters',
  async (filters: GachaFilters, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();

      // フィルター条件をパラメータに追加
      if (filters.minPrice !== undefined) {
        params.append('minPrice', filters.minPrice.toString());
      }
      if (filters.maxPrice !== undefined) {
        params.append('maxPrice', filters.maxPrice.toString());
      }
      if (filters.category) {
        params.append('category', filters.category);
      }
      if (filters.type) {
        params.append('type', filters.type);
      }
      if (filters.sort) {
        params.append('sort', filters.sort);
      }
      if (filters.order) {
        params.append('order', filters.order);
      }
      if (filters.page) {
        params.append('page', filters.page.toString());
      }
      if (filters.limit) {
        params.append('limit', filters.limit.toString());
      }
      if (filters.search) {
        params.append('search', filters.search);
      }

      // API呼び出し
      const response = await api.get(`/gachas?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const gachaSlice = createSlice({
  name: 'gacha',
  initialState,
  reducers: {
    clearCurrentGacha: (state) => {
      state.currentGacha = null;
      state.error = null;
    },
    selectGacha: (state, action) => {
      console.log("current payload", action.payload)
      state.currentGacha = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<GachaFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGachaById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGachaById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGacha = {
          translations: {
            ja: { 
              name: action.payload.translations.ja.name,
              description: action.payload.translations.ja.description 
            },
            en: { 
              name: action.payload.translations.en.name,
              description: action.payload.translations.en.description 
            },
            zh: { 
              name: action.payload.translations.zh.name,
              description: action.payload.translations.zh.description 
            }
          },
          id: action.payload.id,
          name: action.payload.translations.ja.name || action.payload.translations.en.name,
          description: action.payload.translations.ja.description || action.payload.translations.en.description,
          type: action.payload.type,
          price: action.payload.price.toString(),
          period: action.payload.period?.toString() || '',
          duration: action.payload.period?.toString() || '',
          items: action.payload.items.map(item => ({
            id: item.id,
            name: item.name,
            rarity: item.rarity,
            probability: item.probability.toString(),
            exchangeRate: item.exchangeRate || 1.0,
            stock: item.stock,
          })),
          isActive: action.payload.isActive,
          thumbnail: action.payload.thumbnail,
          category: action.payload.category ? {
            id: (typeof action.payload.category === 'object' && action.payload.category !== null && 'id' in action.payload.category 
              ? action.payload.category.id 
              : action.payload.category),
            name: action.payload.category.name,
            order: action.payload.category.order
          } : undefined,
          rating: action.payload.rating || 0,
          dailyLimit: action.payload.dailyLimit || undefined,
          createdAt: action.payload.createdAt || new Date().toISOString(),
          isOneTimeFreeEnabled: action.payload.isOneTimeFreeEnabled || false,
          pityThreshold: action.payload.pityThreshold || 50
        };
      })
      .addCase(fetchGachaById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchGachas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGachas.fulfilled, (state, action) => {

        console.log("Raw payload from API:", action.payload);
        // 最初の要素の詳細内容を確認
        if (action.payload && action.payload.length > 0) {
          console.log("First gacha item:", action.payload[0]);
          console.log("Price type:", typeof action.payload[0].price);
          console.log("Price value:", action.payload[0].price);
        }
        
        state.loading = false;
        state.gachas = action.payload.map(gacha => {
          console.log(`Processing gacha ${gacha.id}, price: ${gacha.price}, type: ${typeof gacha.price}`);
          return {
          translations: {
            ja: { 
              name: gacha.translations.ja.name,
              description: gacha.translations.ja.description 
            },
            en: { 
              name: gacha.translations.en.name,
              description: gacha.translations.en.description 
            },
            zh: { 
              name: gacha.translations.zh.name,
              description: gacha.translations.zh.description 
            }
          },
          id: gacha.id,
          name: gacha.translations.ja.name || gacha.translations.en.name,
          description: gacha.translations.ja.description || gacha.translations.en.description,
          type: gacha.type,
          price: gacha.price.toString(),
          duration: gacha.period?.toString() || '',
          items: gacha.items.map(item => ({
            id: item.id,
            name: item.name,
            rarity: item.rarity,
            probability: item.probability.toString(),
            stock: item.stock,
            image: item.imageUrl
          })),
          isActive: gacha.isActive,
          thumbnail: gacha.thumbnail,
          category: gacha.category ? {
            id: gacha.category.id,
            name: gacha.category.name,
            order: gacha.category.order
          } : undefined,
          rating: gacha.rating || 0,
          dailyLimit: gacha.dailyLimit || undefined,
          createdAt: gacha.createdAt || new Date().toISOString(),
          isOneTimeFreeEnabled: gacha.isOneTimeFreeEnabled || false,
          pityThreshold: gacha.pityThreshold || 50
        }});
      })
      .addCase(fetchGachas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAdminGachas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminGachas.fulfilled, (state, action) => {
        console.log(action.payload)
        state.loading = false;
        state.gachas = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchAdminGachas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createGacha.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGacha.fulfilled, (state, action) => {
        state.loading = false;
        state.gachas.push({
          translations: {
            ja: { 
              name: action.payload.translations.ja.name,
              description: action.payload.translations.ja.description 
            },
            en: { 
              name: action.payload.translations.en.name,
              description: action.payload.translations.en.description 
            },
            zh: { 
              name: action.payload.translations.zh.name,
              description: action.payload.translations.zh.description 
            }
          },
          id: action.payload.id,
          name: action.payload.translations.ja.name || action.payload.translations.en.name,
          description: action.payload.translations.ja.description || action.payload.translations.en.description,
          type: action.payload.type,
          price: action.payload.price.toString(),
          duration: action.payload.period?.toString() || '',
          items: action.payload.items.map((item: { 
            name: string;
            rarity: string;
            probability: number;
            stock?: number;
          }) => ({
            name: item.name,
            rarity: item.rarity,
            probability: item.probability.toString(),
            stock: item.stock,
          })),
          isActive: action.payload.isActive,
          thumbnail: action.payload.thumbnailUrl,
          category: action.payload.category,
          rating: action.payload.rating || 0,
          dailyLimit: action.payload.dailyLimit || undefined,
          createdAt: action.payload.createdAt || new Date().toISOString(),
          isOneTimeFreeEnabled: action.payload.isOneTimeFreeEnabled || false,
          pityThreshold: action.payload.pityThreshold || 50
        });
      })
      .addCase(createGacha.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateGacha.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGacha.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.gachas.findIndex(g => g.id === action.payload.id);
        if (index !== -1) {
          state.gachas[index] = {
            translations: {
              ja: { 
                name: action.payload.translations.ja.name,
                description: action.payload.translations.ja.description 
              },
              en: { 
                name: action.payload.translations.en.name,
                description: action.payload.translations.en.description 
              },
              zh: { 
                name: action.payload.translations.zh.name,
                description: action.payload.translations.zh.description 
              }
            },
            id: action.payload.id,
            name: action.payload.translations.ja.name || action.payload.translations.en.name,
            description: action.payload.translations.ja.description || action.payload.translations.en.description,
            type: action.payload.type,
            price: action.payload.price.toString(),
            duration: action.payload.period?.toString() || '',
            items: action.payload.items.map((item: {
              name: string;
              rarity: string;
              probability: number;
              stock?: number;
            }) => ({
              name: item.name,
              rarity: item.rarity,
              probability: item.probability.toString(),
              stock: item.stock,
            })),
            isActive: action.payload.isActive,
            thumbnail: action.payload.thumbnail,
            category: action.payload.category,
            rating: action.payload.rating || 0,
            dailyLimit: action.payload.dailyLimit || undefined,
            createdAt: action.payload.createdAt || state.gachas[index].createdAt,
            isOneTimeFreeEnabled: action.payload.isOneTimeFreeEnabled || false,
            pityThreshold: action.payload.pityThreshold || 50
          };
        }
      })
      .addCase(updateGacha.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteGacha.fulfilled, (state, action) => {
        state.loading = false;
        state.gachas = state.gachas.filter(gacha => gacha.id !== action.payload);
      })
      .addCase(fetchGachasByFilters.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        
        // メタデータを保存
        if (action.payload.meta) {
          state.pagination = {
            total: action.payload.meta.total || 0,
            page: action.payload.meta.page || 1,
            limit: action.payload.meta.limit || 10,
            pages: action.payload.meta.pages || 1,
          };
        }
        
        // データがあればlistに保存
        const gachaData = action.payload.data || action.payload;
        
        // 数値文字列を数値に変換
        const normalizedGachas = Array.isArray(gachaData) ? gachaData.map(gacha => ({
          ...gacha,
          price: typeof gacha.price === 'string' ? parseFloat(gacha.price) : gacha.price
        })) : [];
        
        state.list = normalizedGachas;
        state.filtered = normalizedGachas;
      });
  },
});

export const { clearCurrentGacha, selectGacha, setFilters } = gachaSlice.actions;
export default gachaSlice.reducer;
