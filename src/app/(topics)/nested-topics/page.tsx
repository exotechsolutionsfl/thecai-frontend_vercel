'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Folder, ChevronRight } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiFetch } from '@api/api'
import Loading from '@components/loading'
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

export default function NestedTopics() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const make = searchParams.get('make') || ''
  const model = searchParams.get('model') || ''
  const year = searchParams.get('year') || ''
  const mainTopic = searchParams.get('mainTopic') || ''

  const [searchTerm, setSearchTerm] = useState('')
  const [nestedTopics, setNestedTopics] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (make && model && year && mainTopic) {
      const fetchNestedTopics = async () => {
        setIsLoading(true)
        setError(null)
        try {
          const data = await apiFetch(`api/nested-topics?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${encodeURIComponent(year)}&main_topic=${encodeURIComponent(mainTopic)}`)
          if (!data.nested_topic || !Array.isArray(data.nested_topic)) {
            console.error("Error: nested_topic not found or not an array in the response", data)
            setError("Failed to fetch nested topics.")
            return
          }
          setNestedTopics(data.nested_topic.sort((a: string, b: string) => a.localeCompare(b)))
        } catch (error: unknown) {
          console.error("Error fetching nested topics:", error)
          setError("Failed to fetch nested topics.")
        } finally {
          setIsLoading(false)
        }
      }

      fetchNestedTopics()
    }
  }, [make, model, year, mainTopic])

  const handleNestedTopicSelect = (nestedTopic: string) => {
    console.log(`Selected nested topic: ${nestedTopic}`)
    const url = `/subtopics-menu?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${encodeURIComponent(year)}&mainTopic=${encodeURIComponent(mainTopic)}&nestedTopic=${encodeURIComponent(nestedTopic)}`
    router.push(url)
  }

  const levenshteinDistance = useCallback((a: string, b: string): number => {
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null))

    for (let i = 0; i <= a.length; i++) matrix[0][i] = i
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j

    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + substitutionCost
        )
      }
    }

    return matrix[b.length][a.length]
  }, [])

  const getSuggestions = useCallback((input: string): string[] => {
    const maxDistance = 3
    return nestedTopics
      .filter(topic => levenshteinDistance(input.toLowerCase(), topic.toLowerCase()) <= maxDistance)
      .sort((a, b) => levenshteinDistance(input.toLowerCase(), a.toLowerCase()) - levenshteinDistance(input.toLowerCase(), b.toLowerCase()))
      .slice(0, 3)
  }, [nestedTopics, levenshteinDistance])

  useEffect(() => {
    if (searchTerm) {
      const newSuggestions = getSuggestions(searchTerm)
      setSuggestions(newSuggestions)
    } else {
      setSuggestions([])
    }
  }, [searchTerm, getSuggestions])

  const filteredNestedTopics = nestedTopics.filter(topic => 
    topic.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
      return text
    }
    const regex = new RegExp(`(${highlight})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, index) => 
      regex.test(part) ? <mark key={index} className="bg-yellow-200 text-black">{part}</mark> : part
    )
  }

  if (isLoading) {
    return <Loading />
  }

  const AdSpace = ({ side }: { side: 'left' | 'right' }) => (
    <div className={`hidden lg:flex flex-col items-center justify-start h-full w-full max-w-xs border-2 rounded-lg p-4 ${side === 'left' ? 'mr-4' : 'ml-4'}`}>
      <p className="text-sm text-muted-foreground">Ad Space</p>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center">
        <div className="w-full max-w-screen-2xl flex">
          <AdSpace side="left" />
          <div className="flex-grow px-4">
            <div className="mb-6 relative">
              <Input
                type="text"
                placeholder="Search nested topics..."
                className="w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              {suggestions.length > 0 && searchTerm && filteredNestedTopics.length === 0 && (
                <Card className="absolute z-10 mt-1 w-full">
                  <CardContent className="p-2">
                    <p className="px-2 py-1 text-sm text-muted-foreground">Did you mean:</p>
                    {suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start text-left px-2 py-1"
                        onClick={() => setSearchTerm(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            <AnimatePresence mode="wait">
              {error ? (
                <motion.div
                  className="text-destructive text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {error}
                </motion.div>
              ) : (
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {filteredNestedTopics.length > 0 ? (
                    filteredNestedTopics.map((nestedTopic) => (
                      <motion.div key={nestedTopic} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Card>
                          <CardContent className="p-4">
                            <Button
                              variant="ghost"
                              className="w-full justify-between text-left h-auto py-2"
                              onClick={() => handleNestedTopicSelect(nestedTopic)}
                            >
                              <div className="flex items-start space-x-3">
                                <Folder className="w-6 h-6 flex-shrink-0 text-gray-600" />
                                <h2 className="text-lg font-semibold break-words text-black">
                                  {highlightText(nestedTopic, searchTerm)}
                                </h2>
                              </div>
                              <ChevronRight className="w-5 h-5 flex-shrink-0 ml-2" />
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
                      No nested topics found for the current search.
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