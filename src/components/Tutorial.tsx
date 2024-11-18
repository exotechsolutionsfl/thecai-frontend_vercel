'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { useTheme } from '@context/ThemeProvider'
import { X, ChevronRight } from 'lucide-react'

interface TutorialStep {
  title: string
  content: string
  targetId: string
}

interface TutorialProps {
  steps: TutorialStep[]
  pageName: string
  onComplete?: () => void
  currentStep: number
  onNextStep: () => void
}

export const Tutorial: React.FC<TutorialProps> = ({ steps, pageName, onComplete, currentStep, onNextStep }) => {
  const { theme } = useTheme()
  const messageRef = useRef<HTMLDivElement>(null)
  const [spotlightPosition, setSpotlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 })

  const updateSpotlightPosition = useCallback(() => {
    const target = document.getElementById(steps[currentStep].targetId)
    if (target) {
      const rect = target.getBoundingClientRect()
      setSpotlightPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      })
    }
  }, [currentStep, steps])

  useEffect(() => {
    updateSpotlightPosition()
    window.addEventListener('resize', updateSpotlightPosition)
    window.addEventListener('scroll', updateSpotlightPosition)

    return () => {
      window.removeEventListener('resize', updateSpotlightPosition)
      window.removeEventListener('scroll', updateSpotlightPosition)
    }
  }, [updateSpotlightPosition])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      onNextStep()
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    localStorage.setItem(`tutorial_${pageName}`, 'completed')
    onComplete?.()
  }

  const handleClose = () => {
    handleComplete()
  }

  const getMessagePosition = () => {
    if (currentStep === 0) {
      return { left: 16, top: 80, right: 'auto', bottom: 'auto', transform: 'none' }
    } else if (currentStep === 1) {
      return { left: 16, top: '50%', right: 'auto', bottom: 'auto', transform: 'translateY(-50%)' }
    } else {
      return { left: 'auto', top: '50%', right: 16, bottom: 'auto', transform: 'translateY(-50%)' }
    }
  }

  return (
    <LayoutGroup>
      <div className="fixed inset-0 z-50 pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-black bg-opacity-25 pointer-events-auto"
        />
        <motion.div
          initial={false}
          animate={{
            top: spotlightPosition.top - 4,
            left: spotlightPosition.left - 4,
            width: spotlightPosition.width + 8,
            height: spotlightPosition.height + 8,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute bg-transparent"
          style={{
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            borderRadius: '8px',
          }}
        />
        <motion.div 
          ref={messageRef}
          layout
          initial={false}
          animate={getMessagePosition()}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute w-80 pointer-events-auto"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`${
                theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'
              } p-6 rounded-lg shadow-xl`}
            >
              <button
                onClick={handleClose}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                aria-label="Close tutorial"
              >
                <X size={20} />
              </button>
              <h3 className="text-xl font-bold mb-2">{steps[currentStep].title}</h3>
              <p className="mb-4">{steps[currentStep].content}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <button
                  onClick={handleNext}
                  className={`${
                    theme === 'dark'
                      ? 'bg-white text-black hover:bg-gray-200'
                      : 'bg-black text-white hover:bg-gray-800'
                  } font-bold py-2 px-3 rounded focus:outline-none focus:shadow-outline transition duration-300`}
                  aria-label={currentStep < steps.length - 1 ? 'Next step' : 'Finish tutorial'}
                >
                  {currentStep < steps.length - 1 ? <ChevronRight size={20} /> : 'Finish'}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </LayoutGroup>
  )
}