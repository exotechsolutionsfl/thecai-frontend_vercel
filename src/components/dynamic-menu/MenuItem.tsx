import { motion } from 'framer-motion';
import { ChevronRight, ChevronDown, FileText, Loader2 } from 'lucide-react';
import { MenuItem as MenuItemType } from '@/types/dynamic-menu';
import { Button } from '@/components/ui/Button';

interface MenuItemProps {
  item: MenuItemType;
  onExpand: (item: MenuItemType) => void;
}

export function MenuItem({ item, onExpand }: MenuItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Button
        variant="ghost"
        className="w-full justify-between text-left px-4 py-2 hover:bg-accent/50"
        onClick={() => onExpand(item)}
      >
        <span className="flex items-center gap-2">
          {item.type === 'content' ? (
            <FileText className="h-4 w-4" />
          ) : item.isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          {item.name.replace(/_/g, ' ')}
        </span>
        {item.isLoading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
      </Button>
    </motion.div>
  );
}