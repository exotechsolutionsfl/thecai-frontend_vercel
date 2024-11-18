'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@context/ThemeProvider'

interface DisclaimerProps {
  onAccept: () => void
}

const Disclaimer: React.FC<DisclaimerProps> = ({ onAccept }) => {
  const { theme } = useTheme()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'} p-6 rounded-lg shadow-xl max-w-md w-full`}
      >
        <h2 className="text-2xl font-bold mb-4">Disclaimer</h2>
        <p className="mb-4">
          ThecAI provides information derived from vehicle manuals and other sources for educational and reference purposes only. It is not intended to replace professional mechanical advice, diagnosis, or official vehicle documentation. Always consult a certified mechanic or refer to your vehicle&apos;s official manual for specific repair and maintenance instructions.
        </p>
        <p className="mb-4">
          By using ThecAI, you acknowledge that the app and its creators are not liable for any errors, omissions, or outcomes that may result from the use of the information provided. Users assume full responsibility and all risks associated with repairs, modifications, or maintenance actions based on the app&apos;s content. Always exercise caution and use professional assistance when needed.
        </p>
        <button
          onClick={onAccept}
          className={`w-full ${
            theme === 'dark'
              ? 'bg-white text-black hover:bg-gray-200'
              : 'bg-black text-white hover:bg-gray-800'
          } font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300`}
        >
          I Understand and Accept
        </button>
      </motion.div>
    </motion.div>
  )
}

export default Disclaimer