'use client'

import React, { useReducer, useCallback, useEffect, Suspense, lazy } from 'react'
import { useTheme } from '@/context/ThemeProvider'
import { motion, AnimatePresence } from 'framer-motion'
import { initialState, reducer } from './state'

const VehicleSelection = lazy(() => import('./vehicle-selection'))
const ChatInterface = lazy(() => import('./chat-interface'))

export default function AITroubleshooter() {
  const [state, dispatch] = useReducer(reducer, initialState, (initial) => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('aiTroubleshooterState')
      return savedState ? JSON.parse(savedState) : initial
    }
    return initial
  })

  const { theme } = useTheme()

  useEffect(() => {
    localStorage.setItem('aiTroubleshooterState', JSON.stringify(state))
  }, [state])

  const handleConfirm = useCallback(() => {
    if (state.selectedMake && state.selectedModel && state.selectedYear) {
      console.log('Setting showChat to true');
      dispatch({ type: 'SET_SHOW_CHAT', payload: true })
    }
  }, [state.selectedMake, state.selectedModel, state.selectedYear])

  return (
    <div className={`fixed inset-0 ${theme === 'dark' ? 'bg-[#1a1b1e]' : 'bg-white'} font-sans overflow-hidden`}>
      <div className="flex items-center justify-center w-full h-full">
        <AnimatePresence mode="wait">
          {!state.showChat ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md p-4 transition-all duration-500 ease-in-out"
            >
              <h1 className={`text-2xl font-bold mb-8 text-center transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                AI Troubleshooter
              </h1>
              <Suspense fallback={<div>Loading...</div>}>
                <VehicleSelection state={state} dispatch={dispatch} onConfirm={handleConfirm} />
              </Suspense>
            </motion.div>
          ) : (
            <Suspense fallback={<div>Loading...</div>}>
              <ChatInterface state={state} dispatch={dispatch} />
            </Suspense>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}