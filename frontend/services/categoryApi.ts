import { api } from '@/lib/axios';
import { Category, UpdateCategoryOrderInput, CreateCategoryInput } from '@/types/category';

export const categoryApi = {
  getCategories: async (includeInactive: boolean = false) => {
    const response = await api.get<Category[]>(
      `/categories`
    );
    return response.data;
  },

  getCategory: async (id: string) => {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (data: string) => {
    console.log(data);
    const response = await api.post('/categories', {name: data});
    return response.data;
  },

  updateCategory: async (id: string, data: CreateCategoryInput) => {
    const response = await api.put<Category>(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  updateCategoryOrder: async (data: UpdateCategoryOrderInput) => {
    console.log(data);
    const response = await api.put<Category[]>('/categories/order', data);
    return response.data;
  },
};
