import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@context/ThemeProvider'
import { VehicleProvider } from '@context/VehicleContext'
import Script from 'next/script'
import Vessel from '@components/Vessel'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ThecAI',
  description: 'Your personal car knowledge base',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script id="theme-script" strategy="beforeInteractive">
          {`
            (function() {
              var storedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
              document.documentElement.classList.add(storedTheme);
            })();
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <VehicleProvider>
            <Vessel>
              {children}
            </Vessel>
          </VehicleProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}