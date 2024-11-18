interface ChunkText {
  page_number: number;
  text: string;
  [key: string]: string | number;
}

import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import { useTheme } from '@context/ThemeProvider'

interface PageTabsProps {
  debouncedSearchTerm: string;
  tabStart: number;
  visibleTabs: number[];
  activePage: number;
  totalTabs: number;
  maxVisibleTabs: number;
  warningKeywords: string[];
  filteredChunks: ChunkText[];
  handleTabClick: (pageNumber: number) => void;
}

export default function PageTabs({
  debouncedSearchTerm,
  tabStart,
  visibleTabs,
  activePage,
  totalTabs,
  maxVisibleTabs,
  warningKeywords,
  filteredChunks,
  handleTabClick
}: PageTabsProps) {
  const { theme } = useTheme()

  return (
    <div className="flex flex-wrap items-center justify-center space-x-2 mb-4 overflow-x-auto">
      {debouncedSearchTerm && (
        <span className={`mr-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Found in:
        </span>
      )}
      {tabStart > 0 && (
        <button
          onClick={() => handleTabClick(tabStart)}
          className={`px-2 py-1 ${
            theme === 'dark'
              ? 'bg-gray-800 text-white hover:bg-gray-700'
              : 'bg-white text-black hover:bg-gray-200'
          } rounded-md transition-colors duration-300`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
      {tabStart > 0 && (
        <button
          onClick={() => handleTabClick(1)}
          className={`px-3 py-1 rounded-md transition-colors duration-300 ${
            activePage === 1
              ? theme === 'dark'
                ? 'bg-white text-black'
                : 'bg-black text-white'
              : theme === 'dark'
              ? 'bg-gray-800 text-white hover:bg-gray-700'
              : 'bg-white text-black hover:bg-gray-200'
          }`}
        >
          1
        </button>
      )}
      {tabStart > 1 && <span className={theme === 'dark' ? 'text-white' : 'text-black'}>...</span>}
      {visibleTabs.map(pageNumber => (
        <button
          key={pageNumber}
          onClick={() => handleTabClick(pageNumber)}
          className={`px-3 py-1 rounded-md transition-colors duration-300 ${
            activePage === pageNumber
              ? theme === 'dark'
                ? 'bg-white text-black'
                : 'bg-black text-white'
              : theme === 'dark'
              ? 'bg-gray-800 text-white hover:bg-gray-700'
              : 'bg-white text-black hover:bg-gray-200'
          }`}
        >
          {pageNumber}
          {warningKeywords.some(keyword =>
            filteredChunks
              .find(chunk => chunk.page_number === pageNumber)
              ?.text.toLowerCase()
              .includes(keyword.toLowerCase())
          ) && <AlertTriangle className="inline-block ml-1 w-3 h-3" />}
        </button>
      ))}
      {tabStart + maxVisibleTabs < totalTabs - 1 && (
        <span className={theme === 'dark' ? 'text-white' : 'text-black'}>...</span>
      )}
      {tabStart + maxVisibleTabs < totalTabs && (
        <button
          onClick={() => handleTabClick(totalTabs)}
          className={`px-3 py-1 rounded-md transition-colors duration-300 ${
            activePage === totalTabs
              ? theme === 'dark'
                ? 'bg-white text-black'
                : 'bg-black text-white'
              : theme === 'dark'
              ? 'bg-gray-800 text-white hover:bg-gray-700'
              : 'bg-white text-black hover:bg-gray-200'
          }`}
        >
          {totalTabs}
        </button>
      )}
      {tabStart + maxVisibleTabs < totalTabs && (
        <button
          onClick={() => handleTabClick(tabStart + maxVisibleTabs + 1)}
          className={`px-2 py-1 ${
            theme === 'dark'
              ? 'bg-gray-800 text-white hover:bg-gray-700'
              : 'bg-white text-black hover:bg-gray-200'
          } rounded-md transition-colors duration-300`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}