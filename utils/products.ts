export interface ProductCardData {
  id: string
  name: string
  price: number
  image: string
  gallery: string[]
  rating: number
  discount: number | null
  slug: string
  inStock: boolean
  countStock: number
}

export interface CategoryBreadcrumb {
  name: string
  slug: string
  href: string
}

export interface CategoryData {
  id: string
  name: string
  slug: string
  image: string | null
  parentId: string | null
  parent: {
    id: string
    name: string
    slug: string
    image: string | null
  } | null
}

export interface PriceRange {
  min: number
  max: number
}

export interface ProductsPageData {
  category: CategoryData
  breadcrumbs: CategoryBreadcrumb[]
  products: ProductCardData[]
  total: number
  totalPages: number
  currentPage: number
  priceRange: PriceRange
}

export type SortOption = 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'rating-desc'

export interface ProductsFilters {
  page: number
  sort: string
  minPrice: number
  maxPrice: number
  inStock: boolean
  rating: number
}
