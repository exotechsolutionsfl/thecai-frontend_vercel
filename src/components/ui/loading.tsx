"use client"

import React from "react"
import { useTheme } from "@/context/ThemeProvider"
import { cn } from "@/lib/utils"

interface LoadingProps {
  message?: string | null
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function Loading({ message, size = "md", className }: LoadingProps) {
  const { theme } = useTheme()

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        theme === "dark" ? "text-white" : "text-black",
        className,
      )}
    >
      <div className={cn("relative", sizeClasses[size])}>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-primary rounded-full animate-spin border-t-transparent"></div>
      </div>
      {message && <p className="mt-4 text-sm font-medium">{message}</p>}
    </div>
  )
}