import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, FileText } from 'lucide-react';
import { MenuItem } from '@/types/dynamic-menu';
import { Button } from '@/components/ui/Button';

interface MenuListProps {
  items: MenuItem[];
  path: string;
  onItemClick: (path: string, item: MenuItem) => void;
  isLoading?: boolean;
}

export default function MenuList({ items, path, onItemClick, isLoading }: MenuListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-2"
      >
        {items.map((item) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
          >
            <Button
              variant="ghost"
              className="w-full justify-between text-left px-4 py-2 hover:bg-accent/50"
              onClick={() => onItemClick(path, item)}
            >
              <span className="flex items-center gap-2">
                {item.type === 'chunk_text' ? (
                  <FileText className="h-4 w-4" />
                ) : item.isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                {item.name}
              </span>
            </Button>
            
            {item.isExpanded && item.children && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pl-6 mt-2"
              >
                <MenuList
                  items={item.children}
                  path={`${path}/${item.name}`}
                  onItemClick={onItemClick}
                />
              </motion.div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}