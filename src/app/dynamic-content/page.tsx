'use client'

import React from 'react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Folder, FolderOpen } from 'lucide-react'
import { apiFetch } from '@api/api'
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import Image from 'next/image'
import { CurlyBrace } from '@/components/CurlyBrace'

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
      setActiveContent(menuItem);
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

    if (isChunkText) {
      return item.content ? renderContent(item.content, displayName, item.uid) : null;
    }

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
          className={`w-full sm:w-11/12 lg:w-10/12 justify-start pl-${level * 2} ${isExpanded ? 'font-bold' : ''} hover:bg-accent/50 transition-colors duration-200`}
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
          {isExpanded && (
            <motion.div
              key={`${item.uid}-expanded`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CurlyBrace isVisible={isLastOpened}>
                <div className="ml-4">
                  {hasSubmenus && item.submenus!.map(subItem => 
                    renderMenuItem(subItem, level + 1)
                  )}
                  {!hasSubmenus && item.content && renderContent(item.content, displayName, item.uid)}
                </div>
              </CurlyBrace>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }, [expandedMenus, activeContent, lastOpenedMenu, handleMenuClick]);

const renderContent = (content: { [key: string]: string }[], parentName: string, uid: string) => {
  return (
    <Card className="mt-2 mb-4 w-full sm:w-11/12 lg:w-10/12">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2">{parentName}</h3>
        {content.map((item, contentIndex) => {
          const contentItemKey = `${uid}-content-item-${contentIndex}`;
          return (
            <div key={contentItemKey} className="mb-4">
              {Object.entries(item).map(([key, value]) => {
                // Create a truly unique key using both the content index and the key name
                const uniqueKey = `${uid}-${contentIndex}-${key}`;
                
                if (key.match(/^text_\d+_enhanced$/)) {
                  return <p key={uniqueKey} className="mb-2">{value}</p>;
                } else if (key.match(/^text_\d+$/) && !item[`${key}_enhanced`]) {
                  return <p key={uniqueKey} className="mb-2">{value}</p>;
                } else if (key.match(/^image_\d+_url$/)) {
                  return (
                    <div key={uniqueKey} className="relative h-64 w-full mb-2">
                      <Image
                        src={value}
                        alt={`Content image ${contentIndex + 1}`}
                        fill
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                  );
                }
                return null;
              })}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto sm:ml-0 lg:ml-8">
        <div className="space-y-4">
          {menuData.map(item => (
            <React.Fragment key={item.uid}>
              {renderMenuItem(item)}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}