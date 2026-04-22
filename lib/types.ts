export interface HtmlItem {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  code: string;
  url?: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FilterState {
  search: string;
  category: string;
  tag: string;
  onlyFavorites: boolean;
}

export interface SharePackage {
  version: 1;
  exportedAt: string;
  category: string;
  items: Array<Omit<HtmlItem, "id" | "createdAt" | "updatedAt">>;
}
