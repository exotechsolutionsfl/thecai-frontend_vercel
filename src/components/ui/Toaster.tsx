"use client"

import { useToast } from "@/hooks/useToast"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import type * as React from "react"
import { cn } from "@/lib/utils"

export function Toaster() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}

interface ToastProps {
  toast: {
    id: number
    title: string
    description?: string
    variant?: "default" | "success" | "warning" | "destructive"
  }
  onClose: () => void
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const variantStyles = {
    default: "bg-background border-border",
    success: "bg-green-500 border-green-600 text-white",
    warning: "bg-yellow-500 border-yellow-600 text-white",
    destructive: "bg-red-500 border-red-600 text-white",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={cn("p-4 rounded-md shadow-lg max-w-sm border", variantStyles[toast.variant || "default"])}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{toast.title}</h3>
          {toast.description && <p className="text-sm mt-1">{toast.description}</p>}
        </div>
        <button
          onClick={onClose}
          className="text-current opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Close notification"
        >
          <X size={18} />
        </button>
      </div>
    </motion.div>
  )
}

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}