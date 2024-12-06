import { useState, useCallback } from 'react';
import { MenuItem, MenuParams, MenuState } from '@/types/dynamic-menu';
import { apiFetch } from '@api/api';

export function useDynamicMenu() {
  const [menuState, setMenuState] = useState<MenuState>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuItems = useCallback(async (params: MenuParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams({
        make: params.make,
        model: params.model,
        year: params.year,
        ...(params.menu_path && { menu_path: params.menu_path })
      });

      const data = await apiFetch(`api/dynamic-menu?${queryParams.toString()}`);
      
      setMenuState(prev => ({
        ...prev,
        [params.menu_path || 'root']: data.items
      }));
      
      return data.items;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch menu items';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleMenuItem = useCallback((path: string, item: MenuItem) => {
    setMenuState(prev => ({
      ...prev,
      [path]: prev[path].map(menuItem => 
        menuItem.name === item.name 
          ? { ...menuItem, isExpanded: !menuItem.isExpanded }
          : menuItem
      )
    }));
  }, []);

  return {
    menuState,
    loading,
    error,
    fetchMenuItems,
    toggleMenuItem
  };
}