import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '16px',
            background: '#0f172a',
            color: '#f8fafc',
          },
          success: {
            style: {
              background: '#0369a1',
              color: '#f8fafc',
            },
          },
          error: {
            style: {
              background: '#b91c1c',
              color: '#fef2f2',
            },
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>,
)
