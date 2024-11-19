'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FileText, ChevronRight } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiFetch } from '@api/api'
import { debounce } from '@/lib/utils'
import Loading from '@/components/loading'
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"

export default function SubtopicsMenu() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const make = searchParams.get('make') || ''
  const model = searchParams.get('model') || ''
  const year = searchParams.get('year') || ''
  const mainTopic = searchParams.get('mainTopic') || ''
  const nestedTopic = searchParams.get('nestedTopic') || ''

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [subtopics, setSubtopics] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
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

  useEffect(() => {
    if (make && model && year && mainTopic) {
      const fetchSubtopics = async () => {
        setIsLoading(true)
        setError(null)
        try {
          const data = await apiFetch(`api/subtopics?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${encodeURIComponent(year)}&main_topic=${encodeURIComponent(mainTopic)}${nestedTopic ? `&nested_topic=${encodeURIComponent(nestedTopic)}` : ''}`)
          if (!data.subtopic || !Array.isArray(data.subtopic)) {
            console.error("Error: subtopic not found or not an array in the response", data)
            setError("Failed to fetch subtopics.")
            return
          }
          setSubtopics(data.subtopic.sort((a: string, b: string) => a.localeCompare(b)))
        } catch (error: unknown) {
          console.error("Error fetching subtopics:", error)
          setError("Failed to fetch subtopics.")
        } finally {
          setIsLoading(false)
        }
      }

      fetchSubtopics()
    }
  }, [make, model, year, mainTopic, nestedTopic])

  const handleSubtopicSelect = (subtopic: string) => {
    console.log(`Selected subtopic: ${subtopic}`)
    const url = `/subtopic-details?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${encodeURIComponent(year)}&mainTopic=${encodeURIComponent(mainTopic)}${nestedTopic ? `&nestedTopic=${encodeURIComponent(nestedTopic)}` : ''}&subtopic=${encodeURIComponent(subtopic)}`
    router.push(url)
  }

  const levenshteinDistance = (a: string, b: string): number => {
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
  }

  const getSuggestions = useCallback((input: string): string[] => {
    const maxDistance = 3
    return subtopics
      .filter(topic => levenshteinDistance(input.toLowerCase(), topic.toLowerCase()) <= maxDistance)
      .sort((a, b) => levenshteinDistance(input.toLowerCase(), a.toLowerCase()) - levenshteinDistance(input.toLowerCase(), b.toLowerCase()))
      .slice(0, 3)
  }, [subtopics])

  useEffect(() => {
    if (debouncedSearchTerm) {
      const newSuggestions = getSuggestions(debouncedSearchTerm)
      setSuggestions(newSuggestions)
    } else {
      setSuggestions([])
    }
  }, [debouncedSearchTerm, getSuggestions])

  const filteredSubtopics = subtopics.filter(topic => 
    topic.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
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
                placeholder="Search..."
                className="w-full pl-10"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              {suggestions.length > 0 && searchTerm && filteredSubtopics.length === 0 && (
                <Card className="mt-1">
                  <CardContent className="p-2">
                    <p className="text-sm text-muted-foreground px-2 py-1">Did you mean:</p>
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
                  {filteredSubtopics.length > 0 ? (
                    filteredSubtopics.map((subtopic) => (
                      <motion.div
                        key={subtopic}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card>
                          <CardContent className="p-4">
                            <Button
                              variant="ghost"
                              className="w-full justify-between text-left h-auto py-3"
                              onClick={() => handleSubtopicSelect(subtopic)}
                            >
                              <div className="flex items-center space-x-3 overflow-hidden">
                                <FileText className="w-5 h-5 flex-shrink-0" />
                                <span className="text-base font-semibold line-clamp-2">
                                  {highlightText(subtopic, debouncedSearchTerm)}
                                </span>
                              </div>
                              <ChevronRight className="w-5 h-5 flex-shrink-0" />
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
                      No subtopics found for the current search.
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