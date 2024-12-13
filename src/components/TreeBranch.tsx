import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderOpen, FolderClosed, File } from 'lucide-react'

interface TreeBranchProps {
  children: React.ReactNode
  level: number
  isLastChild: boolean
  isFolder: boolean
  isExpanded: boolean
  name: string
  onClick: () => void
  hasChildren: boolean
}

export const TreeBranch: React.FC<TreeBranchProps> = ({
  children,
  level,
  isLastChild,
  isFolder,
  isExpanded,
  name,
  onClick,
  hasChildren,
}) => {
  return (
    <div className="relative pl-5">
      <div className="relative mb-2">
        <div className="flex items-center">
          {/* Render connecting lines */}
          {level > 0 && (
            <div className="absolute left-0 top-0 bottom-0">
              <div
                className={`absolute left-0 top-0 w-px bg-border ${
                  isLastChild ? 'h-3' : 'h-full'
                }`}
              />
              <div className="absolute left-0 top-3 w-5 h-px bg-border" />
            </div>
          )}

          {/* Render folder/file icon and name */}
          <div
            className={`flex items-center cursor-pointer ${level > 0 ? 'pl-5' : ''}`}
            onClick={onClick}
          >
            {isFolder ? (
              <AnimatePresence mode="wait">
                {isExpanded ? (
                  <motion.div
                    key="open"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FolderOpen
                      className="h-4 w-4 mr-2 text-primary"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="closed"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FolderClosed
                      className="h-4 w-4 mr-2 text-muted-foreground"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              <File className="h-4 w-4 mr-2 text-muted-foreground" />
            )}
            <span className={isExpanded ? 'font-medium text-primary' : ''}>
              {name}
            </span>
          </div>
        </div>

        {/* Render children */}
        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

