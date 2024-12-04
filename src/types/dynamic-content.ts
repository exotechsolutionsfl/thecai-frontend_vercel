export interface MenuLevel {
  next_menu: string | null
  menu_items: string[]
  chunk_text?: ChunkText[]
}

export interface ChunkText {
  text: string
  page_number?: number
  [key: string]: string | number | undefined
}

export interface Vehicle {
  make: string
  model: string
  year: string
}

export interface Breadcrumb {
  label: string
  level: number
}