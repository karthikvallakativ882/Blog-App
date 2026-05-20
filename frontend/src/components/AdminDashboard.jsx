import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../store/userAuth'
import { getProfilePath } from '../utils/appRoutes'

function AdminDashboard() {
  const currentUser = useAuthStore((state) => state.currentUser)
  const profilePath = getProfilePath(currentUser?.role)

  return (
    <section className="placeholder-card">
      <h2 className="text-2xl font-semibold text-slate-800">Admin Dashboard</h2>
      <p className="mt-4 text-slate-600">
        The admin area now has its own dashboard route and a dedicated profile
        route as well.
      </p>
      <NavLink to={profilePath} className="primary-button mt-6 inline-flex">
        Open profile
      </NavLink>
    </section>
  )
}

export default AdminDashboard
