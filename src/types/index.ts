export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  images: string[];
  prep_time: string;
  cook_time: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: string[];
  instructions: string[];
  category: string;
  category_id: string;
  category_slug: string;
  is_featured: boolean;
  youtube_link: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

