import { useState } from 'react'
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

  return (
    <motion.div
      key={`image-${pageNumber}-${imageIndex}`}
      className="mt-4 relative cursor-pointer group"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      onClick={() => onImageClick(imageUrl)}
    >
      {imageLoading && (
        <div
          className={`absolute inset-0 flex items-center justify-center ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } rounded-lg`}
        >
          <Loader2
            className={`w-8 h-8 ${theme === 'dark' ? 'text-white' : 'text-black'} animate-spin`}
          />
        </div>
      )}
      <Image
        src={imageUrl}
        alt={`Image ${imageIndex} for page ${pageNumber}`}
        width={500}
        height={300}
        className="rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
        onLoadingComplete={() => setImageLoading(false)}
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.onerror = null
          target.src = '/placeholder.svg'
          setImageLoading(false)
        }}
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 rounded-lg flex items-center justify-center">
        <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={24} />
      </div>
    </motion.div>
  )
}