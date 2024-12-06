export interface MenuItem {
  id: string;
  name: string;
  parentId: string | null;
  type: 'menu' | 'content';
  content?: {
    text: string;
    images?: {
      url: string;
      alt: string;
    }[];
  };
  isExpanded?: boolean;
  isLoading?: boolean;
  children?: MenuItem[];
}

export interface MenuState {
  [key: string]: MenuItem[];
}

export interface MenuParams {
  make: string;
  model: string;
  year: string;
  menuPath?: string;
  topMenu?: string;
}

export interface MenuResponse {
  items: MenuItem[];
  error?: string;
}