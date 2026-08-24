import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

function EditUserPage() {
  const { id } = useParams()
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
    const loadData = async () => {
      try {
        const [userResponse, deptResponse] = await Promise.all([
          fetch(`/admin/users/api/${id}`, { credentials: 'include' }),
          fetch('/admin/departments/api/all', { credentials: 'include' }),
        ])

        const userJson = await userResponse.json()
        const deptJson = await deptResponse.json()

        if (!userResponse.ok) {
          throw new Error(userJson.error || 'Unable to load user')
        }
        if (!deptResponse.ok) {
          throw new Error(deptJson.error || 'Unable to load departments')
        }

        setName(userJson.user.name)
        setEmail(userJson.user.email)
        setRole(userJson.user.role)
        setDepartment(userJson.user.department || '')
        setDepartments(deptJson.departments || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const response = await fetch(`/admin/users/api/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, department, password }),
      })

      const json = await response.json()
      if (!response.ok) {
        throw new Error(json.error || 'Unable to update user')
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
          <h1>Edit User</h1>
          <p>Update the user's profile and department assignment.</p>
        </div>

        {loading ? (
          <p className="api-status">Loading user details…</p>
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
                  required
                />
              </label>

              <label>
                New Password
                <input
                  className="form-input"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Leave blank to keep current password"
                />
              </label>

              <label>
                Role
                <select className="form-select" value={role} disabled>
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
                  {saving ? 'Saving…' : 'Update User'}
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

export default EditUserPage
