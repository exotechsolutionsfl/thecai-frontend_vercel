import { Button } from "@/components/ui/Button"
import { type LucideIcon } from 'lucide-react'

interface QuickActionProps {
title: string
description: string
icon: LucideIcon
onClick: () => void
}

export default function QuickActionButton({ title, description, icon: Icon, onClick }: QuickActionProps) {
return (
  <Button 
    variant="outline" 
    className="w-full justify-start h-auto py-4 px-4 group hover:bg-accent/50"
    onClick={onClick}
  >
    <div className="flex items-start">
      <Icon className="h-5 w-5 mr-4 mt-0.5 flex-shrink-0 group-hover:text-primary transition-colors" />
      <div className="text-left">
        <div className="font-medium">{title}</div>
        <div className="text-sm text-muted-foreground mt-1">
          {description}
        </div>
      </div>
    </div>
  </Button>
)
}