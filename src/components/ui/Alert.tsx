import React from 'react'
import { cn } from "@/lib/utils"

interface AlertProps {
  children: React.ReactNode
  variant?: 'default' | 'destructive'
  className?: string
}

const Alert: React.FC<AlertProps> = ({ children, variant = 'default', className = '' }) => {
  const baseStyle = 'p-4 rounded-md'
  const variantStyle = variant === 'destructive' ? 'bg-red-100 text-red-900' : 'bg-blue-100 text-blue-900'
  
  return (
    <div className={cn(baseStyle, variantStyle, className)} role="alert">
      {children}
    </div>
  )
}

interface AlertDescriptionProps {
  children: React.ReactNode
  className?: string
}

const AlertDescription: React.FC<AlertDescriptionProps> = ({ children, className = '' }) => {
  return (
    <p className={cn("text-sm [&_p]:leading-relaxed", className)}>
      {children}
    </p>
  )
}

export { Alert, AlertDescription }