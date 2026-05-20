import axios from 'axios'

const envBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

function normalizeBaseUrl(value) {
  if (!value) {
    return import.meta.env.DEV ? 'http://localhost:4000' : ''
  }

  return value.replace(/\/+$/, '')
}

export const API_BASE_URL = normalizeBaseUrl(envBaseUrl)

export const createApiUrl = (path = '') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath
}

export const api = axios.create({
  baseURL: API_BASE_URL || undefined,
  withCredentials: true,
})

export function getApiErrorMessage(error, fallbackMessage = 'Request failed') {
  const responseMessage =
    error?.response?.data?.error || error?.response?.data?.message

  if (responseMessage) {
    return responseMessage
  }

  if (error?.message === 'Failed to fetch' || error?.code === 'ERR_NETWORK') {
    return 'Unable to reach the backend server. Make sure it is running and the API base URL/CORS settings are correct.'
  }

  return error?.message || fallbackMessage
}
