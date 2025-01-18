'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, X, Plus, MessageSquare, ChevronLeft, Moon, Sun, Menu } from 'lucide-react'
import { useSavedVehicles } from '@context/VehicleContext'
import { useTheme } from '@context/ThemeProvider'
import { Toaster, toast } from 'react-hot-toast'
import { apiFetch } from '@api/api'
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/Textarea"
import { FileText } from 'lucide-react'

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<'main' | 'myVehicles' | 'feedback'>('main')
  const [feedbackType, setFeedbackType] = useState<string>('issue')
  const [feedback, setFeedback] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const router = useRouter()
  const { savedVehicles, setSavedVehicles } = useSavedVehicles()
  const { theme, toggleTheme } = useTheme()
  const searchParams = useSearchParams()

  useEffect(() => {
    document.body.style.overflow = isSettingsOpen ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isSettingsOpen])

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await apiFetch('api/general-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: feedbackType, content: feedback }),
      })

      if (response.message === 'Feedback submitted successfully') {
        toast.success('Feedback submitted successfully!')
        setFeedback('')
        setFeedbackType('issue')
        setActiveSection('main')
      } else {
        throw new Error('Failed to submit feedback')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast.error('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

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
        <Toaster />
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
            onClick={() => setIsSettingsOpen(true)}
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
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsSettingsOpen(false)}
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
                <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(false)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>

              {activeSection === 'main' && (
                <nav className="space-y-4">
                  <Button variant="outline" className="w-full justify-start text-lg" onClick={toggleTheme}>
                    {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-lg" onClick={() => setActiveSection('myVehicles')}>
                    <Plus className="mr-2 h-4 w-4" />
                    My Vehicles
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-lg" onClick={() => setActiveSection('feedback')}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Leave Feedback
                  </Button>
                </nav>
              )}

              {activeSection === 'myVehicles' && (
                <div className="space-y-4">
                  <Button variant="link" className="p-0 text-lg" onClick={() => setActiveSection('main')}>
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
                              setIsSettingsOpen(false)
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
                      setIsSettingsOpen(false)
                    }}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add New Vehicle
                  </Button>
                </div>
              )}

              {activeSection === 'feedback' && (
                <div className="space-y-4">
                  <Button variant="link" className="p-0 text-lg" onClick={() => setActiveSection('main')}>
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Back to Settings
                  </Button>
                  <h3 className="text-xl font-bold">Leave Feedback</h3>
                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="feedbackType">Feedback Type</Label>
                      <Select value={feedbackType} onValueChange={setFeedbackType}>
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
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={4}
                        placeholder={feedbackType === 'issue' ? "Describe the issue you've encountered..." : "Describe the vehicle you'd like us to add..."}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
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
                    setIsSettingsOpen(false)
                  }}
                >
                  <FileText className="w-3 h-3 mr-1" />
                  Legal Information
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}