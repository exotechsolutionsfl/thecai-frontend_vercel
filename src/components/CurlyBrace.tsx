import { motion } from 'framer-motion'

interface CurlyBraceProps {
  isOpen: boolean
  itemCount: number
  children: React.ReactNode
}

export const CurlyBrace: React.FC<CurlyBraceProps> = ({ isOpen, itemCount, children }) => {
  if (itemCount < 2) {
    return <>{children}</>
  }

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{
        width: isOpen ? 'auto' : 0,
        opacity: isOpen ? 1 : 0,
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative pl-4 ml-2"
    >
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-md"
        initial={{ height: 0 }}
        animate={{ height: '100%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute left-1 top-0 w-3 h-1 bg-primary rounded-tr-md"
        initial={{ width: 0 }}
        animate={{ width: '12px' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute left-1 bottom-0 w-3 h-1 bg-primary rounded-br-md"
        initial={{ width: 0 }}
        animate={{ width: '12px' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      />
      {children}
    </motion.div>
  )
}