// Electron-compatible authentication utilities
// This will be used when we build the Electron app

export class ElectronAuth {
  constructor() {
    this.isElectron = typeof window !== 'undefined' && window.process && window.process.type === 'renderer'
  }

  // Get authentication token for Electron app
  async getAuthToken() {
    if (this.isElectron) {
      // In Electron, we'll use IPC to communicate with main process
      return await window.electronAPI?.getAuthToken()
    } else {
      // In web app, use NextAuth session
      const { getSession } = await import('next-auth/react')
      const session = await getSession()
      return session?.accessToken
    }
  }

  // Get user info for Electron app
  async getUserInfo() {
    if (this.isElectron) {
      return await window.electronAPI?.getUserInfo()
    } else {
      const { getSession } = await import('next-auth/react')
      const session = await getSession()
      return session?.user
    }
  }

  // Sign out from Electron app
  async signOut() {
    if (this.isElectron) {
      await window.electronAPI?.signOut()
    } else {
      const { signOut } = await import('next-auth/react')
      await signOut({ callbackUrl: '/' })
    }
  }

  // Check if user is authenticated
  async isAuthenticated() {
    const token = await this.getAuthToken()
    return !!token
  }

  // Make authenticated API calls
  async authenticatedFetch(url, options = {}) {
    const token = await this.getAuthToken()
    
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
  }
}

// Export singleton instance
export const electronAuth = new ElectronAuth()
