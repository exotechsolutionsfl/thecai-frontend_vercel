import React from 'react'

interface AlertProps {
  children: React.ReactNode
  variant?: 'default' | 'destructive'
  className?: string
}

export const Alert: React.FC<AlertProps> = ({ children, variant = 'default', className = '' }) => {
  const baseStyle = 'p-4 rounded-md'
  const variantStyle = variant === 'destructive' ? 'bg-red-100 text-red-900' : 'bg-blue-100 text-blue-900'
  
  return (
    <div className={`${baseStyle} ${variantStyle} ${className}`} role="alert">
      {children}
    </div>
  )
}