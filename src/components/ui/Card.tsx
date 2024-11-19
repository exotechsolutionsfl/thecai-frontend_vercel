import React from 'react'
import { cn } from "@/lib/utils"

interface CardProps {
  children: React.ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={cn("bg-card text-card-foreground shadow-md rounded-lg", className)}>
      {children}
    </div>
  )
}

export const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={cn("px-4 py-5 border-b", className)}>
      {children}
    </div>
  )
}

export const CardContent: React.FC<CardProps> = ({ children, className = '' }) => {
  return <div className={cn("p-4", className)}>{children}</div>
}

export const CardFooter: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={cn("px-4 py-4 border-t", className)}>
      {children}
    </div>
  )
}