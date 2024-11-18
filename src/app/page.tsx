'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Plus, FileSearch, Settings, ChevronRight, Bot } from 'lucide-react'
import { useSavedVehicles } from '@context/VehicleContext'
import { useTheme } from '@context/ThemeProvider'
import { Tutorial } from '@components/Tutorial'
import Disclaimer from '@components/Disclaimer'
import Loading from '@components/loading'
import { Lights } from '@components/Lights'

interface SavedVehicle {
  make: string
  model: string
  year: string
}

export default function MainMenu() {
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { savedVehicles } = useSavedVehicles()
  const router = useRouter()
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0)
  const { theme } = useTheme()

  const safeSetState = useCallback((callback: () => void) => {
    if (isMounted) {
      callback()
    }
  }, [isMounted])

  useEffect(() => {
    setIsMounted(true)
    const hasSeenDisclaimer = localStorage.getItem('hasSeenDisclaimer')
    if (!hasSeenDisclaimer) {
      safeSetState(() => setShowDisclaimer(true))
    } else {
      const hasSeenTutorial = localStorage.getItem('tutorial_main-menu')
      if (!hasSeenTutorial) {
        safeSetState(() => setShowTutorial(true))
      }
    }
    setIsLoading(false)
    return () => {
      setIsMounted(false)
    }
  }, [safeSetState])

  const handleGetStarted = useCallback(() => {
    router.push('/vehicle-selection')
  }, [router])

  const handleSelectVehicle = useCallback((vehicle: SavedVehicle) => {
    router.push(`/main-topics?make=${encodeURIComponent(vehicle.make)}&model=${encodeURIComponent(vehicle.model)}&year=${encodeURIComponent(vehicle.year)}`)
  }, [router])

  const handleAcceptDisclaimer = useCallback(() => {
    localStorage.setItem('hasSeenDisclaimer', 'true')
    safeSetState(() => {
      setShowDisclaimer(false)
      setShowTutorial(true)
    })
  }, [safeSetState])

  const handleCompleteTutorial = useCallback(() => {
    safeSetState(() => setShowTutorial(false))
  }, [safeSetState])

  const handleNextTutorialStep = useCallback(() => {
    setCurrentTutorialStep((prev) => prev + 1)
  }, [])

  const handleAITroubleshooter = useCallback(() => {
    router.push('/ai-troubleshooter')
  }, [router])

  const tutorialSteps = [
    {
      title: "Welcome to ThecAI",
      content: "Your comprehensive car knowledge hub. Explore all the information you need about your vehicle, troubleshoot issues, and learn how to remove or install parts!",
      targetId: "thecai-logo",
    },
    {
      title: "Search Knowledge Base",
      content: "Click here to access troubleshooting guides, vehicle information, and maintenance instructions.",
      targetId: "get-started-button",
    },
    {
      title: "Explore Side Menu",
      content: "Use the side menu to access settings, switch themes, manage your vehicles, and provide feedback.",
      targetId: "settings-button",
    },
  ]

  const VehicleItem = ({ vehicle, onSelect }: { vehicle: SavedVehicle; onSelect: () => void }) => (
    <motion.button
      className={`w-full ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
          : 'bg-white border-gray-200 hover:border-gray-400'
      } border rounded-lg p-4 flex justify-between items-center mb-2 last:mb-0 cursor-pointer transition-all duration-300`}
      onClick={onSelect}
      whileHover={{ scale: 1.02, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="text-left">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
          {vehicle.make} {vehicle.model}
        </h3>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{vehicle.year}</p>
      </div>
      <ChevronRight className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
    </motion.button>
  )

  const SpinningGear = () => (
    <motion.div
      className="absolute right-0 top-1/2 -translate-y-1/2 z-0"
      style={{ right: '-0.5em' }}
      animate={{
        rotate: 360,
        transition: {
          duration: 10,
          ease: [0.43, 0.13, 0.23, 0.96],
          repeat: Infinity,
          repeatType: 'loop',
        },
      }}
    >
      <Settings className={`w-16 h-16 ${theme === 'dark' ? 'text-gray-700' : 'text-gray-300'}`} aria-hidden="true" />
    </motion.div>
  )

  if (isLoading) {
    return <Loading message={null} />
  }

  return (
    <div className={`fixed inset-0 flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'} font-sans overflow-hidden`}>
      <Lights className="absolute inset-0 z-0" />
      <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-grid-white/[0.03]' : 'bg-grid-black/[0.03]'} bg-[size:20px_20px] pointer-events-none z-10`} />
      <main className="flex-grow flex flex-col items-center justify-center p-2 sm:p-4 relative z-20 overflow-hidden">
        <div className="w-full max-w-md flex flex-col items-center justify-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center relative"
          >
            <div className="relative inline-block">
              <div id="thecai-logo" className="mb-4 relative z-10">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold relative z-20">
                  Thec<span className="relative">
                    <SpinningGear />
                    <span className="relative z-10 glow-text">AI</span>
                  </span>
                </h1>
              </div>
            </div>
            <p className={`text-xl sm:text-2xl md:text-3xl ${theme === 'dark' ? 'text-white' : 'text-black'} font-light mb-4 relative z-10 whitespace-nowrap`}>
              Your Centralized Car knowledge Hub
            </p>
          </motion.div>
          
          {savedVehicles.length > 0 ? (
            <>
              <motion.div
                id="my-vehicles-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`w-full max-w-md mt-4 ${theme === 'dark' ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-200'} border rounded-2xl shadow-lg p-4 relative z-10 overflow-y-auto max-h-[40vh]`}
              >
                <h2 className={`text-xl sm:text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'} mb-4`}>
                  My Vehicles
                </h2>
                {savedVehicles.map((vehicle) => (
                  <VehicleItem
                    key={`${vehicle.make}-${vehicle.model}-${vehicle.year}`}
                    vehicle={vehicle}
                    onSelect={() => handleSelectVehicle(vehicle)}
                  />
                ))}
              </motion.div>
              <motion.button
                id="add-new-vehicle-button"
                className={`w-full ${
                  theme === 'dark' 
                    ? 'bg-white text-black hover:bg-gray-200' 
                    : 'bg-black hover:bg-gray-800 text-white'
                } font-bold py-4 sm:py-5 px-5 rounded-lg text-lg sm:text-xl shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center relative z-10 mt-4`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
              >
                <Plus className="w-5 h-5 sm:w-6 sm:h-6 mr-2" aria-hidden="true" />
                Add New Vehicle
              </motion.button>
            </>
          ) : (
            <motion.button
              id="get-started-button"
              className={`w-full ${
                theme === 'dark' 
                  ? 'bg-white text-black hover:bg-gray-200' 
                  : 'bg-black hover:bg-gray-800 text-white'
              } font-bold py-4 sm:py-5 px-5 rounded-lg text-lg sm:text-xl shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center relative z-10`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
            >
              <FileSearch className="w-5 h-5 sm:w-6 sm:h-6 mr-2" aria-hidden="true" />
              Search knowledge base
            </motion.button>
          )}
          
          <motion.button
            id="ai-troubleshooter-button"
            className={`w-full ${
              theme === 'dark' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } font-bold py-4 sm:py-5 px-5 rounded-lg text-lg sm:text-xl shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center relative z-10 mt-4`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAITroubleshooter}
          >
            <Bot className="w-5 h-5 sm:w-6 sm:h-6 mr-2" aria-hidden="true" />
            AI Troubleshooter
          </motion.button>
        </div>
      </main>

      <style jsx global>{`
        @keyframes glow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
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

      <AnimatePresence>
        {showDisclaimer && <Disclaimer onAccept={handleAcceptDisclaimer} />}
      </AnimatePresence>

      {showTutorial && (
        <Tutorial
          steps={tutorialSteps}
          pageName="main-menu"
          onComplete={handleCompleteTutorial}
          currentStep={currentTutorialStep}
          onNextStep={handleNextTutorialStep}
        />
      )}
    </div>
  )
}