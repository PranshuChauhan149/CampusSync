import React, { createContext, useState, useContext, useEffect } from 'react'
import { adminAuth } from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check if admin is already logged in
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await adminAuth.getMe()
        setUser(response.data.admin)
        setIsAuthenticated(true)
        setError(null)
      } catch (err) {
        setUser(null)
        setIsAuthenticated(false)
        console.log('Not authenticated')
      } finally {
        setLoading(false)
      }
    }

    verifyAuth()
  }, [])

  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminAuth.login(email, password)
      setUser(response.data.admin)
      setIsAuthenticated(true)
      return response.data
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed'
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await adminAuth.logout()
      setUser(null)
      setIsAuthenticated(false)
      setError(null)
      localStorage.removeItem('adminToken')
    } catch (err) {
      console.error('Logout error:', err)
      // Still clear local state even if API call fails
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem('adminToken')
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
