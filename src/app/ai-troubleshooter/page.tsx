'use client'

import React, { useReducer, useCallback, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { initialState, reducer } from './state'
import { Card, CardContent } from "@/components/ui/Card"
import { Skeleton } from "@/components/ui/Skeleton"

const VehicleSelection = React.lazy(() => import('@/components/vehicle-selection'))
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
      console.log('Setting showChat to true');
      dispatch({ type: 'SET_SHOW_CHAT', payload: true })
    }
  }, [state.selectedMake, state.selectedModel, state.selectedYear])

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center overflow-hidden">
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
              <CardContent className="pt-6">
                <h1 className="text-2xl font-bold mb-8 text-center">
                  AI Troubleshooter
                </h1>
                <Suspense fallback={
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                }>
                  <VehicleSelection state={state} dispatch={dispatch} onConfirm={handleConfirm} />
                </Suspense>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Suspense fallback={
            <Card className="w-full max-w-2xl h-[600px]">
              <CardContent className="h-full flex items-center justify-center">
                <Skeleton className="h-[500px] w-full" />
              </CardContent>
            </Card>
          }>
            <ChatInterface state={state} dispatch={dispatch} />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  )
}