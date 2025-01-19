'use client'

import { useToast } from '@/hooks/useToast'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

export function ToasterProvider() {
  const { toasts } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className={`p-4 rounded-md shadow-lg max-w-sm ${
              toast.variant === 'success'
                ? 'bg-green-500'
                : toast.variant === 'warning'
                ? 'bg-yellow-500'
                : toast.variant === 'destructive'
                ? 'bg-red-500'
                : 'bg-gray-800'
            } text-white`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{toast.title}</h3>
                {toast.description && <p className="text-sm mt-1">{toast.description}</p>}
              </div>
              <button className="text-white/80 hover:text-white">
                <X size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export { ToasterProvider as default };