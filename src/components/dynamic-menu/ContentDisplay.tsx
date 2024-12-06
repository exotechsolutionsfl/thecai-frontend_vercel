import { motion } from 'framer-motion';
import Image from 'next/image';
import { MenuItem } from '@/types/dynamic-menu';
import { Card, CardContent } from '@/components/ui/Card';

interface ContentDisplayProps {
  item: MenuItem;
}

export function ContentDisplay({ item }: ContentDisplayProps) {
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
          <div className="mb-4">
            <p>{item.content.text}</p>
            {item.content.images?.map((image, index) => (
              <div key={index} className="relative w-full h-64 my-4">
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}