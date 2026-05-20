import { NavLink } from 'react-router-dom'
import { getDashboardPath, getProfilePath } from '../utils/appRoutes'

function Navbar({ currentUser, isAuthenticated, onLogout }) {
  const profilePath = getProfilePath(currentUser?.role)
  const displayName =
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') ||
    currentUser?.email ||
    'Profile'
  const profileInitial = displayName.charAt(0).toUpperCase()

  const links = isAuthenticated
    ? [
        { label: 'Home', to: '/' },
        { label: 'Dashboard', to: getDashboardPath(currentUser?.role) },
        { label: 'Profile', to: profilePath },
      ]
    : [
        { label: 'Home', to: '/' },
        { label: 'Register', to: '/register' },
        { label: 'Login', to: '/login' },
      ]

  return (
    <header className="nav-shell">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="px-2 text-xl font-bold text-slate-800">Blog Platform</h1>

        <nav className="flex flex-wrap items-center gap-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `nav-button ${isActive ? 'nav-button-active' : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}

          {isAuthenticated ? (
            <>
              <NavLink
                to={profilePath}
                title={displayName}
                aria-label={`${displayName} profile`}
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/70 bg-white text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:scale-[1.02] hover:border-sky-200"
              >
                {currentUser?.profileImageUrl ? (
                  <img
                    src={currentUser.profileImageUrl}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{profileInitial}</span>
                )}
              </NavLink>
              <button type="button" onClick={onLogout} className="nav-button">
                Logout
              </button>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
