'use client'

import { motion } from 'framer-motion'
import { Settings } from 'lucide-react'
import { useTheme } from '@context/ThemeProvider'

interface LoadingProps {
  message?: string | null;
}

export default function Loading({ message }: LoadingProps) {
  const { theme } = useTheme()

  return (
    <div className={`fixed inset-0 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <div className="flex flex-col items-center justify-center w-full h-full">
        <motion.div
          className="w-16 h-16 mb-4"
          animate={{
            rotate: [0, 360, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Settings className={`w-full h-full ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
        </motion.div>
        {message !== null && (
          <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  )
}