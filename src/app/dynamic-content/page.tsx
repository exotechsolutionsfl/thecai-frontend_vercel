'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'
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
  const [activeContent, setActiveContent] = useState<MenuItem | null>(null)

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
      setExpandedMenus(expandedMenus.filter(name => name !== menuItem.name))
      setActiveContent(null)
    } else {
      setExpandedMenus([...expandedMenus, menuItem.name])
      if (!menuItem.submenus && !menuItem.content) {
        fetchMenuData(menuItem.name, topMenu)
      }
      if (menuItem.content) {
        setActiveContent(menuItem)
      } else {
        setActiveContent(null)
      }
    }
  }

  const handleBackClick = () => {
    if (expandedMenus.length > 0) {
      const newExpandedMenus = [...expandedMenus]
      newExpandedMenus.pop()
      setExpandedMenus(newExpandedMenus)
      setActiveContent(null)
    }
  }

  const renderMenuItem = (item: MenuItem, level: number = 0, topMenu: string | null = null) => {
    const isExpanded = expandedMenus.includes(item.name)
    const hasSubmenus = item.submenus && item.submenus.length > 0
    const isActive = activeContent === item

    return (
      <motion.div
        key={item.name}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className={`mb-2 ${isActive ? 'z-10' : 'z-0'}`}
        style={{ filter: isActive ? 'none' : `blur(${level * 0.5}px)` }}
      >
        <Button
          variant="ghost"
          className={`w-full justify-start pl-${level * 4} ${isExpanded ? 'font-bold' : ''}`}
          onClick={() => handleMenuClick(item, topMenu || item.name)}
        >
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronRight className="mr-2 h-4 w-4" />
          </motion.div>
          {item.name}
        </Button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="pl-4 border-l-2 border-gray-200 ml-2"
            >
              {hasSubmenus && item.submenus!.map(subItem => renderMenuItem(subItem, level + 1, topMenu || item.name))}
            </motion.div>
          )}
        </AnimatePresence>
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
      <div className="w-2/3 pl-4">
        <AnimatePresence mode="wait">
          {activeContent && (
            <motion.div
              key={activeContent.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                variant="ghost"
                onClick={handleBackClick}
                className="mb-4"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h2 className="text-xl font-semibold mb-4">{activeContent.name}</h2>
              {activeContent.content && renderContent(activeContent.content)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}