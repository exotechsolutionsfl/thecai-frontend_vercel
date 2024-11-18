import React, { useState, useRef, useEffect } from 'react'
import { useTheme } from '@/context/ThemeProvider'
import { motion, AnimatePresence } from 'framer-motion'

interface PopoverProps {
  trigger: React.ReactNode
  content: React.ReactNode | ((props: { theme: string }) => React.ReactNode)
  align?: 'start' | 'end' | 'center'
}

export const Popover: React.FC<PopoverProps> = ({ trigger, content, align = 'start' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const togglePopover = () => setIsOpen(!isOpen)

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className="relative inline-block" onKeyDown={handleKeyDown}>
      <div ref={triggerRef} onClick={togglePopover} role="button" tabIndex={0} aria-haspopup="true" aria-expanded={isOpen}>
        {trigger}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-10 bottom-full mb-2 ${
              align === 'end' ? 'right-0' : align === 'center' ? 'left-1/2 transform -translate-x-1/2' : 'left-0'
            } ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-black'
            } border rounded-md shadow-lg max-h-60 overflow-y-auto`}
            role="dialog"
            aria-modal="true"
          >
            {typeof content === 'function' ? content({ theme }) : content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export const PopoverTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>
}

export const PopoverContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return <div className={`p-2 ${className}`}>{children}</div>
}