'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, X, Plus, MessageSquare, ChevronLeft, Moon, Sun, FileText, Menu } from 'lucide-react'
import { useSavedVehicles } from '@context/VehicleContext'
import { useTheme } from '@context/ThemeProvider'
import toast, { Toaster } from 'react-hot-toast'
import { apiFetch } from '@api/api'

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface VesselProps {
  children: React.ReactNode;
}

const menuItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
    },
  }),
};

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

  const handleToggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen)
  }

  const handleMyVehicles = () => {
    setActiveSection('myVehicles')
  }

  const handleAddVehicle = () => {
    router.push('/vehicle-selection')
    setIsSettingsOpen(false)
  }

  const handleSelectVehicle = (vehicle: { make: string; model: string; year: string }) => {
    router.push(`/main-topics?make=${encodeURIComponent(vehicle.make)}&model=${encodeURIComponent(vehicle.model)}&year=${encodeURIComponent(vehicle.year)}`)
    setIsSettingsOpen(false)
  }

  const handleDeleteVehicle = (index: number) => {
    const updatedVehicles = savedVehicles.filter((_, i) => i !== index)
    setSavedVehicles(updatedVehicles)
  }

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await apiFetch('api/submit-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: feedbackType, content: feedback }),
      })

      if (response.message === 'Feedback submitted successfully') {
        toast.success('Feedback submitted successfully!', {
          duration: 3000,
          position: 'bottom-center',
          style: {
            background: theme === 'dark' ? '#ffffff' : '#000000',
            color: theme === 'dark' ? '#000000' : '#ffffff',
          },
        })
        setFeedback('')
        setFeedbackType('issue')
        setActiveSection('main')
      } else {
        throw new Error('Failed to submit feedback')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast.error('Failed to submit feedback. Please try again.', {
        duration: 3000,
        position: 'bottom-center',
        style: {
          background: theme === 'dark' ? '#ffffff' : '#000000',
          color: theme === 'dark' ? '#000000' : '#ffffff',
        },
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLegalInfo = () => {
    router.push('/legal')
    setIsSettingsOpen(false)
  }

  useEffect(() => {
    if (isSettingsOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isSettingsOpen])

  const getTitleAndBreadcrumbs = () => {
    const make = searchParams.get('make')
    const model = searchParams.get('model')
    const year = searchParams.get('year')
    const mainTopic = searchParams.get('mainTopic')
    const nestedTopic = searchParams.get('nestedTopic')

    let title = ''
    if (make && model && year) {
      title = `${make} ${model} (${year})`
    }
    let breadcrumbs: BreadcrumbItem[] = []

    if (make && model && year) {
      breadcrumbs = [
        { label: 'Vehicle Selection', href: '/vehicle-selection' },
        { label: title, href: `/main-topics?make=${make}&model=${model}&year=${year}` }
      ]

      if (mainTopic) {
        breadcrumbs.push({ label: mainTopic, href: `/nested-topics?make=${make}&model=${model}&year=${year}&mainTopic=${mainTopic}` })

        if (nestedTopic) {
          breadcrumbs.push({ label: nestedTopic, href: `/subtopics-menu?make=${make}&model=${model}&year=${year}&mainTopic=${mainTopic}&nestedTopic=${nestedTopic}` })
        }
      }
      const subtopic = searchParams.get('subtopic')
      if (subtopic) {
        breadcrumbs.push({ label: subtopic, href: `/subtopic-details?make=${make}&model=${model}&year=${year}&mainTopic=${mainTopic}&nestedTopic=${nestedTopic}&subtopic=${subtopic}` })
      }
    }

    return { title, breadcrumbs }
  }

  const { title, breadcrumbs } = getTitleAndBreadcrumbs()

  return (
    <div className="flex flex-col min-h-screen">
      <style jsx global>{`
        @keyframes glow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .glow-text {
          background: linear-gradient(90deg, #ff00ff, #00ffff, #ff00ff);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: glow 3s linear infinite;
        }
      `}</style>
      <header className={`sticky top-0 z-10 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'} shadow-md`}>
        <Toaster />
        <div className="p-4 flex items-center justify-between relative">
          <div className="flex items-center z-10">
            <Link href="/" className={`text-2xl font-bold ${theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'} transition-colors duration-300`}>
              Thec<span className="glow-text">AI</span>
            </Link>
          </div>
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {title && <h2 className="text-xl font-semibold">{title}</h2>}
          </div>
          <button
            id="settings-button"
            onClick={handleToggleSettings}
            className={`${theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'} transition-colors duration-300 relative z-30`}
            aria-label="Toggle settings"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="text-sm px-4 pb-2">
            <ol className="flex items-center space-x-2 overflow-x-auto whitespace-nowrap">
              {breadcrumbs.map((item, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-gray-600">{item.label}</span>
                  ) : (
                    <Link href={item.href} className={`${theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'} transition-colors duration-300`}>
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
      </header>
      <main className="flex-grow overflow-auto">
        {children}
      </main>
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-end"
            onClick={handleToggleSettings}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'} w-80 h-full p-6 shadow-lg overflow-y-auto flex flex-col`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Settings</h2>
                <button
                  onClick={handleToggleSettings}
                  className={`${theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'} transition-colors duration-300`}
                  aria-label="Close settings"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-grow">
                {activeSection === 'main' && (
                  <nav>
                    <motion.ul className="space-y-4">
                      <motion.li
                        variants={menuItemVariants}
                        initial="hidden"
                        animate="visible"
                        custom={0}
                      >
                        <button
                          id="theme-toggle"
                          onClick={toggleTheme}
                          className={`w-full ${theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'} py-3 px-4 rounded-lg hover:opacity-90 transition-all duration-300 text-lg font-semibold shadow-md flex items-center justify-center`}
                        >
                          {theme === 'dark' ? <Sun className="mr-2" /> : <Moon className="mr-2" />}
                          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        </button>
                      </motion.li>
                      <motion.li
                        variants={menuItemVariants}
                        initial="hidden"
                        animate="visible"
                        custom={1}
                      >
                        <button
                          id="my-vehicles-button"
                          onClick={handleMyVehicles}
                          className={`w-full ${theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'} py-3 px-4 rounded-lg hover:opacity-90 transition-all duration-300 text-lg font-semibold shadow-md`}
                        >
                          My Vehicles
                        </button>
                      </motion.li>
                      <motion.li
                        variants={menuItemVariants}
                        initial="hidden"
                        animate="visible"
                        custom={2}
                      >
                        <button
                          id="feedback-button"
                          onClick={() => setActiveSection('feedback')}
                          className={`w-full ${theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white border border-gray-200'} py-3 px-4 rounded-lg hover:opacity-90 transition-all duration-300 text-lg font-semibold shadow-md flex items-center justify-center`}
                        >
                          <MessageSquare className="mr-2" />
                          Leave Feedback
                        </button>
                      </motion.li>
                    </motion.ul>
                  </nav>
                )}
                {activeSection === 'myVehicles' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-4">
                      <button
                        onClick={() => setActiveSection('main')}
                        className={`${theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'} transition-colors  duration-300 flex items-center`}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Settings
                      </button>
                      {savedVehicles.map((vehicle, index) => (
                        <div key={index} className={`${theme === 'dark' ? 'bg-gray-800' :    'bg-gray-100'} rounded-lg shadow-md p-4`}>
                          <div className="flex justify-between items-center  mb-2">
                            <button
                              className="text-left flex-grow"
                              onClick={() => handleSelectVehicle(vehicle)}
                            >
                              <h3  className="text-lg font-semibold">{vehicle.make} {vehicle.model}</h3>
                              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{vehicle.year}</p>
                            </button>
                            <button
                              onClick={() => handleDeleteVehicle(index)}
                              className="text-red-500 hover:text-red-700"
                              aria-label="Delete vehicle"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        className={`w-full ${theme === 'dark' ?   'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} font-bold py-3 px-6 rounded-lg text-xl shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center`}
                        onClick={handleAddVehicle}
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Vehicle
                      </button>
                    </div>
                  </motion.div>
                )}
                {activeSection === 'feedback' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-4">
                      <button
                        onClick={() => setActiveSection('main')}
                        className={`${theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'} transition-colors duration-300 flex items-center`}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Settings
                      </button>
                      <h3 className="text-xl font-bold">Leave Feedback</h3>
                      <form onSubmit={handleFeedbackSubmit}>
                        <div className="mb-4">
                          <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Feedback Type</label>
                          <select
                            value={feedbackType}
                            onChange={(e) => setFeedbackType(e.target.value)}
                            className={`w-full ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'} border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} rounded-md p-2`}
                          >
                            <option value="issue">Report an Issue</option>
                            <option value="vehicle">Request a Vehicle</option>
                          </select>
                        </div>
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          className={`w-full ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'} border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} rounded-md p-2 mb-4`}
                          rows={4}
                          placeholder={feedbackType === 'issue' ? "Describe the issue you've encountered..." : "Describe the vehicle you'd like us to add..."}
                          required
                        />
                        <button
                          type="submit"
                          className={`w-full ${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} py-2 rounded-md transition-colors duration-300`}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}
              </div>
              <div className="mt-auto pt-4">
                <button
                  onClick={handleLegalInfo}
                  className={`w-full text-xs ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-300 flex items-center justify-center`}
                >
                  <FileText className="w-3 h-3 mr-1" />
                  Legal Information
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}