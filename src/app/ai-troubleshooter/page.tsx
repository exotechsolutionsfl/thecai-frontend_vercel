'use client'

import React, { useReducer, useCallback, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/Card"
import { initialState, reducer } from './state'

const VehicleSelection = React.lazy(() => import('./vehicle-selection'))
const ChatInterface = React.lazy(() => import('./chat-interface'))

export default function AITroubleshooter() {
  const [state, dispatch] = useReducer(reducer, initialState, (initial) => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('aiTroubleshooterState')
      return savedState ? JSON.parse(savedState) : initial
    }
    return initial
  })

  useEffect(() => {
    localStorage.setItem('aiTroubleshooterState', JSON.stringify(state))
  }, [state])

  const handleConfirm = useCallback(() => {
    if (state.selectedMake && state.selectedModel && state.selectedYear) {
      console.log('Setting showChat to true')
      dispatch({ type: 'SET_SHOW_CHAT', payload: true })
    }
  }, [state.selectedMake, state.selectedModel, state.selectedYear])

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
      <AnimatePresence mode="wait">
        {!state.showChat ? (
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <Card>
              <CardContent className="p-6">
                <h1 className="text-2xl font-bold mb-8 text-center">
                  AI Troubleshooter
                </h1>
                <Suspense fallback={<LoadingSpinner />}>
                  <VehicleSelection state={state} dispatch={dispatch} onConfirm={handleConfirm} />
                </Suspense>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-4xl"
          >
            <Suspense fallback={<LoadingSpinner />}>
              <ChatInterface state={state} dispatch={dispatch} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-32">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )
}