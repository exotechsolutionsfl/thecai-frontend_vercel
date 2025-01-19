import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Label } from "@/components/ui/label"
import { Loader2 } from 'lucide-react'

interface SelectDropdownProps {
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
  loading: boolean
  disabled?: boolean
  error?: string
}

export function SelectDropdown({ 
  label, 
  options, 
  value, 
  onChange, 
  loading, 
  disabled, 
  error 
}: SelectDropdownProps) {
  const id = React.useId()

  return (
    <div className="space-y-2 relative">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Select 
          value={value} 
          onValueChange={onChange} 
          disabled={disabled || loading || options.length === 0}
        >
          <SelectTrigger 
            id={id} 
            className={`${loading ? 'opacity-50' : ''} ${error ? 'border-red-500' : ''}`}
          >
            <SelectValue placeholder={`Select ${label}`} />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] overflow-y-auto">
            {options.length > 0 ? (
              options.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))
            ) : (
              <SelectItem value="_empty" disabled>
                No {label.toLowerCase()} available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500" role="alert">{error}</p>
      )}
    </div>
  )
}