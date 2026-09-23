import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

function AdminDashboardPage() {
  const [stats, setStats] = useState({
    departmentCount: 0,
    userCount: 0,
    studentCount: 0,
    professorCount: 0,
    hodCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
useEffect(() => {
  const fetchStats = async () => {
    try {
      const response = await fetch('/admin/dashboard/stats', {
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        throw new Error(errorBody?.error || 'Unable to load stats')
      }

      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  fetchStats()
}, [])

  const statCards = useMemo(
    () => [
      {
        label: 'Total Departments',
        value: stats.departmentCount,
        color: 'indigo',
        icon: '🏛',
        description: 'Academic departments',
        status: 'Active',
        statusClass: 'status-positive',
        featured: true,
      },
      {
        label: 'Total Users',
        value: stats.userCount,
        color: 'green',
        icon: '👥',
        description: 'Registered users',
        status: 'Online',
        statusClass: 'status-neutral',
        featured: true,
      },
      {
        label: 'Total Students',
        value: stats.studentCount,
        color: 'blue',
        icon: '🎓',
        description: 'Enrolled students',
        status: 'Students',
        statusClass: 'status-blue',
      },
      {
        label: 'Total Professors',
        value: stats.professorCount,
        color: 'amber',
        icon: '🧑‍🏫',
        description: 'Faculty members',
        status: 'Faculty',
        statusClass: 'status-amber',
      },
      {
        label: 'Total HODs',
        value: stats.hodCount,
        color: 'purple',
        icon: '⭐',
        description: 'Leadership',
        status: 'Leadership',
        statusClass: 'status-purple',
      },
    ],
    [stats]
  )

  return (
    <div className="page-shell">
      <div className="page-backdrop" />
      <main className="admin-dashboard-card">
        <section className="admin-dashboard-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome back! Here's what's happening in your institution.</p>
          </div>
        </section>

        {loading ? (
          <p className="api-status">Loading stats...</p>
        ) : error ? (
          <p className="api-status api-error">{error}</p>
        ) : (
          <>
            <section className="summary-grid">
              {statCards.filter((stat) => stat.featured).map((stat) => (
                <article key={stat.label} className="summary-card summary-card-large">
                  <div className="summary-card-top">
                    <div className={`summary-icon summary-icon-${stat.color}`}>{stat.icon}</div>
                    <span className={`status-badge ${stat.statusClass}`}>{stat.status}</span>
                  </div>
                  <div>
                    <div className="summary-card-label">{stat.label}</div>
                    <h2>{stat.value}</h2>
                    <p>{stat.description}</p>
                  </div>
                </article>
              ))}
            </section>

            <section className="summary-grid compact-grid">
              {statCards.filter((stat) => !stat.featured).map((stat) => (
                <article key={stat.label} className="summary-card summary-card-small">
                  <div className="summary-card-top">
                    <div className={`summary-icon summary-icon-${stat.color}`}>{stat.icon}</div>
                    <span className={`status-badge ${stat.statusClass}`}>{stat.status}</span>
                  </div>
                  <div>
                    <div className="summary-card-label">{stat.label}</div>
                    <h2>{stat.value}</h2>
                    <p>{stat.description}</p>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}

        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="quick-actions-grid">
            <Link to="/admin/users/add" className="quick-action-card quick-action-indigo">
              <strong>Add User</strong>
              <span>Create new account</span>
            </Link>
            <Link to="/admin/departments" className="quick-action-card quick-action-green">
              <strong>Manage Departments</strong>
              <span>View all departments</span>
            </Link>
            <Link to="/admin/users" className="quick-action-card quick-action-amber">
              <strong>View Users</strong>
              <span>All registered users</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}

export default AdminDashboardPage
