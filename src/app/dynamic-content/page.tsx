'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Folder, FolderOpen, ChevronRight, Loader2 } from 'lucide-react'
import { apiFetch } from '@api/api'
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import Image from 'next/image'
import { CurlyBrace } from '@/components/CurlyBrace'

interface MenuItem {
  name: string;
  uid: string;
  parent_uid: string | null;
  type: 'menu' | 'chunk_text';
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
  const [menuPath, setMenuPath] = useState<MenuItem[]>([])

  const fetchMenuData = useCallback(async (parentUid: string | null = null) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        make: make || '',
        model: model || '',
        year: year || '',
        parent_uid: parentUid === null ? 'null' : parentUid,
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
      const initialData = await fetchMenuData(null)
      setMenuData(initialData)
    }
    loadInitialData()
  }, [fetchMenuData])

  const handleMenuClick = async (menuItem: MenuItem) => {
    if (menuItem.type === 'chunk_text') {
      setActiveContent(menuItem)
      setMenuPath(prevPath => [...prevPath, menuItem])
    } else {
      setExpandedMenus(prevExpandedMenus => {
        const isExpanded = prevExpandedMenus.includes(menuItem.uid)
        if (isExpanded) {
          const newExpandedMenus = prevExpandedMenus.filter(id => id !== menuItem.uid)
          setMenuPath(prevPath => prevPath.slice(0, prevPath.findIndex(item => item.uid === menuItem.uid) + 1))
          return newExpandedMenus
        } else {
          setMenuPath(prevPath => [...prevPath, menuItem])
          return [...prevExpandedMenus, menuItem.uid]
        }
      })

      if (!menuData.some(item => item.parent_uid === menuItem.uid)) {
        const children = await fetchMenuData(menuItem.uid)
        setMenuData(prevData => [...prevData, ...children])
      }
    }
    
    scrollToMenuItem(menuItem.uid)
  }

  const scrollToMenuItem = (menuItemId: string) => {
    const element = document.getElementById(menuItemId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const isExpanded = expandedMenus.includes(item.uid)
    const hasChildren = menuData.some(child => child.parent_uid === item.uid)
    const isActive = activeContent?.uid === item.uid

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
            {item.type === 'menu' ? (
              isExpanded ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />
            ) : null}
          </div>
          {item.name}
          {hasChildren && <ChevronRight className={`ml-auto h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />}
        </Button>
        <AnimatePresence>
          {isExpanded && (
            <CurlyBrace isVisible={isExpanded}>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="ml-4"
              >
                {menuData
                  .filter(child => child.parent_uid === item.uid)
                  .map(child => renderMenuItem(child, level + 1))}
              </motion.div>
            </CurlyBrace>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  const renderContent = (item: MenuItem) => {
    if (!item.content) return null

    return (
      <Card className="mt-2 mb-4">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
          {item.content.map((content, index) => (
            <div key={index} className="mb-4">
              {content.text && <p className="mb-2">{content.text}</p>}
              {content.image && (
                <div className="relative h-64 w-full mb-2">
                  <Image
                    src={content.image}
                    alt={`Content image for ${item.name}`}
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

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
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center space-x-2">
          {menuPath.map((item, index) => (
            <li key={item.uid} className="flex items-center">
              {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
              <Button
                variant="link"
                onClick={() => handleMenuClick(item)}
                className="text-sm"
              >
                {item.name}
              </Button>
            </li>
          ))}
        </ol>
      </nav>
      <div className="space-y-4">
        {menuData
          .filter(item => item.parent_uid === null)
          .map(item => renderMenuItem(item))}
      </div>
      {activeContent && activeContent.type === 'chunk_text' && renderContent(activeContent)}
    </div>
  )
}