'use client'

import { useEffect, useReducer, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, X, Plus, MessageSquare, ChevronLeft, Moon, Sun, Menu } from 'lucide-react'
import { useSavedVehicles } from '@context/VehicleContext'
import { useTheme } from '@context/ThemeProvider'
import { apiFetch } from '@api/api'
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/Textarea"
import { vesselReducer, initialState } from '@/reducers/vesselReducer'

interface BreadcrumbItem {
  label: string
  href: string
}

interface VesselProps {
  children: React.ReactNode
}

interface Vehicle {
  make: string
  model: string
  year: string
}

export default function Vessel({ children }: VesselProps) {
  const [state, dispatch] = useReducer(vesselReducer, initialState)
  const router = useRouter()
  const { savedVehicles, setSavedVehicles } = useSavedVehicles()
  const { theme, toggleTheme } = useTheme()
  const searchParams = useSearchParams()

  useEffect(() => {
    document.body.style.overflow = state.isSettingsOpen ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [state.isSettingsOpen])

  const handleFeedbackSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch({ type: 'SET_IS_SUBMITTING', payload: true })
    try {
      const response = await apiFetch('api/general-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: state.feedbackType, content: state.feedback }),
      })

      if (response.message === 'Feedback submitted successfully') {
        dispatch({ type: 'SET_RESULT', payload: { message: 'Feedback submitted successfully!', isSuccess: true } })
        dispatch({ type: 'RESET_FEEDBACK' })
      } else {
        throw new Error('Failed to submit feedback')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      dispatch({ type: 'SET_RESULT', payload: { message: 'Failed to submit feedback. Please try again.', isSuccess: false } })
    } finally {
      dispatch({ type: 'SET_IS_SUBMITTING', payload: false })
      dispatch({ type: 'SET_SHOW_RESULT_MODAL', payload: true })
    }
  }, [dispatch, state.feedbackType, state.feedback])

  const getTitleAndBreadcrumbs = () => {
    const make = searchParams.get('make')
    const model = searchParams.get('model')
    const year = searchParams.get('year')
    const mainTopic = searchParams.get('mainTopic')
    const nestedTopic = searchParams.get('nestedTopic')
    const subtopic = searchParams.get('subtopic')

    const title = make && model && year ? `${make} ${model} (${year})` : ''
    const breadcrumbs: BreadcrumbItem[] = []

    if (make && model && year) {
      breadcrumbs.push(
        { label: 'Vehicle Selection', href: '/vehicle-selection' },
        { label: title, href: `/main-topics?make=${make}&model=${model}&year=${year}` }
      )

      if (mainTopic) {
        breadcrumbs.push({ 
          label: mainTopic, 
          href: `/nested-topics?make=${make}&model=${model}&year=${year}&mainTopic=${mainTopic}` 
        })

        if (nestedTopic) {
          breadcrumbs.push({ 
            label: nestedTopic, 
            href: `/subtopics-menu?make=${make}&model=${model}&year=${year}&mainTopic=${mainTopic}&nestedTopic=${nestedTopic}` 
          })
        }

        if (subtopic) {
          breadcrumbs.push({ 
            label: subtopic, 
            href: `/subtopic-details?make=${make}&model=${model}&year=${year}&mainTopic=${mainTopic}&nestedTopic=${nestedTopic}&subtopic=${subtopic}` 
          })
        }
      }
    }

    return { title, breadcrumbs }
  }

  const { title, breadcrumbs } = getTitleAndBreadcrumbs()

  return (
    <div className="flex flex-col h-screen">
      <header className="flex-none bg-background shadow-md z-10 h-16">
        <div className="p-4 flex items-center justify-between relative">
          <Link href="/" className="text-2xl font-bold hover:text-primary transition-colors duration-300">
            Thec<span className="glow-text">AI</span>
          </Link>
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {title && <h2 className="text-xl font-semibold">{title}</h2>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
            aria-label="Toggle settings"
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>
        {breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="text-sm px-4 pb-2">
            <ol className="flex items-center space-x-2 overflow-x-auto whitespace-nowrap">
              {breadcrumbs.map((item, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground mx-2" />}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-muted-foreground">{item.label}</span>
                  ) : (
                    <Link href={item.href} className="hover:text-primary transition-colors duration-300">
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
      </header>

      <main className="flex-1 overflow-y-auto mt-16">
        {children}
      </main>

      <AnimatePresence>
        {state.isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 bottom-0 w-80 p-6 shadow-lg overflow-y-auto bg-background"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Settings</h2>
                <Button variant="ghost" size="icon" onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}>
                  <X className="w-6 h-6" />
                </Button>
              </div>

              {state.activeSection === 'main' && (
                <nav className="space-y-4">
                  <Button variant="outline" className="w-full justify-start text-lg" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                    {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-lg" onClick={() => dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'myVehicles' })}>
                    <Plus className="mr-2 h-4 w-4" />
                    My Vehicles
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-lg" onClick={() => dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'feedback' })}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Leave Feedback
                  </Button>
                </nav>
              )}

              {state.activeSection === 'myVehicles' && (
                <div className="space-y-4">
                  <Button variant="link" className="p-0 text-lg" onClick={() => dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'main' })}>
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Back to Settings
                  </Button>
                  {savedVehicles.map((vehicle: Vehicle, index: number) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <Button 
                            variant="ghost" 
                            className="text-left flex-grow p-0" 
                            onClick={() => {
                              router.push(`/main-topics?make=${encodeURIComponent(vehicle.make)}&model=${encodeURIComponent(vehicle.model)}&year=${encodeURIComponent(vehicle.year)}`)
                              dispatch({ type: 'TOGGLE_SETTINGS' })
                            }}
                          >
                            <h3 className="text-lg font-semibold">{vehicle.make} {vehicle.model}</h3>
                            <p className="text-sm text-muted-foreground">{vehicle.year}</p>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setSavedVehicles(savedVehicles.filter((_, i) => i !== index))} className="text-destructive">
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      router.push('/vehicle-selection')
                      dispatch({ type: 'TOGGLE_SETTINGS' })
                    }}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add New Vehicle
                  </Button>
                </div>
              )}

              {state.activeSection === 'feedback' && (
                <div className="space-y-4">
                  <Button variant="link" className="p-0 text-lg" onClick={() => dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'main' })}>
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Back to Settings
                  </Button>
                  <h3 className="text-xl font-bold">Leave Feedback</h3>
                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="feedbackType">Feedback Type</Label>
                      <Select value={state.feedbackType} onValueChange={(value) => dispatch({ type: 'SET_FEEDBACK_TYPE', payload: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select feedback type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="issue">Report an Issue</SelectItem>
                          <SelectItem value="vehicle">Request a Vehicle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="feedback">Feedback</Label>
                      <Textarea
                        id="feedback"
                        value={state.feedback}
                        onChange={(e) => dispatch({ type: 'SET_FEEDBACK', payload: e.target.value })}
                        rows={4}
                        placeholder={state.feedbackType === 'issue' ? "Describe the issue you've encountered..." : "Describe the vehicle you'd like us to add..."}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={state.isSubmitting}>
                      {state.isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                  </form>
                </div>
              )}

              <div className="mt-auto pt-4">
                <Button 
                  variant="link" 
                  className="w-full text-xs" 
                  onClick={() => {
                    router.push('/legal')
                    dispatch({ type: 'TOGGLE_SETTINGS' })
                  }}
                >
                  {/* Assuming FileText is imported correctly */}
                  {/* <FileText className="w-3 h-3 mr-1" /> */}
                  Legal Information
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {state.showResultModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <h3 className={`text-lg font-semibold mb-2 ${state.isSuccess ? 'text-green-500' : 'text-red-500'}`}>
                {state.isSuccess ? 'Success' : 'Error'}
              </h3>
              <p className="mb-4">{state.resultMessage}</p>
              <Button 
                onClick={() => {
                  dispatch({ type: 'SET_SHOW_RESULT_MODAL', payload: false })
                  if (state.isSuccess) {
                    dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'main' })
                  }
                }}
                className="w-full"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}