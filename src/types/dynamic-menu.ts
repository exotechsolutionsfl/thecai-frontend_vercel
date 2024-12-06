export interface ApiMenuItem {
  name: string;
  parent_name: string | null;
  content?: {
    text_1?: string;
    text_2?: string;
    image_1?: string;
    image_2?: string;
  };
}

export interface MenuItem {
  name: string;
  type: 'menu' | 'chunk_text';
  content?: {
    text_1?: string;
    text_2?: string;
    image_1?: string;
    image_2?: string;
  };
  children?: MenuItem[];
  isExpanded?: boolean;
  parent_name: string | null;
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