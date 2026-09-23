import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

function DepartmentsPage() {
  const [departments, setDepartments] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalDepartments, setTotalDepartments] = useState(0)

  const [search, setSearch] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // FETCH DEPARTMENTS
  // ===============================
  const fetchDepartments = async () => {
    setLoading(true)
    setError(null)

    try {
      const query = new URLSearchParams()

      if (searchQuery.trim()) {
        query.set('search', searchQuery.trim())
      }

      if (filterType) {
        query.set('type', filterType)
      }

      query.set('page', String(page))

      const response = await fetch(
        `/api/admin/departments/api?${query.toString()}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        }
      )

      const contentType = response.headers.get('content-type') || ''

      if (!response.ok) {
        let message = 'Unable to load departments'

        if (contentType.includes('application/json')) {
          const json = await response.json().catch(() => null)
          message = json?.error || message
        } else {
          message = `Server returned ${response.status}`
        }

        throw new Error(message)
      }

      if (!contentType.includes('application/json')) {
        throw new Error('Server returned an invalid response')
      }

      const data = await response.json()

      setDepartments(data.departments || [])
      setTotalPages(data.totalPages || 0)
      setTotalDepartments(data.totalDepartments || 0)

      if (data.currentPage) {
        setPage(data.currentPage)
      }
    } catch (err) {
      console.error('Department fetch error:', err)
      setError(err.message || 'Unable to load departments')
      setDepartments([])
    } finally {
      setLoading(false)
    }
  }

  // ===============================
  // LOAD DATA
  // ===============================
  useEffect(() => {
    fetchDepartments()
  }, [page, filterType, searchQuery])

  // ===============================
  // SEARCH
  // ===============================
  const handleSearch = (event) => {
    event.preventDefault()

    setPage(1)
    setSearchQuery(search)
  }

  // ===============================
  // FILTER
  // ===============================
  const handleFilterChange = (event) => {
    setFilterType(event.target.value)
    setPage(1)
  }

  // ===============================
  // DELETE
  // ===============================
  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `Delete department "${name}"?`
    )

    if (!confirmed) return

    try {
      const response = await fetch(
        `/api/admin/departments/api/${id}`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        }
      )

      const contentType = response.headers.get('content-type') || ''

      if (!response.ok) {
        let message = 'Could not delete department'

        if (contentType.includes('application/json')) {
          const json = await response.json().catch(() => null)
          message = json?.error || message
        } else {
          message = `Server returned ${response.status}`
        }

        throw new Error(message)
      }

      await fetchDepartments()
    } catch (err) {
      console.error('Delete department error:', err)
      setError(err.message || 'Could not delete department')
    }
  }

  const departmentRows = useMemo(() => {
    return departments.map((dept) => (
      <tr key={dept._id} className="row-hover">
        <td>
          <div className="dept-name-cell">
            <div>
              <div className="dept-title">{dept.name} </div>

              <div className="dept-meta"> {dept.createdAt ? new Date(dept.createdAt).toLocaleDateString(): '—'}</div>
            </div>
          </div>
        </td>

        <td>
          <span className={`tag tag-${String(dept.programType || '').toLowerCase()}`}>{dept.programType || '—'}</span>
        </td>

        <td>
          <div className="truncate-text" title={dept.address || ''}>{dept.address || '—'}</div>
        </td>

        <td className="center-text">
          <span className={`status-badge ${dept.userCount > 0? 'status-positive': 'status-neutral'}`}>
            {dept.userCount || 0}
          </span>
        </td>

        <td className="center-text">
          <div className="department-actions">

            <Link to={`/admin/departments/edit/${dept._id}`} className="action-button edit-button">Edit
            </Link>

            <button type="button" className="action-button delete-button" onClick={() => handleDelete(dept._id, dept.name)}> Delete</button>
          </div>
        </td>
      </tr>
    ))
  }, [departments])

  return (
    <div className="departments-page">

    
      <section className="departments-header">

        <div className="departments-heading">
          <h1>Department Management</h1>

          <p>
            Total: {totalDepartments} departments
          </p>
        </div>

        <Link
          to="/admin/departments/add"
          className="primary-button create-department-button"
        >
          Create Department
        </Link>

      </section>

      {/* ===============================
          FILTERS
      =============================== */}
      <section className="departments-filters">

        <form
          className="department-search-form"
          onSubmit={handleSearch}
        >
          <label className="department-filter-label">
            <span>Search by Name</span>

            <div className="department-search-box">

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Type to search departments..."
              />

              <button
                type="submit"
                className="secondary-button search-button"
              >
                Search
              </button>

            </div>
          </label>
        </form>

        <label className="department-filter-label type-filter">
          <span>Filter by Type</span>

          <select
            value={filterType}
            onChange={handleFilterChange}
            className="department-type-select"
          >
            <option value="">All Types</option>
            <option value="UG">UG</option>
            <option value="PG">PG</option>
            <option value="Research">
              Research
            </option>
          </select>
        </label>

      </section>

      <section className="departments-content">

        {loading && (
          <div className="department-message">
            <p>Loading departments...</p>
          </div>
        )}

        {!loading && error && (
          <div className="department-message department-error">
            <p>{error}</p>

            <button
              type="button"
              className="primary-button retry-button"
              onClick={fetchDepartments}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          departments.length === 0 && (
            <div className="empty-state-card">

              <div className="empty-state-content">

                <div className="empty-state-icon">
                  🏛️
                </div>

                <h2>
                  No Departments Found
                </h2>

                <p>
                  Create your first department
                  to get started.
                </p>

                <Link
                  to="/admin/departments/add"
                  className="primary-button empty-create-button"
                >
                  Create Department
                </Link>

              </div>

            </div>
          )}

        {!loading &&
          !error &&
          departments.length > 0 && (
            <div className="table-card">

              <div className="table-wrapper">
                <table className="dept-table">

                  <thead>
                    <tr>
                      <th>
                        Department Name
                      </th>

                      <th>
                        Program Type
                      </th>

                      <th>
                        Address
                      </th>

                      <th className="center-text">
                        Users
                      </th>

                      <th className="center-text">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {departmentRows}
                  </tbody>

                </table>
              </div>

              {/* ===============================
                  PAGINATION
              =============================== */}
              {totalPages > 1 && (
                <div className="pagination-row">

                  <button
                    type="button"
                    className="page-button"
                    disabled={page <= 1}
                    onClick={() =>
                      setPage((current) =>
                        Math.max(1, current - 1)
                      )
                    }
                  >
                    Previous
                  </button>

                  <span className="pagination-info">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    type="button"
                    className="page-button"
                    disabled={page >= totalPages}
                    onClick={() =>
                      setPage((current) =>
                        Math.min(
                          totalPages,
                          current + 1
                        )
                      )
                    }
                  >
                    Next
                  </button>

                </div>
              )}

            </div>
          )}

      </section>

    </div>
  )
}

export default DepartmentsPage