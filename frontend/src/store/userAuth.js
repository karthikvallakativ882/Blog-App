import toast from 'react-hot-toast'
import { create } from 'zustand'
import { api, getApiErrorMessage } from '../utils/api'

export const useAuthStore = create((set) => ({
  loading: false,
  error: null,
  isAuthenticated: false,
  currentUser: null,
  authChecked: false,

  checkAuth: async () => {
    try {
      set({ loading: true, error: null })

      const res = await api.get('/Common-api/check-auth')
      const user = res.data?.payload ?? null

      set({
        currentUser: user,
        isAuthenticated: Boolean(user),
        loading: false,
        error: null,
        authChecked: true,
      })

      return user
    } catch (err) {
      if (err.response?.status === 401) {
        set({
          currentUser: null,
          isAuthenticated: false,
          loading: false,
          error: null,
          authChecked: true,
        })
        return null
      }

      const message = getApiErrorMessage(err, 'Unable to restore login')

      console.error('Auth check failed:', err)

      set({
        currentUser: null,
        isAuthenticated: false,
        loading: false,
        error: message,
        authChecked: true,
      })

      return null
    }
  },

  login: async (userCred, expectedRole) => {
    try {
      set({ loading: true, error: null })

      const res = await api.post('/Common-api/login', userCred)
      const loggedInUser = res.data?.payload

      if (!loggedInUser) {
        throw new Error('Login response is missing user details')
      }

      if (expectedRole && loggedInUser.role !== expectedRole) {
        try {
          await api.get('/Common-api/logout')
        } catch {
          // Best effort only. The store still needs to reject the mismatched login.
        }

        throw new Error(
          `This account belongs to ${loggedInUser.role.toLowerCase()}, not ${expectedRole.toLowerCase()}`,
        )
      }

      set({
        loading: false,
        error: null,
        isAuthenticated: true,
        currentUser: loggedInUser,
        authChecked: true,
      })

      toast.success(`Welcome back, ${loggedInUser.firstName || 'user'}!`)

      return loggedInUser
    } catch (err) {
      const message = getApiErrorMessage(err, 'Login failed')

      set({
        loading: false,
        isAuthenticated: false,
        currentUser: null,
        error: message,
        authChecked: true,
      })

      toast.error(message)

      throw err
    }
  },

  logout: async () => {
    try {
      set({ loading: true, error: null })
      await api.get('/Common-api/logout')
      toast.success('Logged out successfully')
    } catch (err) {
      const message = getApiErrorMessage(err, 'Logout failed')

      set({ error: message })
      toast.error(message)
    } finally {
      set({
        loading: false,
        isAuthenticated: false,
        currentUser: null,
        authChecked: true,
      })
    }
  },

  clearError: () => set({ error: null }),
}))

export const userAuth = useAuthStore
