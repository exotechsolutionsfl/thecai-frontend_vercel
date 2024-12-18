import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@context/ThemeProvider'
import { VehicleProvider } from '@context/VehicleContext'
import Script from 'next/script'
import Vessel from '@components/Vessel'
import { metadata } from './metadata'

const inter = Inter({ subsets: ['latin'] })

export { metadata }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning>
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
      <body className={`${inter.className} min-h-screen`}>
        <ThemeProvider>
          <VehicleProvider>
            <Vessel>
              <div className="pt-16">
                {children}
              </div>
            </Vessel>
          </VehicleProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}