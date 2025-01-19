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
}

export function SelectDropdown({ label, options, value, onChange, loading, disabled }: SelectDropdownProps) {
  return (
    <div className="space-y-2 relative">
      <Label htmlFor={label}>{label}</Label>
      <div className="relative">
        <Select value={value} onValueChange={onChange} disabled={disabled || loading || options.length === 0}>
          <SelectTrigger id={label} className={loading ? 'opacity-50' : ''}>
            <SelectValue placeholder={`Select ${label}`} />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] overflow-y-auto">
            {options.length > 0 ? (
              options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="_empty" disabled>
                No {label} available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}
      </div>
    </div>
  )
}

