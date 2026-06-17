export interface HomeProduct {
  name: string;
  slug: string;
  image: string;
  gallery: string[];
  price: number;
  discount?: number | null;
  rating: number;
  countStock: number;
  createdAt: string;
  _count: { comments: number };
}

export interface HomeProductSection {
  categoryName: string;
  categoryImage?: string;
  categorySlug: string;
  products: HomeProduct[];
}

/** قسم فرعي مع منتجاته */
export interface HomeSubSection {
  subName: string;
  subSlug: string;
  parentName: string;
  parentSlug: string;
  products: HomeProduct[];
}

export interface HomeData {
  heroSection: Array<{
    id: string;
    name: string;
    slug: string;
    image: string | null;
  }>;
  productSections: HomeProductSection[];
  subSections: HomeSubSection[];
}
