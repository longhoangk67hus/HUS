import React, { createContext, useState, useEffect, type ReactNode } from "react"
import { authAPI } from "../services/api"
import type { User } from "../types"

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  isLoading: boolean
  login: (userName: string, password: string) => Promise<void>
  logout: () => void
  signup: (userName: string, password: string, name: string, email?: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await authAPI.me()
        // Map server user (which includes userRoles relation) to frontend User shape
        const mappedUser: User = {
          userId: String((userData as any).userId ?? (userData as any).UserID ?? ''),
          userName: (userData as any).userName ?? (userData as any).UserName ?? '',
          fullName: (userData as any).fullName ?? (userData as any).FullName ?? '',
          email: (userData as any).email ?? (userData as any).Email ?? '',
          roles: Array.isArray((userData as any).userRoles)
            ? ((userData as any).userRoles as any[])
                .map((ur) => ur?.role?.roleCode)
                .filter(Boolean)
            : (Array.isArray((userData as any).roles) ? (userData as any).roles : []),
          phoneNumber: (userData as any).phoneNumber ?? (userData as any).PhoneNumber ?? null,
        }
        setUser(mappedUser)
        // persist the verified user for faster reloads
        try {
          localStorage.setItem('authUser', JSON.stringify(mappedUser))
        } catch (e) {
          // localStorage may not be available in some environments
          console.error('Failed to persist user:', e)
        }
      } catch (err) {
        console.error("Auth check failed:", err)
        setUser(null)
        localStorage.removeItem("authToken")
      } finally {
        setIsLoading(false)
      }
    }

    // Only check auth if token exists
    if (localStorage.getItem("authToken")) {
      checkAuth()
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (userName: string, password: string) => {
    const response = await authAPI.login(userName, password)
    setUser(response.user)
    try {
      localStorage.setItem('authUser', JSON.stringify(response.user))
    } catch (e) {
      // localStorage may not be available in some environments
      console.error('Failed to persist user:', e)
    }
  }

  const logout = () => {
    authAPI.logout()
    setUser(null)
    try {
      localStorage.removeItem('authUser')
    } catch (e) {
      // localStorage may not be available in some environments
      console.error('Failed to clear user:', e)
    }
  }

  const signup = async (userName: string, password: string, name: string, email?: string) => {
    // Register the user but do NOT keep them logged in automatically.
    // Many applications prefer users to confirm email or explicitly login after signup.
    await authAPI.register(userName, password, name, email)
    // Clear any auth token created by register so user is not auto-logged-in
    try {
      authAPI.logout()
    } catch (e) {
      // ignore
    }
    // Do not call setUser here; leave login to explicit user action
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, isLoading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext };

export type { AuthContextType };

export default AuthContext;
