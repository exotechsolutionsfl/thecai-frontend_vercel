import { MenuLevel } from '@/types/dynamic-content'
import { apiFetch } from '@api/api'

interface FetchMenuParams {
  make: string
  model: string
  year: string
  level: number
  engine?: string | null
  selection?: string
}

export async function fetchDynamicMenu({
  make,
  model,
  year,
  level,
  engine,
  selection
}: FetchMenuParams): Promise<MenuLevel> {
  const params = new URLSearchParams({
    make,
    model,
    year,
    menu_level: level.toString()
  })

  if (engine) {
    params.append('engine', engine)
  }

  if (selection) {
    params.append('menu_selection', selection)
  }

  return await apiFetch(`api/dynamic-menu?${params.toString()}`)
}

export function isLastMenuLevel(menuData: MenuLevel): boolean {
  return !menuData.next_menu && !!menuData.chunk_text
}