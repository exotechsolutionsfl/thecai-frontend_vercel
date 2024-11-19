'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Folder, ChevronRight } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiFetch } from '@api/api'
import Loading from '@/components/loading'
import HierarchicalSearch from '@/components/hierarchical-search'
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

interface Topic {
  name: string
}

interface SearchResult {
  main_topic: string
  nested_topic: string
  subtopic: string
  score: number
}

export default function MainTopicsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const make = searchParams.get('make') || ''
  const model = searchParams.get('model') || ''
  const year = searchParams.get('year') || ''

  const [topics, setTopics] = useState<Topic[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (make && model && year) {
      const fetchMainTopics = async () => {
        setIsLoading(true)
        setError(null)
        try {
          const mainTopicsData = await apiFetch(`api/main-topics?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${encodeURIComponent(year)}`)

          if (!mainTopicsData.main_topic || !Array.isArray(mainTopicsData.main_topic)) {
            throw new Error("Main topics not found or invalid format")
          }

          const mappedTopics: Topic[] = mainTopicsData.main_topic.map((topic: string) => ({
            name: topic,
          }))
          setTopics(mappedTopics.sort((a, b) => a.name.localeCompare(b.name)))
        } catch (error) {
          console.error("Error fetching main topics:", error)
          setError("Failed to fetch main topics. Please try again later.")
        } finally {
          setIsLoading(false)
        }
      }

      fetchMainTopics()
    }
  }, [make, model, year])

  const handleTopicSelect = (topic: string) => {
    const url = `/nested-topics?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${encodeURIComponent(year)}&mainTopic=${encodeURIComponent(topic)}`
    router.push(url)
  }

  const handleSearchResult = (result: SearchResult) => {
    const url = `/subtopic-details?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${encodeURIComponent(year)}&mainTopic=${encodeURIComponent(result.main_topic)}&nestedTopic=${encodeURIComponent(result.nested_topic)}&subtopic=${encodeURIComponent(result.subtopic)}`
    router.push(url)
  }

  const AdSpace = ({ side }: { side: 'left' | 'right' }) => (
    <div className={`hidden lg:flex flex-col items-center justify-start h-full w-full max-w-xs border-2 rounded-lg p-4 ${side === 'left' ? 'mr-4' : 'ml-4'}`}>
      <p className="text-sm text-muted-foreground">Ad Space</p>
    </div>
  )

  if (isLoading) {
    return <Loading message="Loading topics..." />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center">
        <div className="w-full max-w-screen-2xl flex">
          <AdSpace side="left" />
          <div className="flex-grow px-4">
            <div className="mb-6">
              <HierarchicalSearch
                onSelect={handleSearchResult}
                placeholder={`Search topics for ${make} ${model} ${year}...`}
                make={make}
                model={model}
                year={year}
              />
            </div>

            <AnimatePresence mode="wait">
              {error ? (
                <motion.div
                  className="text-destructive text-center mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {error}
                </motion.div>
              ) : (
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {topics.length > 0 ? (
                    topics.map((topic) => (
                      <motion.div key={topic.name} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Card>
                          <CardContent className="p-4">
                            <Button
                              variant="ghost"
                              className="w-full justify-between text-left"
                              onClick={() => handleTopicSelect(topic.name)}
                            >
                              <div className="flex items-center space-x-3">
                                <Folder className="w-5 h-5" />
                                <span className="text-lg font-semibold">{topic.name}</span>
                              </div>
                              <ChevronRight className="w-5 h-5" />
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      className="col-span-full text-center text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      No main topics found for the selected vehicle. Please try a different search or contact support.
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <AdSpace side="right" />
        </div>
      </div>
    </div>
  )
}