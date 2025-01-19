'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { apiFetch } from '@api/api'
import { Card, CardContent } from "@/components/ui/Card"
import Image from 'next/image'
import { TreeBranch } from '@/components/TreeBranch'
import Loading from '@/components/ui/loading'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useToast } from '@/hooks/useToast'

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
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

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
      const errorMessage = 'Failed to fetch menu data. Please try again.'
      setError(errorMessage)
      console.error('Error fetching menu data:', err)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [make, model, year, toast])

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

  const handleMenuClick = useCallback((menuItem: MenuItem) => {
    setExpandedMenus(prevExpandedMenus => {
      const newExpandedMenus = { ...prevExpandedMenus };
      if (newExpandedMenus[menuItem.uid]) {
        const resetChildStates = (item: MenuItem) => {
          if (item.submenus) {
            item.submenus.forEach(subItem => {
              newExpandedMenus[subItem.uid] = false;
              resetChildStates(subItem);
            });
          }
        };
        resetChildStates(menuItem);
      }
      newExpandedMenus[menuItem.uid] = !newExpandedMenus[menuItem.uid];
      return newExpandedMenus;
    });

    if (!menuItem.submenus && !menuItem.content) {
      setLoadingItems(prev => ({ ...prev, [menuItem.uid]: true }));
      fetchMenuData(menuItem.uid).then(() => {
        setLoadingItems(prev => ({ ...prev, [menuItem.uid]: false }));
      });
    }
  }, [fetchMenuData]);

  const renderMenuItem = useCallback((item: MenuItem, level: number = 0, isLastChild: boolean = false) => {
    const isExpanded = expandedMenus[item.uid] || false
    const hasSubmenus = item.submenus && item.submenus.length > 0
    const isFolder = hasSubmenus || (!item.content && item.name !== 'chunk_text')
    const displayName = item.name === 'chunk_text' ? item.parent_name || '' : item.name

    if (item.name === 'chunk_text' && item.content) {
      return renderContent(item.content, displayName, item.uid)
    }

    return (
      <TreeBranch
        key={item.uid}
        level={level}
        isLastChild={isLastChild}
        isFolder={isFolder}
        isExpanded={isExpanded}
        name={displayName}
        onClick={() => handleMenuClick(item)}
        hasChildren={hasSubmenus || (!!item.content && item.content.length > 0)}
        isLoading={loadingItems[item.uid]}
      >
        {isExpanded && hasSubmenus && (
          <div className="ml-4 mt-2">
            {item.submenus!.map((subItem, index) => 
              renderMenuItem(
                subItem,
                level + 1,
                index === item.submenus!.length - 1
              )
            )}
          </div>
        )}
        {isExpanded && item.content && renderContent(item.content, displayName, item.uid)}
      </TreeBranch>
    )
  }, [expandedMenus, handleMenuClick, loadingItems])

  const renderContent = (content: { [key: string]: string }[], parentName: string, uid: string) => {
    return (
      <Card className="mt-4 mb-4 ml-4">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-2">{parentName}</h3>
          {content.map((item, contentIndex) => {
            const contentItemKey = `${uid}-content-item-${contentIndex}`
            return (
              <div key={contentItemKey} className="mb-4">
                {Object.entries(item).map(([key, value]) => {
                  const uniqueKey = `${uid}-${contentIndex}-${key}`
                  
                  if (key.match(/^text_\d+_enhanced$/)) {
                    return <p key={uniqueKey} className="mb-2">{value}</p>
                  } else if (key.match(/^text_\d+$/) && !item[`${key}_enhanced`]) {
                    return <p key={uniqueKey} className="mb-2">{value}</p>
                  } else if (key.match(/^image_\d+_url$/)) {
                    return (
                      <div key={uniqueKey} className="relative h-64 w-full mb-2">
                        <Image
                          src={value || "/placeholder.svg"}
                          alt={`Content image ${contentIndex + 1}`}
                          fill
                          style={{ objectFit: 'contain' }}
                        />
                      </div>
                    )
                  }
                  return null
                })}
              </div>
            )
          })}
        </CardContent>
      </Card>
    )
  }

  if (loading && menuData.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading message="Loading data..." />
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
    <ErrorBoundary>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto py-8">
          <div className="space-y-2">
            {menuData.map((item, index) => (
              renderMenuItem(item, 0, index === menuData.length - 1)
            ))}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}