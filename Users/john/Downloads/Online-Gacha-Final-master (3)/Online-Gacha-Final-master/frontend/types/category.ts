export interface Category {
    id: string;
    name: string;
    order: number;
    isActive: boolean;
    imageUrl?: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface CreateCategoryInput {
    name: string;
    description?: string;
    imageUrl?: string;
    isActive?: boolean;
  }
  
  export interface UpdateCategoryOrderInput {
    categories: {
      id: string;
      order: number;
    }[];
  }
  
  export interface UpdateCategoryOrderInput {
    categories: {
      id: string;
      order: number;
    }[];
  }