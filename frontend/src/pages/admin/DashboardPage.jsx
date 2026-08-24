import { Link } from 'react-router-dom'

function DashboardPage() {
  return (
    <div className="page-shell">
      <div className="page-backdrop" />
      <main className="dashboard-card">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Welcome! Use the links below to navigate your role's pages.</p>
        </header>

        <div className="dashboard-grid">
          <Link to="/admin/users" className="dashboard-card-item">
            <h2>Users</h2>
            <p>Manage registered users.</p>
          </Link>
          <Link to="/admin/departments" className="dashboard-card-item">
            <h2>Departments</h2>
            <p>View and manage departments.</p>
          </Link>
          <Link to="/admin/dashboard" className="dashboard-card-item">
            <h2>Overview</h2>
            <p>See your admin analytics.</p>
          </Link>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage;
