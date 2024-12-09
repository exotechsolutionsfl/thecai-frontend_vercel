import { motion, AnimatePresence } from 'framer-motion'

interface CurlyBraceProps {
  isVisible: boolean
  children: React.ReactNode
  count?: number
}

export const CurlyBrace: React.FC<CurlyBraceProps> = ({ isVisible, children, count }) => {
  return (
    <div className="relative pl-4 ml-2">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <motion.div
              className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-md"
              initial={{ height: 0 }}
              animate={{ height: '100%' }}
              exit={{ height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute left-1 top-0 w-3 h-1 bg-primary rounded-tr-md"
              initial={{ width: 0 }}
              animate={{ width: '12px' }}
              exit={{ width: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute left-1 bottom-0 w-3 h-1 bg-primary rounded-br-md"
              initial={{ width: 0 }}
              animate={{ width: '12px' }}
              exit={{ width: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            />
            {count !== undefined && (
              <div className="absolute left-[-20px] top-[10px] bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {count}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  )
}