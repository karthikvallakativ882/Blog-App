export const dashboardPathByRole = {
  USER: '/user/dashboard',
  AUTHOR: '/author/dashboard',
  ADMIN: '/admin/dashboard',
}

export const profilePathByRole = {
  USER: '/user/profile',
  AUTHOR: '/author/profile',
  ADMIN: '/admin/profile',
}

export function getDashboardPath(role) {
  return dashboardPathByRole[role] ?? '/'
}

export function getProfilePath(role) {
  return profilePathByRole[role] ?? '/'
}
