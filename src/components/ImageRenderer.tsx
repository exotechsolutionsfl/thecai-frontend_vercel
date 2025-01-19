import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { ZoomIn, Loader2 } from 'lucide-react'
import { useTheme } from '@context/ThemeProvider'

interface ImageRendererProps {
  imageUrl: string
  pageNumber: number
  imageIndex: number
  onImageClick: (url: string) => void
}

export default function ImageRenderer({ imageUrl, pageNumber, imageIndex, onImageClick }: ImageRendererProps) {
  const { theme } = useTheme()
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  const handleImageClick = () => {
    if (!imageError) {
      onImageClick(imageUrl)
    }
  }

  return (
    <motion.div
      key={`image-${pageNumber}-${imageIndex}`}
      className="mt-4 relative cursor-pointer group"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      onClick={handleImageClick}
      role="button"
      tabIndex={0}
      aria-label={`View larger image ${imageIndex} from page ${pageNumber}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleImageClick()
        }
      }}
    >
      {imageLoading && !imageError && (
        <div
          className={`absolute inset-0 flex items-center justify-center ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
          } rounded-lg`}
          aria-hidden="true"
        >
          <Loader2
            className={`w-8 h-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} animate-spin`}
          />
        </div>
      )}
      <Image
        src={imageError ? '/placeholder.svg' : imageUrl}
        alt={`Image ${imageIndex} for page ${pageNumber}`}
        width={500}
        height={300}
        className={`rounded-lg shadow-md transition-transform duration-300 ${
          !imageError ? 'group-hover:scale-105' : ''
        }`}
        loading="lazy"
        onLoadingComplete={() => setImageLoading(false)}
        onError={() => {
          setImageError(true)
          setImageLoading(false)
        }}
      />
      {!imageError && (
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 rounded-lg flex items-center justify-center">
          <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={24} aria-hidden="true" />
        </div>
      )}
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Image not available</p>
        </div>
      )}
    </motion.div>
  )
}