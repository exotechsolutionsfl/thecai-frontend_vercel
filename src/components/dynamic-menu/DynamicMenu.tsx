import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { MenuLevel } from '@/types/dynamic-content'

interface DynamicMenuProps {
  menuData: MenuLevel
  onSelect: (selection: string) => void
}

export default function DynamicMenu({ menuData, onSelect }: DynamicMenuProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {menuData.menu_items.map((item, index) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card>
              <CardContent className="p-4">
                <Button
                  variant="ghost"
                  className="w-full justify-between text-left h-auto py-3"
                  onClick={() => onSelect(item)}
                >
                  <span className="text-base font-semibold line-clamp-2">{item}</span>
                  <ChevronRight className="w-5 h-5 flex-shrink-0" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}