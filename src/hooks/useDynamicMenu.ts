import { useState, useCallback } from 'react';
import { ApiMenuItem, MenuItem, MenuParams, MenuState } from '@/types/dynamic-menu';
import { apiFetch } from '@api/api';

function transformApiResponse(items: ApiMenuItem[]): MenuItem[] {
  return items.map(item => ({
    name: item.name.replace(/_/g, ' '),
    type: item.content ? 'chunk_text' : 'menu',
    content: item.content,
    isExpanded: false,
    parent_name: item.parent_name
  }));
}

export function useDynamicMenu() {
  const [menuState, setMenuState] = useState<MenuState>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([]);

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

      const response = await apiFetch(`api/dynamic-menu?${queryParams.toString()}`);
      const transformedItems = transformApiResponse(response);
      
      if (params.menu_path) {
        // Only add to currentPath if menu_path exists and is not empty
        const path = params.menu_path.trim();
        if (path) {
          setCurrentPath(prev => [...prev, path]);
        }
      }
      
      setMenuState(prev => ({
        ...prev,
        [params.menu_path || 'root']: transformedItems
      }));
      
      return transformedItems;
    } catch (err) {
      if (err instanceof Error && err.message.includes('No menus found')) {
        return [];
      }
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

  const navigateBack = useCallback(() => {
    if (currentPath.length > 0) {
      setCurrentPath(prev => prev.slice(0, -1));
      // Also update menu state to show previous level
      const newPath = currentPath.slice(0, -1).join('/') || 'root';
      setMenuState(prev => {
        const newState = { ...prev };
        // Close the current level
        if (newState[newPath]) {
          newState[newPath] = newState[newPath].map(item => ({
            ...item,
            isExpanded: false
          }));
        }
        return newState;
      });
    }
  }, [currentPath]);

  return {
    menuState,
    loading,
    error,
    currentPath,
    fetchMenuItems,
    toggleMenuItem,
    navigateBack
  };
}