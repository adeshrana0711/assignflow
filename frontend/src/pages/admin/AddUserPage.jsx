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

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const response = await fetch('/admin/departments/api/all', {
          credentials: 'include',
        })
        const json = await response.json()
        if (response.ok) {
          setDepartments(json.departments || [])
          setDepartment(json.departments?.[0]?.name || '')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadDepartments()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const response = await fetch('/admin/users/api', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role, department }),
      })

      const json = await response.json()
      if (!response.ok) {
        throw new Error(json.error || 'Unable to add user')
      }

      navigate('/admin/users')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-shell">
      <div className="page-backdrop" />
      <main className="form-card">
        <div className="form-header">
          <h1>Add User</h1>
          <p>Create a new account for the portal.</p>
        </div>

        {loading ? (
          <p className="api-status">Loading departments…</p>
        ) : (
          <>
            {error && <p className="api-status api-error">{error}</p>}

            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                Full Name
                <input
                  className="form-input"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Jane Doe"
                  required
                />
              </label>

              <label>
                Email Address
                <input
                  className="form-input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="jane@university.edu"
                  required
                />
              </label>

              <label>
                Password
                <input
                  className="form-input"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter temporary password"
                  required
                />
              </label>

              <label>
                Role
                <select
                  className="form-select"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  required
                >
                  <option value="student">Student</option>
                  <option value="professor">Professor</option>
                  <option value="hod">HOD</option>
                </select>
              </label>

              <label>
                Department
                <select
                  className="form-select"
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="form-actions">
                <button type="submit" className="primary-button" disabled={saving}>
                  {saving ? 'Saving…' : 'Add User'}
                </button>
                <Link to="/admin/users" className="secondary-button">
                  Cancel
                </Link>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  )
}

export default AddUserPage
