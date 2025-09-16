'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.'
      case 'AccessDenied':
        return 'Access denied. You do not have permission to sign in.'
      case 'Verification':
        return 'The verification token has expired or has already been used.'
      case 'Default':
        return 'An error occurred during authentication.'
      default:
        return 'An unexpected error occurred. Please try again.'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Authentication Error</h1>
          <p className="text-gray-600">{getErrorMessage(error)}</p>
        </div>

        <div className="space-y-4">
          <Link
            href="/auth/signin"
            className="w-full bg-lunchbox-primary hover:bg-lunchbox-secondary text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 hover-lift"
          >
            <span>Try Again</span>
          </Link>

          <Link
            href="/"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3"
          >
            <span>Go Home</span>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Still having trouble? Contact support in our{' '}
            <a href="#" className="text-lunchbox-primary hover:underline">
              Discord server
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
