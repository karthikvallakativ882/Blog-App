import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../store/userAuth'
import { getDashboardPath } from '../utils/appRoutes'

function formatRole(role) {
  if (!role) {
    return 'Member'
  }

  return `${role.charAt(0)}${role.slice(1).toLowerCase()}`
}

function formatJoinedDate(value) {
  if (!value) {
    return 'Recently joined'
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

function UserProfile() {
  const currentUser = useAuthStore((state) => state.currentUser)
  const dashboardPath = getDashboardPath(currentUser?.role)
  const fullName =
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') ||
    currentUser?.email ||
    'Member'
  const initials = fullName.charAt(0).toUpperCase()

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,1fr)]">
      <div className="rounded-[32px] border border-slate-200 bg-white/90 p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">
          Profile page
        </p>

        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
          {currentUser?.profileImageUrl ? (
            <img
              src={currentUser.profileImageUrl}
              alt={fullName}
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-sky-100 text-3xl font-semibold text-sky-700">
              {initials}
            </div>
          )}

          <div>
            <h2 className="text-3xl font-semibold text-slate-800">{fullName}</h2>
            <p className="mt-2 text-base text-slate-600">{currentUser?.email}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                {formatRole(currentUser?.role)}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                Active account
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">First name</p>
            <p className="mt-2 text-lg font-semibold text-slate-800">
              {currentUser?.firstName || 'Not added'}
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">Last name</p>
            <p className="mt-2 text-lg font-semibold text-slate-800">
              {currentUser?.lastName || 'Not added'}
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">Joined</p>
            <p className="mt-2 text-lg font-semibold text-slate-800">
              {formatJoinedDate(currentUser?.createdAt)}
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">Account role</p>
            <p className="mt-2 text-lg font-semibold text-slate-800">
              {formatRole(currentUser?.role)}
            </p>
          </div>
        </div>
      </div>

      <aside className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">
          Quick access
        </p>
        <h3 className="mt-4 text-2xl font-semibold text-slate-800">
          Return to your dashboard anytime.
        </h3>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          The dashboard keeps your daily workflow, while this page stays focused
          on account information.
        </p>

        <NavLink to={dashboardPath} className="primary-button mt-6 inline-flex">
          Back to dashboard
        </NavLink>
      </aside>
    </section>
  )
}

export default UserProfile
