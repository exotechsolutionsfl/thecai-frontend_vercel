'use client'

import { motion } from 'framer-motion'
import { ImageIcon } from 'lucide-react'
import { useTheme } from '@context/ThemeProvider'
import ImageRenderer from './ImageRenderer'
import { ChunkText } from '@/types/dynamic-content'

interface ChunkRendererProps {
  chunk: ChunkText
  debouncedSearchTerm: string
  onImageClick: (url: string) => void
}

export default function ChunkRenderer({ chunk, debouncedSearchTerm, onImageClick }: ChunkRendererProps) {
  const { theme } = useTheme()

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
      return text
    }
    const regex = new RegExp(`(${highlight})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-black">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  const renderImages = () => {
    const images = []
    for (let i = 1; i <= 5; i++) {
      const imageKey = `Image_${i}`
      const imageUrlKey = `Image_${i}_url`
      if (chunk[imageKey] && chunk[imageUrlKey]) {
        const imageUrl = chunk[imageUrlKey] as string
        images.push(
          <ImageRenderer
            key={imageKey}
            imageUrl={imageUrl}
            pageNumber={chunk.page_number || 0}
            imageIndex={i}
            onImageClick={onImageClick}
          />
        )
      }
    }
    return images.length > 0 ? (
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">{images}</div>
    ) : null
  }

  const hasImages = [1, 2, 3, 4, 5].some(i => chunk[`Image_${i}`] && chunk[`Image_${i}_url`])

  return (
    <motion.div
      key={chunk.page_number}
      className={`${
        theme === 'dark' ? 'text-white bg-gray-800' : 'text-black bg-white'
      } rounded-lg p-6 shadow-lg`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {hasImages && (
        <div
          className={`text-lg font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-black'
          } mb-4 flex items-center`}
        >
          <ImageIcon className="w-5 h-5 mr-2" />
          Images available
        </div>
      )}
      <div className="whitespace-pre-wrap mb-4">{highlightText(chunk.text, debouncedSearchTerm)}</div>
      {renderImages()}
    </motion.div>
  )
}