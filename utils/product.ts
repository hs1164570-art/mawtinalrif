export type ProductDetail = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string;
  gallery: string[];
  rating: number;
  inStock: boolean;
  countStock: number;
  discount: number | null;
  slug: string;
  subCategoryId: string;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
    slug: string;
    parent: { id: string; name: string; slug: string } | null;
  };
  _count: { comments: number };
};

export type CommentWithUser = {
  id: string;
  content: string;
  rating: number;
  createdAt: Date | string;
  user: { name: string | null; image: string | null };
};

export type CommentStatsData = {
  totalComments: number;
  stats: { rating: number; count: number; percentage: number }[];
};

export type RelatedProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  discount: number | null;
  image: string;
  gallery: string[];
  category: { name: string; slug: string };
};

export type LocalCartItem = {
  cartId?: string;
  productId: string;
  name: string;
  price: number;
  discount: number | null;
  image: string;
  slug: string;
  quantity: number;
  inStock: boolean;
  addedAt: string;
  countStock: number;
};
