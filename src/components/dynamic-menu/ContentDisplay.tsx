import { motion } from 'framer-motion'
import { ChunkText } from '@/types/dynamic-content'
import ChunkRenderer from '@/components/ChunkRenderer'

interface ContentDisplayProps {
  chunks: ChunkText[]
}

export default function ContentDisplay({ chunks }: ContentDisplayProps) {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {chunks.map((chunk, index) => (
        <ChunkRenderer
          key={index}
          chunk={chunk}
          debouncedSearchTerm=""
          onImageClick={() => {}}
        />
      ))}
    </motion.div>
  )
}