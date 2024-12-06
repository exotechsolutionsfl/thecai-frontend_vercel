import { useState, useCallback } from 'react';
import { MenuItem, MenuParams, MenuState } from '@/types/dynamic-menu';
import { apiFetch } from '@/app/api/api';

export function useMenuNavigation() {
  const [menuState, setMenuState] = useState<MenuState>({});
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuItems = useCallback(async (params: MenuParams): Promise<MenuItem[]> => {
    try {
      const queryParams = new URLSearchParams({
        make: params.make,
        model: params.model,
        year: params.year,
        ...(params.menuPath && { menu_path: params.menuPath }),
        ...(params.topMenu && { top_menu: params.topMenu })
      });

      const response = await apiFetch(`/api/dynamic-menu?${queryParams}`);
      const { items } = response as { items: MenuItem[] };
      
      if (params.menuPath) {
        setMenuState(prev => ({
          ...prev,
          root: items
        }));
      } else {
        setMenuState(prev => ({
          ...prev,
          [params.menuPath || 'root']: items
        }));
      }

      return items;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch menu items');
      return [];
    }
  }, []);

  const expandMenuItem = useCallback(async (item: MenuItem, params: MenuParams) => {
    if (item.type === 'content') return;

    setMenuState(prev => ({
      ...prev,
      [item.id]: prev[item.id]?.map(menuItem => 
        menuItem.id === item.id ? { ...menuItem, isLoading: true } : menuItem
      ) || []
    }));

    const items = await fetchMenuItems({
      ...params,
      menuPath: item.name,
      topMenu: currentPath[0] || item.name
    });

    setMenuState(prev => ({
      ...prev,
      [item.id]: items.map(menuItem => ({
        ...menuItem,
        parentId: item.id,
        isExpanded: false,
        isLoading: false
      }))
    }));

    setCurrentPath(prev => [...prev, item.name]);
  }, [currentPath, fetchMenuItems]);

  const navigateBack = useCallback(() => {
    if (currentPath.length > 0) {
      const newPath = currentPath.slice(0, -1);
      setCurrentPath(newPath);
      
      setMenuState(prev => {
        const newState = { ...prev };
        delete newState[currentPath[currentPath.length - 1]];
        return newState;
      });
    }
  }, [currentPath]);

  return {
    menuState,
    currentPath,
    error,
    fetchMenuItems,
    expandMenuItem,
    navigateBack
  };
}