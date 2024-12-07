'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, X } from 'lucide-react'
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
    text_1: string;
    image_1: string;
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
  const contentRef = useRef<HTMLDivElement>(null)

  const handleBackClick = useCallback(() => {
    setExpandedMenus(prevExpandedMenus => {
      if (prevExpandedMenus.length > 0) {
        const newExpandedMenus = prevExpandedMenus.slice(0, -1);
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


  const fetchMenuData = useCallback(async (menuPath: string | null = null, topMenu: string | null = null) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        make: make || '',
        model: model || '',
        year: year || '',
      })

      if (menuPath) params.append('menu_path', menuPath)
      if (topMenu) params.append('top_menu', topMenu)

      const data = await apiFetch(`api/dynamic-menu?${params.toString()}`)
      
      if (menuPath) {
        updateMenuData(data, menuPath)
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


  const updateMenuData = (newData: MenuItem[], menuPath: string) => {
    setMenuData(prevData => {
      const updateRecursive = (items: MenuItem[]): MenuItem[] => {
        return items.map(item => {
          if (item.name === menuPath) {
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

  const handleMenuClick = (menuItem: MenuItem, topMenu: string | null = null) => {
    if (expandedMenus.includes(menuItem.name)) {
      setExpandedMenus(expandedMenus.filter(name => name !== menuItem.name));
      setActiveContent(null);
    } else {
      setExpandedMenus([...expandedMenus, menuItem.name]);
      if (!menuItem.submenus && menuItem.content) {
        setActiveContent(menuItem);
      } else if (!menuItem.submenus && !menuItem.content) {
        fetchMenuData(menuItem.name, topMenu);
      } else {
        setActiveContent(null);
      }
    }
  };


  const renderMenuItem = (item: MenuItem, level: number = 0, topMenu: string | null = null) => {
    const isExpanded = expandedMenus.includes(item.name);
    const hasSubmenus = item.submenus && item.submenus.length > 0;
    const hasContent = item.content && item.content.length > 0;
    const isActive = activeContent === item;

    return (
      <motion.div
        key={item.name}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className={`mb-2 ${isActive ? 'z-10' : 'z-0'}`}
        style={{
          filter: isActive || isExpanded ? 'none' : `blur(${(expandedMenus.length - level) * 0.5}px)`,
          transition: 'filter 0.3s ease-in-out',
        }}
      >
        <Button
          variant="ghost"
          className={`w-full justify-start pl-${level * 4} ${isExpanded ? 'font-bold' : ''}`}
          onClick={() => handleMenuClick(item, topMenu || item.name)}
        >
          <ChevronRight className="mr-2 h-4 w-4" />
          {item.name}
        </Button>
        <AnimatePresence>
          {isExpanded && (
            <CurlyBrace isOpen={isExpanded}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="ml-4"
              >
                {hasSubmenus && item.submenus!.map(subItem => renderMenuItem(subItem, level + 1, topMenu || item.name))}
                {hasContent && renderContent(item.content)}
              </motion.div>
            </CurlyBrace>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  const renderContent = (content: MenuItem['content']) => {
    if (!content || content.length === 0) return null;

    return (
      <Card className="mt-2 mb-4">
        <CardContent className="p-4">
          {content.map((item, index) => (
            <div key={index} className="mb-4">
              <p className="mb-2">{item.text_1}</p>
              {item.image_1 && (
                <div className="relative h-64 w-full">
                  <Image
                    src={item.image_1}
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
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row">
      <div className="w-full md:w-1/3 pr-4 mb-8 md:mb-0">
        <h1 className="text-2xl font-bold mb-6">Dynamic Content</h1>
        <div className="space-y-4">
          {menuData.map(item => renderMenuItem(item))}
        </div>
      </div>
      <div className="w-full md:w-2/3 pl-4" ref={contentRef}>
        <AnimatePresence mode="wait">
          {activeContent && (
            <motion.div
              key={activeContent.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-4">
                <Button
                  variant="ghost"
                  onClick={handleBackClick}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleBackClick}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <h2 className="text-xl font-semibold mb-4">{activeContent.name}</h2>
              {activeContent.content && renderContent(activeContent.content)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}