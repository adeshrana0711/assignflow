import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

function UsersPage() {
  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadDepartments = async () => {
    try {
      const response = await fetch('/admin/departments/api/all', {
        credentials: 'include',
      })
      const json = await response.json()
      if (response.ok) {
        setDepartments(json.departments || [])
      }
    } catch (err) {
      console.error(err)
    }
  }

  const loadUsers = async () => {
    setLoading(true)
    setError(null)

    try {
      const query = new URLSearchParams()
      query.set('page', String(page))
      if (search) query.set('search', search)
      if (filterRole) query.set('role', filterRole)
      if (filterDepartment) query.set('department', filterDepartment)

      const response = await fetch(`/admin/users/api?${query.toString()}`, {
        credentials: 'include',
      })
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json.error || 'Unable to load users')
      }

      setUsers(json.users)
      setTotalPages(json.totalPages)
      setTotalUsers(json.totalUsers)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDepartments()
  }, [])

  useEffect(() => {
    loadUsers()
  }, [page, filterRole, filterDepartment])

  const handleSearch = (event) => {
    event.preventDefault()
    setPage(1)
    loadUsers()
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user '${name}'?`)) return

    try {
      const response = await fetch(`/admin/users/api/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json.error || 'Could not delete user')
      }
      loadUsers()
    } catch (err) {
      setError(err.message)
    }
  }

  const rows = useMemo(
    () =>
      users.map((user) => (
        <tr key={user._id} className="row-hover">
          <td>
            <div className="dept-name-cell">
              <div>
                <div className="dept-title">{user.name}</div>
                <div className="dept-meta">{new Date(user.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </td>
          <td>
            <div className="truncate-text" title={user.email}>{user.email}</div>
          </td>
          <td>
            <span className={`tag tag-${user.role}`}>{user.role}</span>
          </td>
          <td>{user.department || '—'}</td>
          <td className="center-text actions-cell">
            <Link to={`/admin/users/edit/${user._id}`} className="action-button edit-button">
              Edit
            </Link>
            <button
              type="button"
              className="action-button delete-button"
              onClick={() => handleDelete(user._id, user.name)}
            >
              Delete
            </button>
          </td>
        </tr>
      )),
    [users]
  )

  return (
    <div className="page-shell">
      <div className="page-backdrop" />
      <main className="departments-card">
        <section className="departments-header">
          <div>
            <h1>User Management</h1>
            <p>{`Total: ${totalUsers} users`}</p>
          </div>
          <Link to="/admin/users/add" className="primary-button">
            Add New User
          </Link>
        </section>

        <section className="departments-filters">
          <form className="filter-form" onSubmit={handleSearch}>
            <label>
              Search by name or email
              <div className="input-group">
                <input
                  className="form-input"
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search users..."
                />
                <button type="submit" className="secondary-button">
                  Search
                </button>
              </div>
            </label>
          </form>

          <label className="filter-select-label">
            Filter by role
            <select
              className="form-select"
              value={filterRole}
              onChange={(event) => {
                setFilterRole(event.target.value)
                setPage(1)
              }}
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="professor">Professor</option>
              <option value="hod">HOD</option>
            </select>
          </label>

          <label className="filter-select-label">
            Filter by department
            <select
              className="form-select"
              value={filterDepartment}
              onChange={(event) => {
                setFilterDepartment(event.target.value)
                setPage(1)
              }}
            >
              <option value="">All Departments</option>
              {departments.map((department) => (
                <option key={department._id} value={department.name}>
                  {department.name}
                </option>
              ))}
            </select>
          </label>
        </section>

        {loading ? (
          <p className="api-status">Loading users...</p>
        ) : error ? (
          <p className="api-status api-error">{error}</p>
        ) : users.length === 0 ? (
          <div className="empty-state-card">
            <h2>No users found</h2>
            <p>Try changing your filters or add a new user to get started.</p>
          </div>
        ) : (
          <div className="table-card">
            <table className="dept-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th className="center-text">Actions</th>
                </tr>
              </thead>
              <tbody>{rows}</tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination-row">
                <button
                  type="button"
                  className="page-button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </button>
                <span className="pagination-info">Page {page} of {totalPages}</span>
                <button
                  type="button"
                  className="page-button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default UsersPage
