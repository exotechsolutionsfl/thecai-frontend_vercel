'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, AlertTriangle, ZoomIn, ZoomOut, X, ChevronLeft } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { apiFetch } from '@api/api'
import { useTheme } from '@context/ThemeProvider'
import { debounce } from '@/lib/utils'
import PageTabs from '@/components/PageTabs'
import ChunkRenderer from '@/components/ChunkRenderer'
import Loading from '@components/loading'

interface ChunkText {
  page_number: number
  text: string
  [key: string]: string | number
}

interface Content {
  content: ChunkText[]
}

interface SavedVehicle {
  make: string
  model: string
  year: string
}

interface RecentSearch {
  vehicle: SavedVehicle
  subtopic: string
  timestamp: number
}

export default function SubtopicDetails() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { theme } = useTheme()

  const subtopic = searchParams.get('subtopic') || ''
  const mainTopic = searchParams.get('mainTopic') || ''
  const nestedTopic = searchParams.get('nestedTopic') || ''
  const make = searchParams.get('make') || ''
  const model = searchParams.get('model') || ''
  const year = searchParams.get('year') || ''

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [content, setContent] = useState<Content>({ content: [] })
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [activePage, setActivePage] = useState(1)
  const warningKeywords = ["warning", "caution", "important", "alert"]

  const [visibleTabs, setVisibleTabs] = useState<number[]>([])
  const [tabStart, setTabStart] = useState(0)
  const maxVisibleTabs = 5
  const [isLoading, setIsLoading] = useState(true)

  const debouncedSearch = useCallback((value: string) => {
    const debouncedFn = debounce((searchValue: string) => {
      setDebouncedSearchTerm(searchValue)
    }, 300)
    debouncedFn(value)
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    debouncedSearch(value)
  }

  const saveRecentSearch = useCallback(() => {
    const newSearch: RecentSearch = {
      vehicle: { make, model, year },
      subtopic,
      timestamp: Date.now()
    }

    const storedSearches = localStorage.getItem('recentSearches')
    let recentSearches: RecentSearch[] = storedSearches ? JSON.parse(storedSearches) : []

    recentSearches = recentSearches.filter(
      search => !(
          search.subtopic === subtopic &&
          search.vehicle.make === make &&
          search.vehicle.model === model &&
          search.vehicle.year === year
        )
    )

    recentSearches.unshift(newSearch)
    recentSearches = recentSearches.slice(0, 10)

    localStorage.setItem('recentSearches', JSON.stringify(recentSearches))
  }, [make, model, year, subtopic])

  useEffect(() => {
    if (make && model && year && mainTopic && nestedTopic && subtopic) {
      const fetchContent = async () => {
        setIsLoading(true)
        setError(null)
        try {
          const data = await apiFetch(
            `api/subtopic-content?make=${encodeURIComponent(make)}&model=${encodeURIComponent(
              model
            )}&year=${encodeURIComponent(year)}&main_topic=${encodeURIComponent(
              mainTopic
            )}&nested_topic=${encodeURIComponent(nestedTopic)}&subtopic=${encodeURIComponent(subtopic)}`
          )
          if (data && Array.isArray(data.content) && data.content.length > 0) {
            const validChunks = data.content.filter(
              (chunk: ChunkText) =>
                chunk && typeof chunk.page_number === 'number' && typeof chunk.text === 'string'
            )
            if (validChunks.length > 0) {
              setContent({ content: validChunks })
              saveRecentSearch()
            } else {
              throw new Error('No valid content items found in API response')
            }
          } else {
            throw new Error('Invalid or empty content structure in API response')
          }
        } catch (err: unknown) {
          console.error('Error fetching subtopic content:', err)
          setError(err instanceof Error ? err.message : 'Failed to fetch subtopic content')
        } finally {
          setIsLoading(false)
        }
      }

      fetchContent()
    }
  }, [make, model, year, mainTopic, nestedTopic, subtopic, saveRecentSearch])

  const updateVisibleTabs = useCallback(() => {
    const filteredChunks = content.content.filter((chunk: ChunkText) =>
      chunk.text.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
    const totalTabs = filteredChunks.length
    let start = Math.max(0, activePage - Math.floor(maxVisibleTabs / 2))
    const end = Math.min(totalTabs, start + maxVisibleTabs)

    if (end - start < maxVisibleTabs) {
      start = Math.max(0, end - maxVisibleTabs)
    }

    setTabStart(start)
    setVisibleTabs(filteredChunks.slice(start, end).map(chunk => chunk.page_number))
  }, [content.content, debouncedSearchTerm, activePage, maxVisibleTabs])

  useEffect(() => {
    updateVisibleTabs()
  }, [updateVisibleTabs])

  const filteredChunks = content.content.filter((chunk: ChunkText) =>
    chunk.text.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  )

  const handleTabClick = (pageNumber: number) => {
    setActivePage(pageNumber)
    updateVisibleTabs()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToTopics = () => {
    router.push(`/subtopics-menu?make=${make}&model=${model}&year=${year}&mainTopic=${mainTopic}&nestedTopic=${nestedTopic}`)
  }

  const AdSpace = ({ side }: { side: 'left' | 'right' }) => (
    <div
      className={`hidden lg:flex flex-col items-center justify-start  h-full w-full max-w-xs ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      } border-2 rounded-lg p-4 ${side === 'left' ? 'mr-4' : 'ml-4'}`}
    >
      {/* Empty div to maintain structure */}
    </div>
  )

  if (isLoading) {
    return <Loading />
  }

  return (
    <div
      className={`relative min-h-screen ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'
      } font-sans`}
    >
      <div className="flex justify-center p-4">
        <div className="w-full  max-w-screen-2xl flex">
          <AdSpace side="left" />
          <div className="flex-grow px-4">
            <div className="mb-4">
              <button
                onClick={handleBackToTopics}
                className={`flex items-center ${
                  theme === 'dark'
                    ? 'text-blue-400 hover:text-blue-300'
                    : 'text-blue-600 hover:text-blue-800'
                } transition-colors duration-200`}
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back to Topics
              </button>
            </div>
            <motion.div
              className="mb-6 relative"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <input
                type="text"
                placeholder={`Search within ${subtopic}...`}
                className={`w-full p-3 pl-10 rounded-lg ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-black'
                } focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <Search
                className={`absolute left-3 top-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
              />
            </motion.div>

            <PageTabs
              debouncedSearchTerm={debouncedSearchTerm}
              tabStart={tabStart}
              visibleTabs={visibleTabs}
              activePage={activePage}
              totalTabs={filteredChunks.length}
              maxVisibleTabs={maxVisibleTabs}
              warningKeywords={warningKeywords}
              filteredChunks={filteredChunks}
              handleTabClick={handleTabClick}
            />

            <AnimatePresence mode="wait">
              {error ? (
                <motion.div
                  key="error"
                  className="text-center mb-4 text-red-500"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex flex-col items-center justify-center">
                    <AlertTriangle className="w-12 h-12 mb-4" />
                    <h2 className="text-xl font-bold mb-2">Error</h2>
                    <p className="mb-4">{error}</p>
                    <p className="mb-4">
                      There was an issue fetching the content. Please contact support if the error persists.
                    </p>
                  </div>
                </motion.div>
              ) : filteredChunks.length > 0 ? (
                filteredChunks
                  .filter(chunk => chunk.page_number === activePage)
                  .map(chunk => (
                    <ChunkRenderer
                      key={chunk.page_number}
                      chunk={chunk}
                      debouncedSearchTerm={debouncedSearchTerm}
                      onImageClick={setSelectedImage}
                    />
                  ))
              ) : (
                <motion.div
                  key="no-results"
                  className={`text-center mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  No results found for the current search.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <AdSpace side="right" />
        </div>
      </div>

      {selectedImage && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <motion.img
              src={selectedImage}
              alt="Selected image"
              className="max-w-full max-h-full object-contain"
              style={{ transform: `scale(${zoomLevel})` }}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            />
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors duration-300"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-8 h-8" />
            </button>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
              <button
                className="bg-white text-black rounded-full p-2 hover:bg-gray-200 transition-colors duration-300"
                onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.1))}
              >
                <ZoomOut className="w-6 h-6" />
              </button>
              <button
                className="bg-white text-black rounded-full p-2 hover:bg-gray-200 transition-colors duration-300"
                onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.1))}
              >
                <ZoomIn className="w-6 h-6" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}