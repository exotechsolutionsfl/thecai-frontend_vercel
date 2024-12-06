'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </motion.div>
    </div>
  );
}