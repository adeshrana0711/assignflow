import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function AddUserPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [department, setDepartment] = useState('')
  const [departments, setDepartments] = useState([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const navigate = useNavigate()

  // ==========================================
  // LOAD DEPARTMENTS
  // ==========================================
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          '/api/admin/departments/api/all',
          {
            method: 'GET',
            credentials: 'include',
            headers: {
              Accept: 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            },
          }
        )

        const contentType =
          response.headers.get('content-type') || ''

        if (!response.ok) {
          let message = 'Unable to load departments'

          if (contentType.includes('application/json')) {
            const json = await response.json().catch(() => null)
            message = json?.error || message
          } else {
            message = `Unable to load departments (${response.status})`
          }

          throw new Error(message)
        }

        const data = await response.json()

        const departmentList = data.departments || []

        setDepartments(departmentList)

        if (departmentList.length > 0) {
          setDepartment(departmentList[0].name)
        }
      } catch (err) {
        console.error('Load departments error:', err)
        setError(err.message || 'Unable to load departments')
      } finally {
        setLoading(false)
      }
    }

    loadDepartments()
  }, [])

  // ==========================================
  // CREATE USER
  // ==========================================
  const handleSubmit = async (event) => {
    event.preventDefault()

    setError(null)
    setSaving(true)

    try {
      const response = await fetch(
        '/api/admin/users/api',
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify({
            name,
            email,
            password,
            role,
            department,
          }),
        }
      )

      const contentType =
        response.headers.get('content-type') || ''

      if (!response.ok) {
        let message = 'Unable to add user'

        if (contentType.includes('application/json')) {
          const json = await response.json().catch(() => null)
          message = json?.error || message
        } else {
          message = `Unable to add user (${response.status})`
        }

        throw new Error(message)
      }

      const json = await response.json()

      console.log('User created:', json)

      navigate('/admin/users')
    } catch (err) {
      console.error('Add user error:', err)

      setError(
        err.message || 'Error adding user. Please try again'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-shell">
      <div className="page-backdrop" />

      <main className="form-card">

        {/* HEADER */}
        <div className="form-header">
          <h1>Add User</h1>

          <p>
            Create a new account for the portal.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <p className="api-status api-error">
            {error}
          </p>
        )}

        {/* LOADING */}
        {loading ? (
          <p className="api-status">
            Loading departments...
          </p>
        ) : (
          <form
            className="form-grid"
            onSubmit={handleSubmit}
          >

            {/* FULL NAME */}
            <label>
              Full Name

              <input
                className="form-input"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Jane Doe"
                required
              />
            </label>

            {/* EMAIL */}
            <label>
              Email Address

              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="jane@university.edu"
                required
              />
            </label>

            {/* PASSWORD */}
            <label>
              Password

              <input
                className="form-input"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter temporary password"
                required
              />
            </label>

            {/* ROLE */}
            <label>
              Role

              <select
                className="form-select"
                value={role}
                onChange={(event) =>
                  setRole(event.target.value)
                }
                required
              >
                <option value="student">
                  Student
                </option>

                <option value="professor">
                  Professor
                </option>

                <option value="hod">
                  HOD
                </option>
              </select>
            </label>

            {/* DEPARTMENT */}
            <label>
              Department

              <select
                className="form-select"
                value={department}
                onChange={(event) =>
                  setDepartment(event.target.value)
                }
                required
              >
                <option value="">
                  Select Department
                </option>

                {departments.map((dept) => (
                  <option
                    key={dept._id}
                    value={dept.name}
                  >
                    {dept.name}
                  </option>
                ))}
              </select>
            </label>

            {/* BUTTONS */}
            <div className="form-actions">

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : 'Add User'}
              </button>

              <Link
                to="/admin/users"
                className="secondary-button"
              >
                Cancel
              </Link>

            </div>

          </form>
        )}

      </main>
    </div>
  )
}

export default AddUserPage