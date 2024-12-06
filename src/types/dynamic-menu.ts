export interface ApiMenuItem {
  name: string;
  parent_name: string | null;
  content?: string;
}

export interface MenuItem {
  name: string;
  type: 'menu' | 'chunk_text';
  content?: string;
  children?: MenuItem[];
  isExpanded?: boolean;
}

export interface DynamicMenuResponse {
  items: MenuItem[];
  error?: string;
}

export interface MenuState {
  [key: string]: MenuItem[];
}

export interface MenuParams {
  make: string;
  model: string;
  year: string;
  menu_path?: string;
}