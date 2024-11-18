'use client'

import { useState, useRef, useEffect, useCallback, KeyboardEvent as ReactKeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, X } from 'lucide-react'
import { useTheme } from '@/context/ThemeProvider'
import { apiFetch } from '@api/api'

interface SearchResult {
  main_topic: string
  nested_topic: string
  subtopic: string
  score: number
}

interface HierarchicalSearchProps {
  onSelect: (result: SearchResult) => void
  placeholder?: string
  make: string
  model: string
  year: string
}

export default function HierarchicalSearch({ onSelect, placeholder = "Search topics...", make, model, year }: HierarchicalSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const { theme } = useTheme()
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const debounce = (func: (...args: unknown[]) => void, delay: number) => {
    return (...args: unknown[]) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
      searchTimeoutRef.current = setTimeout(() => func(...args), delay)
    }
  }

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setIsDropdownOpen(false)
      return
    }

    setIsLoading(true)
    setError(null)
    setIsDropdownOpen(true)

    try {
      const data = await apiFetch(`api/hierarchical-search?query=${encodeURIComponent(searchQuery)}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${encodeURIComponent(year)}`)
      setResults(data.results || [])
    } catch (err) {
      console.error('Search failed:', err)
      setError('Search failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [make, model, year])

  const debouncedSearch = useCallback(
    (searchQuery: string) => debounce(() => handleSearch(searchQuery), 300)(),
    [handleSearch]
  )

  useEffect(() => {
    debouncedSearch(query)
  }, [query, debouncedSearch])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      onSelect(results[selectedIndex])
      setIsDropdownOpen(false)
    }
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setIsDropdownOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  const fadeInVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className={`w-full max-w-2xl mx-auto ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
      <motion.div
        className="mb-6 relative"
        variants={fadeInVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.3 }}
      >
        <div className={`flex items-center rounded-lg overflow-hidden ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-300'
        } border focus-within:ring-2 focus-within:ring-primary focus-within:border-primary`}>
          <Search className={`ml-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            className={`flex-grow p-3 ${
              theme === 'dark' 
                ? 'bg-gray-800 text-white' 
                : 'bg-white text-black'
            } focus:outline-none`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search topics"
            aria-autocomplete="list"
            aria-controls="search-results"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                onClick={handleClear}
                className={`flex items-center justify-center h-full px-3 ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-black'
                } transition-colors duration-300`}
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              ref={dropdownRef}
              id="search-results"
              className={`absolute z-50 w-full mt-1 rounded-md shadow-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={fadeInVariants}
              role="listbox"
            >
              {isLoading ? (
                <div className="flex justify-center items-center p-4">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" aria-label="Loading results" />
                </div>
              ) : results.length > 0 ? (
                <div className="max-h-60 overflow-y-auto">
                  {results.map((result, index) => (
                    <motion.div
                      key={index}
                      className={`p-3 cursor-pointer ${
                        theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      } ${selectedIndex === index ? (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100') : ''} transition-colors duration-200`}
                      onClick={() => {
                        onSelect(result)
                        setIsDropdownOpen(false)
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      role="option"
                      aria-selected={selectedIndex === index}
                    >
                      <div className="font-semibold">{result.main_topic}</div>
                      <div className="text-sm">{result.nested_topic} {result.subtopic}</div>
                      <div className={`text-xs mt-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {Math.round(result.score * 100)}% Match
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center" role="status">No results found</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {error && (
        <motion.div
          className="text-red-500 text-center mt-4"
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3 }}
          role="alert"
        >
          {error}
        </motion.div>
      )}
    </div>
  )
}