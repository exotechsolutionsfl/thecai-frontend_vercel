'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Folder, FolderOpen, X } from 'lucide-react'
import { apiFetch } from '@api/api'
import { Button } from "@/components/ui/Button"
import Image from 'next/image'
import { CurlyBrace } from '@/components/CurlyBrace'
import { ScrollArea } from "@/components/ui/scroll-area"

interface MenuItem {
  uid: string;
  name: string;
  parent_name?: string;
  top_menu?: string;
  submenus?: MenuItem[];
  content?: {
    [key: string]: string;
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
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({})
  const [activeContent, setActiveContent] = useState<MenuItem | null>(null)
  const [lastOpenedMenu, setLastOpenedMenu] = useState<string | null>(null)
  const [sideWindowContent, setSideWindowContent] = useState<MenuItem | null>(null)
  const [isSideWindowOpen, setIsSideWindowOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const handleBackClick = useCallback(() => {
    setExpandedMenus(prevExpandedMenus => {
      if (Object.keys(prevExpandedMenus).length > 0) {
        const newExpandedMenus = {...prevExpandedMenus};
        const lastExpanded = Object.keys(prevExpandedMenus).pop();
        if (lastExpanded) {
          newExpandedMenus[lastExpanded] = false;
        }
        const lastKey = Object.keys(newExpandedMenus).pop();
        setLastOpenedMenu(lastKey || null);
        setActiveContent(null);
        return newExpandedMenus;
      }
      return prevExpandedMenus;
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        handleBackClick();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleBackClick]);

  const fetchMenuData = useCallback(async (parentUid: string | null = null) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        make: make || '',
        model: model || '',
        year: year || '',
      })

      if (parentUid) params.append('parent_uid', parentUid)

      const data = await apiFetch(`api/dynamic-menu?${params.toString()}`)
      
      if (parentUid) {
        updateMenuData(data, parentUid)
      } else {
        setMenuData(data)
      }
    } catch (err) {
      setError('Failed to fetch menu data. Please try again.')
      console.error('Error fetching menu data:', err)
    } finally {
      setLoading(false)
    }
  }, [make, model, year])

  useEffect(() => {
    fetchMenuData()
  }, [fetchMenuData])

  const updateMenuData = (newData: MenuItem[], parentUid: string) => {
    setMenuData(prevData => {
      const updateRecursive = (items: MenuItem[]): MenuItem[] => {
        return items.map(item => {
          if (item.uid === parentUid) {
            return { ...item, submenus: newData }
          } else if (item.submenus) {
            return { ...item, submenus: updateRecursive(item.submenus) }
          }
          return item
        })
      }
      return updateRecursive(prevData)
    })
  }

  const scrollToMenuItem = (itemUid: string) => {
    const element = document.getElementById(itemUid);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const resetChildMenus = useCallback((menuItem: MenuItem, newExpandedMenus: Record<string, boolean>) => {
    if (menuItem.submenus) {
      menuItem.submenus.forEach(submenu => {
        newExpandedMenus[submenu.uid] = false;
        resetChildMenus(submenu, newExpandedMenus);
      });
    }
  }, []);

  const handleMenuClick = useCallback((menuItem: MenuItem) => {
    setExpandedMenus(prevExpandedMenus => {
      const newExpandedMenus = { ...prevExpandedMenus };
      const isCurrentlyExpanded = newExpandedMenus[menuItem.uid];
      
      newExpandedMenus[menuItem.uid] = !isCurrentlyExpanded;
      
      if (!newExpandedMenus[menuItem.uid]) {
        resetChildMenus(menuItem, newExpandedMenus);
      }
      
      setLastOpenedMenu(newExpandedMenus[menuItem.uid] ? menuItem.uid : null);
      return newExpandedMenus;
    });

    if (menuItem.content) {
      setSideWindowContent(menuItem);
      setIsSideWindowOpen(true);
    } else if (!menuItem.submenus) {
      fetchMenuData(menuItem.uid);
    }
    
    scrollToMenuItem(menuItem.uid);
  }, [fetchMenuData, resetChildMenus]);

  const renderMenuItem = useCallback((item: MenuItem, level: number = 0) => {
    const isExpanded = expandedMenus[item.uid] || false;
    const hasSubmenus = item.submenus && item.submenus.length > 0;
    const isActive = activeContent === item;
    const isChunkText = item.name === 'chunk_text';
    const displayName = isChunkText ? item.parent_name || '' : item.name;
    const isLastOpened = item.uid === lastOpenedMenu;

    return (
      <motion.div
        key={item.uid}
        id={item.uid}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className={`mb-2 ${isActive ? 'z-10' : 'z-0'}`}
      >
        <Button
          variant="ghost"
          className={`w-full justify-start pl-${level * 4} ${isExpanded ? 'font-bold' : ''} hover:bg-accent/50 transition-colors duration-200`}
          onClick={() => handleMenuClick(item)}
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
          {isExpanded && hasSubmenus && (
            <CurlyBrace isVisible={isLastOpened}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="ml-4"
              >
                {item.submenus!.map(subItem => renderMenuItem(subItem, level + 1))}
              </motion.div>
            </CurlyBrace>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }, [expandedMenus, activeContent, lastOpenedMenu, handleMenuClick]);

  const renderContent = (content: { [key: string]: string }[]) => {
    return (
      <div className="space-y-4">
        {content.map((item, index) => (
          <div key={index} className="space-y-2">
            {Object.entries(item).map(([key, value]) => {
              if (key.startsWith('text')) {
                return <p key={key} className="text-sm">{value}</p>;
              } else if (key.startsWith('image')) {
                return (
                  <div key={key} className="relative h-64 w-full">
                    <Image
                      src={value}
                      alt={`Content image ${index + 1}`}
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                );
              }
              return null;
            })}
          </div>
        ))}
      </div>
    );
  };

  const closeSideWindow = () => {
    setIsSideWindowOpen(false);
  };

  if (loading && menuData.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <ChevronRight className="h-8 w-8 text-primary" />
        </motion.div>
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
    <div className="container mx-auto px-4 py-8 flex">
      <div className="w-full lg:w-1/3 space-y-4 pr-4">
        {menuData.map(item => renderMenuItem(item))}
      </div>
      <AnimatePresence>
        {isSideWindowOpen && sideWindowContent && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 w-full lg:w-2/3 h-full bg-background border-l border-border shadow-lg overflow-hidden"
          >
            <div className="p-4 flex justify-between items-center border-b sticky top-0 bg-background z-10">
              <h2 className="text-2xl font-bold">{sideWindowContent.name}</h2>
              <Button variant="ghost" size="icon" onClick={closeSideWindow}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <ScrollArea className="h-[calc(100vh-70px)] p-4">
              {sideWindowContent.content && renderContent(sideWindowContent.content)}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}