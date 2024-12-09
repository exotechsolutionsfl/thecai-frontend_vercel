'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Folder, FolderOpen, Loader2 } from 'lucide-react'
import { apiFetch } from '@api/api'
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import Image from 'next/image'
import { CurlyBrace } from '@/components/CurlyBrace'

interface MenuItem {
  name: string;
  parent_name?: string;
  top_menu?: string;
  submenus?: MenuItem[];
  content?: {
    text?: string;
    image?: string;
  }[];
}

export default function DynamicContent() {
  const searchParams = useSearchParams()
  const make = searchParams.get('make')
  const model = searchParams.get('model')
  const year = searchParams.get('year')

  const [menuData, setMenuData] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const [activeContent, setActiveContent] = useState<MenuItem | null>(null)
  const [lastOpenedMenu, setLastOpenedMenu] = useState<string | null>(null);

  const fetchMenuData = useCallback(async (parentName: string | null = null, topMenu: string | null = null) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        make: make || '',
        model: model || '',
        year: year || '',
        parent_name: parentName || '',
        top_menu: topMenu || '',
      })

      const data = await apiFetch(`api/dynamic-menu?${params.toString()}`)
      return data as MenuItem[]
    } catch (err) {
      setError('Failed to fetch menu data. Please try again.')
      console.error('Error fetching menu data:', err)
      return []
    } finally {
      setLoading(false)
    }
  }, [make, model, year])

  useEffect(() => {
    const loadInitialData = async () => {
      const initialData = await fetchMenuData(null, null)
      setMenuData(initialData)
    }
    loadInitialData()
  }, [fetchMenuData])

  const handleMenuClick = async (menuItem: MenuItem, path: string) => {
    setExpandedMenus(prevExpandedMenus => {
      if (prevExpandedMenus.includes(path)) {
        // Collapse this menu and all its submenus
        const newExpandedMenus = prevExpandedMenus.filter(expandedPath => !expandedPath.startsWith(path));
        setLastOpenedMenu(newExpandedMenus[newExpandedMenus.length - 1] || null);
        return newExpandedMenus;
      } else {
        // Expand this menu
        setLastOpenedMenu(path);
        return [...prevExpandedMenus, path];
      }
    });

    if (menuItem.name === 'chunk_text') {
      setActiveContent(menuItem);
    } else if (!menuItem.submenus) {
      const newSubmenus = await fetchMenuData(menuItem.name, menuItem.top_menu);
      setMenuData(prevData => {
        const updateRecursive = (items: MenuItem[]): MenuItem[] => {
          return items.map(item => {
            if (item.name === menuItem.name) {
              return { ...item, submenus: newSubmenus };
            } else if (item.submenus) {
              return { ...item, submenus: updateRecursive(item.submenus) };
            }
            return item;
          });
        };
        return updateRecursive(prevData);
      });
    }
  };

  const renderMenuItem = (item: MenuItem, path: string = '', level: number = 0) => {
    const isExpanded = expandedMenus.includes(path);
    const hasSubmenus = item.submenus && item.submenus.length > 0;
    const isActive = activeContent === item;
    const isChunkText = item.name === 'chunk_text';
    const displayName = isChunkText ? item.parent_name || '' : item.name;
    const isLastOpened = path === lastOpenedMenu;

    if (isChunkText) {
      return item.content ? renderContent(item.content, displayName) : null;
    }

    return (
      <motion.div
        key={path}
        id={item.name}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className={`mb-2 ${isActive ? 'z-10' : 'z-0'}`}
      >
        <Button
          variant="ghost"
          className={`w-full justify-start pl-${level * 4} ${isExpanded ? 'font-bold' : ''} hover:bg-accent/50 transition-colors duration-200`}
          onClick={() => handleMenuClick(item, path)}
        >
          <div className="mr-2">
            {isExpanded ? (
              <FolderOpen className="h-4 w-4" />
            ) : (
              <Folder className="h-4 w-4" />
            )}
          </div>
          {displayName}
        </Button>
        <AnimatePresence>
          {isExpanded && (
            <CurlyBrace isVisible={isLastOpened}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="ml-4"
              >
                {isExpanded && (
                  <>
                    {hasSubmenus && item.submenus!.map(subItem => 
                      renderMenuItem(subItem, `${path}/${subItem.name}`, level + 1)
                    )}
                    {!hasSubmenus && item.content && renderContent(item.content, displayName)}
                  </>
                )}
              </motion.div>
            </CurlyBrace>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  const renderContent = (content: { text?: string; image?: string }[], parentName: string) => {
    return (
      <Card className="mt-2 mb-4">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-2">{parentName}</h3>
          {content.map((item, index) => (
            <div key={index} className="mb-4">
              {item.text && <p className="mb-2">{item.text}</p>}
              {item.image && (
                <div className="relative h-64 w-full mb-2">
                  <Image
                    src={item.image}
                    alt={`Content image ${index + 1}`}
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  if (loading && menuData.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dynamic Content</h1>
      <div className="space-y-4">
        {menuData
          .filter(item => item.parent_name === null)
          .map(item => renderMenuItem(item, item.name))}
      </div>
      {activeContent && renderContent(activeContent.content!, activeContent.name)}
    </div>
  )
}