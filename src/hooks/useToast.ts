"use client"

import { useState, useCallback } from "react"

type ToastVariant = "default" | "success" | "warning" | "destructive"

interface Toast {
  id: number
  title: string
  description?: string
  variant?: ToastVariant
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(({ title, description, variant = "default" }: Omit<Toast, "id">) => {
    const id = Date.now()
    const newToast: Toast = { id, title, description, variant }
    setToasts((prevToasts) => [...prevToasts, newToast])

    // Automatically remove the toast after 5 seconds
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id))
  }, [])

  return { toast, toasts, removeToast }
}