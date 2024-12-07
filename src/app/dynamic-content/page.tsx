'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Loader2, X } from 'lucide-react'
import { apiFetch } from '@api/api'
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import Image from 'next/image'

interface MenuItem {
  name: string
  submenus?: MenuItem[]
  content?: {
    text: string
    image?: string
  }
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
  const [activeMenu, setActiveMenu] = useState<MenuItem | null>(null)

  const fetchMenuData = async (menuPath: string | null = null, topMenu: string | null = null) => {
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
  }

  const memoizedFetchMenuData = useCallback(fetchMenuData, [make, model, year])

  useEffect(() => {
    memoizedFetchMenuData()
  }, [memoizedFetchMenuData])

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
      setExpandedMenus(expandedMenus.filter(name => name !== menuItem.name))
      setActiveMenu(null)
    } else {
      setExpandedMenus([...expandedMenus, menuItem.name])
      setActiveMenu(menuItem)
      if (!menuItem.submenus && !menuItem.content) {
        fetchMenuData(menuItem.name, topMenu)
      }
    }
  }

  const handleBackClick = () => {
    if (expandedMenus.length > 0) {
      const newExpandedMenus = [...expandedMenus]
      newExpandedMenus.pop()
      setExpandedMenus(newExpandedMenus)
      setActiveMenu(null)
    }
  }

  const renderMenuItem = (item: MenuItem, level: number = 0, topMenu: string | null = null) => {
    const isExpanded = expandedMenus.includes(item.name)

    return (
      <motion.div
        key={item.name}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`mb-2 ${level > 0 ? 'ml-4' : ''}`}
      >
        <Button
          variant="ghost"
          className={`w-full justify-between ${isExpanded ? 'font-bold' : ''}`}
          onClick={() => handleMenuClick(item, topMenu || item.name)}
        >
          <span>{item.name}</span>
          {(item.submenus || item.content) && (
            <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          )}
        </Button>
      </motion.div>
    )
  }

  const renderContent = (content: { text: string; image?: string }) => {
    return (
      <Card className="mt-2 mb-4">
        <CardContent className="p-4">
          <p className="mb-4">{content.text}</p>
          {content.image && (
            <div className="relative h-64 w-full">
              <Image
                src={content.image}
                alt="Content image"
                layout="fill"
                objectFit="contain"
              />
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (loading && menuData.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
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
      <div className="w-1/3 pr-4">
        <h1 className="text-2xl font-bold mb-6">Dynamic Content</h1>
        <div className="space-y-4">
          {menuData.map(item => renderMenuItem(item))}
        </div>
      </div>
      <AnimatePresence>
        {activeMenu && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '66.666667%', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-2/3 pl-4 relative"
          >
            <div className="bg-background rounded-lg p-6 shadow-lg relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 left-2"
                onClick={handleBackClick}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setActiveMenu(null)}
              >
                <X className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-bold mb-4 mt-8">{activeMenu.name}</h2>
              {activeMenu.content && renderContent(activeMenu.content)}
              {activeMenu.submenus && (
                <div className="space-y-2">
                  {activeMenu.submenus.map(subItem => renderMenuItem(subItem, 1, activeMenu.name))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}