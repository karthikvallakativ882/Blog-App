import ArticleFeed from './ArticleFeed'
import { useAuthStore } from '../store/userAuth'

function UserDashboard() {
  const currentUser = useAuthStore((state) => state.currentUser)
  const firstName = currentUser?.firstName || 'reader'

  return (
    <div className="space-y-10">
      <section className="dashboard-hero">
        <p className="dashboard-hero-kicker">User dashboard</p>
        <h2 className="dashboard-hero-title">
          Welcome back,
          <span className="dashboard-hero-name">{firstName}!</span>
        </h2>
        <p className="dashboard-hero-copy">
          Explore the latest articles from all authors, discover new ideas, and
          enjoy a cleaner reading experience built around your profile.
        </p>
        <div className="dashboard-hero-badge">Reader access</div>
      </section>

      <ArticleFeed />
    </div>
  )
}

export default UserDashboard
