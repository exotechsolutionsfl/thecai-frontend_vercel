import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useTheme } from '@context/ThemeProvider'

interface BreadcrumbProps {
  items: {
    label: string
    href: string
  }[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const { theme } = useTheme()

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {items.map((item, index) => (
          <li key={item.href} className="inline-flex items-center">
            {index > 0 && (
              <ChevronRight className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
            )}
            <Link
              href={item.href}
              className={`inline-flex items-center ${
                index === items.length - 1
                  ? theme === 'dark'
                    ? 'text-gray-400'
                    : 'text-gray-700'
                  : theme === 'dark'
                  ? 'text-blue-400 hover:text-blue-300'
                  : 'text-blue-600 hover:text-blue-800'
              } ${index > 0 ? 'ml-1 md:ml-2' : ''} text-sm font-medium`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
}