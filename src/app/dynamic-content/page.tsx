'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronRight, ChevronDown, Loader2 } from 'lucide-react'
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

  useEffect(() => {
    fetchMenuData()
  }, [])

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
    } else {
      setExpandedMenus([...expandedMenus, menuItem.name])
      if (!menuItem.submenus && !menuItem.content) {
        fetchMenuData(menuItem.name, topMenu)
      }
    }
  }

  const renderMenuItem = (item: MenuItem, level: number = 0, topMenu: string | null = null) => {
    const isExpanded = expandedMenus.includes(item.name)
    const hasSubmenus = item.submenus && item.submenus.length > 0
    const hasContent = item.content !== undefined

    return (
      <div key={item.name} className="mb-2">
        <Button
          variant="ghost"
          className={`w-full justify-start pl-${level * 4} ${isExpanded ? 'font-bold' : ''}`}
          onClick={() => handleMenuClick(item, topMenu || item.name)}
        >
          {hasSubmenus || (!hasContent && !hasSubmenus) ? (
            isExpanded ? <ChevronDown className="mr-2 h-4 w-4" /> : <ChevronRight className="mr-2 h-4 w-4" />
          ) : null}
          {item.name}
        </Button>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {hasSubmenus && item.submenus!.map(subItem => renderMenuItem(subItem, level + 1, topMenu || item.name))}
            {hasContent && renderContent(item.content!)}
          </motion.div>
        )}
      </div>
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dynamic Content</h1>
      <div className="space-y-4">
        {menuData.map(item => renderMenuItem(item))}
      </div>
    </div>
  )
}

