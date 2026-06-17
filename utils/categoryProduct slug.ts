export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RootCategory extends SubCategory {
  children: SubCategory[];
}
