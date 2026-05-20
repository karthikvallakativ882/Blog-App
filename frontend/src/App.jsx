import { useEffect } from 'react'
import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom'
import AdminDashboard from './components/AdminDashboard'
import AuthorDashboard from './components/AuthorDashboard'
import Login from './components/Login'
import Navbar from './components/Navbar'
import Register from './components/Register'
import UserDashboard from './components/UserDashboard'
import UserProfile from './components/UserProfile'
import Home from './pages/Home'
import { useAuthStore } from './store/userAuth'
import { getDashboardPath, getProfilePath } from './utils/appRoutes'

function AppLayout() {
  const currentUser = useAuthStore((state) => state.currentUser)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="page-shell">
      <div className="layout-shell">
        <Navbar
          currentUser={currentUser}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
        />

        <main className="content-stage">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function AuthLoadingScreen() {
  return (
    <div className="page-shell">
      <div className="layout-shell">
        <main className="content-stage">
          <section className="welcome-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">
              Restoring session
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-800">
              Checking your login...
            </h2>
          </section>
        </main>
      </div>
    </div>
  )
}

function HomeRoute() {
  const currentUser = useAuthStore((state) => state.currentUser)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated && currentUser) {
    return <Navigate to={getDashboardPath(currentUser.role)} replace />
  }

  return <Home />
}

function ProtectedRoute({ allowedRoles, children }) {
  const currentUser = useAuthStore((state) => state.currentUser)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles?.length && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to={getDashboardPath(currentUser.role)} replace />
  }

  return children
}

function PublicOnlyRoute({ children }) {
  const currentUser = useAuthStore((state) => state.currentUser)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated && currentUser) {
    return <Navigate to={getDashboardPath(currentUser.role)} replace />
  }

  return children
}

function RoleRedirect({ type }) {
  const currentUser = useAuthStore((state) => state.currentUser)

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  const targetPath =
    type === 'profile'
      ? getProfilePath(currentUser.role)
      : getDashboardPath(currentUser.role)

  return <Navigate to={targetPath} replace />
}

function App() {
  const authChecked = useAuthStore((state) => state.authChecked)
  const checkAuth = useAuthStore((state) => state.checkAuth)

  useEffect(() => {
    if (!authChecked) {
      void checkAuth()
    }
  }, [authChecked, checkAuth])

  if (!authChecked) {
    return <AuthLoadingScreen />
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomeRoute />} />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RoleRedirect type="dashboard" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <RoleRedirect type="profile" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/author/dashboard"
          element={
            <ProtectedRoute allowedRoles={['AUTHOR']}>
              <AuthorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/profile"
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/author/profile"
          element={
            <ProtectedRoute allowedRoles={['AUTHOR']}>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
