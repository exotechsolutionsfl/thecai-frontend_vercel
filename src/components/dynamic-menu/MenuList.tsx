import { motion, AnimatePresence } from 'framer-motion';
import { MenuItem as MenuItemType, MenuState } from '@/types/dynamic-menu';
import { MenuItem } from './MenuItem';
import { MenuContent } from './MenuContent';

interface MenuListProps {
  items: MenuItemType[];
  onExpand: (item: MenuItemType) => void;
  menuState: MenuState;
}

export function MenuList({ items, onExpand, menuState }: MenuListProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-2"
      >
        {items.map((item) => (
          <div key={item.id}>
            <MenuItem item={item} onExpand={onExpand} />
            {item.type === 'content' && <MenuContent item={item} />}
            {item.isExpanded && item.type === 'menu' && menuState[item.id] && (
              <div className="pl-6 mt-2">
                <MenuList 
                  items={menuState[item.id]} 
                  onExpand={onExpand}
                  menuState={menuState}
                />
              </div>
            )}
          </div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}