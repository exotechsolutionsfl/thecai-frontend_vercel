import { motion } from 'framer-motion';
import { MenuItem } from '@/types/dynamic-menu';
import { Card, CardContent } from '@/components/ui/Card';

interface ContentDisplayProps {
  item: MenuItem;
}

export default function ContentDisplay({ item }: ContentDisplayProps) {
  if (!item.content) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >
      <Card>
        <CardContent className="prose dark:prose-invert max-w-none p-6">
          <div dangerouslySetInnerHTML={{ __html: item.content }} />
        </CardContent>
      </Card>
    </motion.div>
  );
}