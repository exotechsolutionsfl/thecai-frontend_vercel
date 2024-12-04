'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import DynamicMenu from '@/components/dynamic-menu/DynamicMenu'
import ContentDisplay from '@/components/dynamic-menu/ContentDisplay'
import DynamicBreadcrumbs from '@/components/dynamic-menu/DynamicBreadcrumbs'
import MenuSkeleton from '@/components/dynamic-menu/MenuSkeleton'
import ErrorDisplay from '@/components/dynamic-menu/ErrorDisplay'
import { MenuLevel, ChunkText, Breadcrumb } from '@/types/dynamic-content'
import { fetchDynamicMenu, isLastMenuLevel } from '@/lib/dynamic-menu'

export default function DynamicContentPage() {
  const searchParams = useSearchParams()
  const [currentLevel, setCurrentLevel] = useState(1)
  const [menuData, setMenuData] = useState<MenuLevel | null>(null)
  const [chunkText, setChunkText] = useState<ChunkText[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([])

  const make = searchParams.get('make') || ''
  const model = searchParams.get('model') || ''
  const year = searchParams.get('year') || ''
  const engine = searchParams.get('engine') || undefined

  const fetchMenuData = useCallback(async (level: number, selection?: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchDynamicMenu({
        make,
        model,
        year,
        level,
        engine,
        selection
      })
      
      setMenuData(data)
      if (isLastMenuLevel(data)) {
        setChunkText(data.chunk_text || null)
      } else {
        setChunkText(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch menu data')
    } finally {
      setIsLoading(false)
    }
  }, [make, model, year, engine])

  useEffect(() => {
    if (make && model && year) {
      fetchMenuData(1)
    }
  }, [make, model, year, fetchMenuData])

  const handleMenuSelect = async (selection: string) => {
    if (!menuData?.next_menu) return

    const nextLevel = currentLevel + 1
    setBreadcrumbs(prev => [...prev, { label: selection, level: currentLevel }])
    setCurrentLevel(nextLevel)
    await fetchMenuData(nextLevel, selection)
  }

  const handleBreadcrumbClick = async (level: number) => {
    setCurrentLevel(level)
    setBreadcrumbs(prev => prev.slice(0, level - 1))
    await fetchMenuData(level)
  }

  const handleRetry = () => {
    fetchMenuData(currentLevel)
  }

  const renderContent = () => {
    if (error) {
      return <ErrorDisplay message={error} onRetry={handleRetry} />
    }

    if (isLoading) {
      return <MenuSkeleton />
    }

    if (chunkText) {
      return <ContentDisplay chunks={chunkText} />
    }

    if (menuData) {
      return (
        <DynamicMenu
          menuData={menuData}
          onSelect={handleMenuSelect}
        />
      )
    }

    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <DynamicBreadcrumbs
        breadcrumbs={breadcrumbs}
        onBreadcrumbClick={handleBreadcrumbClick}
        vehicle={{ make, model, year }}
      />
      {renderContent()}
    </div>
  )
}