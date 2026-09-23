import { useEffect, useMemo, useState } from 'react'

function DepartmentsPage() {
  const [departments, setDepartments] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalDepartments, setTotalDepartments] = useState(0)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDepartments = async () => {
    setLoading(true)
    setError(null)
    try {
      const query = new URLSearchParams()
      if (search) query.set('search', search)
      if (filterType) query.set('type', filterType)
      query.set('page', String(page))

      const response = await fetch(`/api/admin/departments/api?${query.toString()}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        const json = await response.json().catch(() => ({}))
        throw new Error(json.error || 'Unable to load departments')
      }

      const data = await response.json()
      setDepartments(data.departments)
      setPage(data.currentPage)
      setTotalPages(data.totalPages)
      setTotalDepartments(data.totalDepartments)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [page, filterType])

  const handleSearch = (event) => {
    event.preventDefault()
    setPage(1)
    fetchDepartments()
  }

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(`Delete department '${name}'?`)
    if (!confirmed) return

    try {
      const response = await fetch(`/admin/departments/api/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!response.ok) {
        const json = await response.json().catch(() => ({}))
        throw new Error(json.error || 'Could not delete department')
      }
      await fetchDepartments()
    } catch (err) {
      setError(err.message)
    }
  }

  const departmentRows = useMemo(
    () =>
      departments.map((dept) => (
        <tr key={dept._id} className="row-hover">
          <td>
            <div className="dept-name-cell">
              <div>
                <div className="dept-title">{dept.name}</div>
                <div className="dept-meta">{new Date(dept.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </td>
          <td>
            <span className={`tag tag-${dept.programType.toLowerCase()}`}>
              {dept.programType}
            </span>
          </td>
          <td>
            <div className="truncate-text" title={dept.address}>{dept.address}</div>
          </td>
          <td className="center-text">
            <span className={`status-badge ${dept.userCount > 0 ? 'status-positive' : 'status-neutral'}`}>
              {dept.userCount}
            </span>
          </td>
          <td className="center-text actions-cell">
            <a href={`/admin/departments/edit/${dept._id}`} className="action-button edit-button">
              Edit
            </a>
            <button
              type="button"
              className="action-button delete-button"
              onClick={() => handleDelete(dept._id, dept.name)}
            >
              Delete
            </button>
          </td>
        </tr>
      )),
    [departments]
  )

  return (
    <div className="page-shell">
      <div className="page-backdrop" />
      <main className="departments-card">
        <section className="departments-header">
          <div>
            <h1>Department Management</h1>
            <p>{`Total: ${totalDepartments} departments`}</p>
          </div>
          <a href="/admin/departments/add" className="primary-button">
            Create Department
          </a>
        </section>

        <section className="departments-filters">
          <form className="filter-form" onSubmit={handleSearch}>
            <label>
              Search by Name
              <div className="input-group">
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Type to search departments..."
                />
                <button type="submit" className="secondary-button">
                  Search
                </button>
              </div>
            </label>
          </form>

          <label className="filter-select-label">
            Filter by Type
            <select value={filterType} onChange={(event) => {
              setFilterType(event.target.value)
              setPage(1)
            }}>
              <option value="">All Types</option>
              <option value="UG">UG</option>
              <option value="PG">PG</option>
              <option value="Research">Research</option>
            </select>
          </label>
        </section>

        {loading ? (
          <p className="api-status">Loading departments...</p>
        ) : error ? (
          <p className="api-status api-error">{error}</p>
        ) : departments.length === 0 ? (
          <div className="empty-state-card">
            <h2>No Departments Found</h2>
            <p>Create your first department to get started.</p>
            <a href="/admin/departments/add" className="primary-button">
              Create Department
            </a>
          </div>
        ) : (
          <div className="table-card">
            <table className="dept-table">
              <thead>
                <tr>
                  <th>Department Name</th>
                  <th>Program Type</th>
                  <th>Address</th>
                  <th className="center-text">Users</th>
                  <th className="center-text">Actions</th>
                </tr>
              </thead>
              <tbody>{departmentRows}</tbody>
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

export default DepartmentsPage
