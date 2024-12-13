'use client'

import React from 'react'
import { useTheme } from '@context/ThemeProvider'

interface LoadingProps {
  message?: string | null;
}

export default function Loading({ message }: LoadingProps) {
  const { theme } = useTheme()

  return (
    <div className={`flex flex-col items-center justify-center w-full h-full ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-primary rounded-full animate-spin border-t-transparent"></div>
      </div>
      {message && (
        <p className="text-sm font-medium">{message}</p>
      )}
    </div>
  )
}