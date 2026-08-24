import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await fetch('/auth/logout', { credentials: 'include' })
    } catch (err) {
      // ignore
    }
    navigate('/login')
  }

  // hide navbar on login page
  if (location.pathname === '/' || location.pathname === '/login') return null

  const portal = location.pathname.startsWith('/professor')
    ? {
        title: 'Professor Portal',
        home: '/professor/dashboard',
        links: [
          ['Dashboard', '/professor/dashboard'],
          ['Create Assignment', '/professor/create-assignment'],
          ['Notifications', '/professor/notifications'],
        ],
      }
    : location.pathname.startsWith('/hod')
      ? {
          title: 'HOD Portal',
          home: '/hod/dashboard',
          links: [
            ['Dashboard', '/hod/dashboard'],
            ['Notifications', '/hod/notifications'],
          ],
        }
      : {
          title: 'Admin Portal',
          home: '/admin/dashboard',
          links: [
            ['Dashboard', '/admin/dashboard'],
            ['Departments', '/admin/departments'],
            ['Users', '/admin/users'],
          ],
        }

  return (
    <header className="app-navbar">
      <div className="nav-inner">
        <div className="nav-left">
          <Link to={portal.home} className="brand">
            <div className="brand-ring small" />
            <div>
              <span className="brand-text">AssignFlow</span>
              <span className="brand-subtitle">{portal.title}</span>
            </div>
          </Link>
        </div>

        <nav className="nav-links">
          {portal.links.map(([label, path]) => (
            <Link key={path} to={path} className="nav-link">{label}</Link>
          ))}
        </nav>

        <div className="nav-actions">
          <button className="secondary-button" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </header>
  )
}
