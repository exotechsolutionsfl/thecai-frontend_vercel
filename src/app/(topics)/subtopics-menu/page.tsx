'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FileText } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiFetch } from '@api/api'
import { useTheme } from '@context/ThemeProvider'
import { debounce } from '@/lib/utils'
import Loading from '@components/loading'

export default function SubtopicsMenu() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { theme } = useTheme()

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
    <div className={`hidden lg:flex flex-col items-center justify-start h-full w-full max-w-xs ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} border-2 rounded-lg p-4 ${side === 'left' ? 'mr-4' : 'ml-4'}`}>
      {/* Empty div to maintain structure */}
    </div>
  )

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }

  return (
    <div className={`relative min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'} font-sans`}>
      <div className="flex justify-center p-4">
        <div className="w-full max-w-screen-2xl flex">
          <AdSpace side="left" />
          <div className="flex-grow px-4">
            <motion.div
              className="mb-6 relative"
              variants={fadeInVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.3 }}
            >
              <input
                type="text"
                placeholder="Search..."
                className={`w-full p-3 pl-10 rounded-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <Search className={`absolute left-3 top-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
              {suggestions.length > 0 && searchTerm && filteredSubtopics.length === 0 && (
                <motion.div
                  className={`absolute z-10 mt-1 w-full ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} border rounded-lg shadow-lg`}
                  variants={fadeInVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.3 }}
                >
                  <p className={`px-4 py-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Did you mean:</p>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className={`block w-full text-left px-4 py-2  ${theme === 'dark' ? 'text-white hover:bg-gray-700' : 'text-black hover:bg-gray-100'} focus:outline-none focus:bg-primary-focus`}
                      onClick={() => setSearchTerm(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </motion.div>
              )}
            </motion.div>

            <AnimatePresence mode="wait">
              {error ? (
                <motion.div
                  className="text-red-500 text-center"
                  variants={fadeInVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ duration: 0.3 }}
                >
                  {error}
                </motion.div>
              ) : (
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                  variants={fadeInVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ duration: 0.3 }}
                >
                  {filteredSubtopics.length > 0 ? (
                    filteredSubtopics.map((subtopic) => (
                      <motion.div
                        key={subtopic}
                        className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'} border rounded-lg shadow-md p-4 cursor-pointer transition-colors duration-300`}
                        variants={fadeInVariants}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSubtopicSelect(subtopic)}
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                          <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                            {highlightText(subtopic, debouncedSearchTerm)}
                          </h2>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      className={`col-span-full text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                      variants={fadeInVariants}
                      initial="hidden"
                      animate="visible"
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