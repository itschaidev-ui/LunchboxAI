import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import AuthSessionProvider from '../components/SessionProvider'
import { NotificationProvider } from '../contexts/NotificationContext'
import { NotificationManager, NotificationIndicator } from '../components/NotificationManager'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'Lunchbox AI - Your Friendly Productivity Assistant',
  description: 'Make productivity as fun as packing your favorite lunchbox! Task management, study help, and motivation for teens and young creators.',
  keywords: ['productivity', 'task management', 'study help', 'AI assistant', 'teen productivity'],
  authors: [{ name: 'Lunchbox AI Team' }],
  openGraph: {
    title: 'Lunchbox AI - Your Friendly Productivity Assistant',
    description: 'Make productivity as fun as packing your favorite lunchbox!',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lunchbox AI - Your Friendly Productivity Assistant',
    description: 'Make productivity as fun as packing your favorite lunchbox!',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans bg-background-secondary min-h-screen">
        <AuthSessionProvider>
          <NotificationProvider>
            {children}
            <NotificationManager />
            <NotificationIndicator />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4CAF50',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#FF6B6B',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </NotificationProvider>
        </AuthSessionProvider>
      </body>
    </html>
  )
}
