import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  logout: () => void
  isAdmin: () => boolean
  isAuthor: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('token', token)
        set({ user, token })
      },
      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null })
      },
      isAdmin: () => get().user?.role === 'admin',
      isAuthor: () =>
        get().user?.role === 'admin' || get().user?.role === 'author',
    }),
    { name: 'qoldau-auth', partialize: (s) => ({ user: s.user, token: s.token }) }
  )
)
