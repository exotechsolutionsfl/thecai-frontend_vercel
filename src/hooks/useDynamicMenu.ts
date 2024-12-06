import { useState, useCallback } from 'react';
import { MenuItem, MenuParams, MenuState, MenuResponse } from '@/types/dynamic-menu';
import { apiFetch } from '@/app/api/api';

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
        ...(params.menuPath && { menu_path: params.menuPath }),
        ...(params.topMenu && { top_menu: params.topMenu })
      });

      const response = await apiFetch(`api/dynamic-menu?${queryParams}`);
      const menuResponse = response as MenuResponse;
      
      if (params.menuPath) {
        const path = params.menuPath.replace(/_/g, ' ').trim();
        if (path) {
          setCurrentPath(prev => [...prev, path]);
        }
      }
      
      setMenuState(prev => {
        const newState = { ...prev };
        const key = params.menuPath ? params.menuPath.replace(/_/g, ' ') : 'root';
        newState[key] = menuResponse.items;
        
        if (params.menuPath) {
          const parentKey = currentPath[currentPath.length - 1] || 'root';
          if (newState[parentKey]) {
            newState[parentKey] = newState[parentKey].map(item => 
              item.name === key ? { ...item, children: menuResponse.items } : item
            );
          }
        }
        
        return newState;
      });
      
      return menuResponse.items;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch menu items';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [currentPath]);

  const toggleMenuItem = useCallback((path: string, item: MenuItem) => {
    setMenuState(prev => ({
      ...prev,
      [path]: prev[path].map(menuItem => 
        menuItem.id === item.id 
          ? { ...menuItem, isExpanded: !menuItem.isExpanded }
          : menuItem
      )
    }));
  }, []);

  const navigateBack = useCallback(() => {
    if (currentPath.length > 0) {
      setCurrentPath(prev => prev.slice(0, -1));
      const newPath = currentPath.slice(0, -1).join('/') || 'root';
      setMenuState(prev => {
        const newState = { ...prev };
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