import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

function EditDepartmentPage() {
  const { id } = useParams()
  const [name, setName] = useState('')
  const [programType, setProgramType] = useState('UG')
  const [address, setAddress] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const loadDepartment = async () => {
      try {
        const response = await fetch(`/admin/departments/api/${id}`, {
          credentials: 'include',
        })
        const json = await response.json()
        if (!response.ok) {
          throw new Error(json.error || 'Unable to load department')
        }

        setName(json.department.name)
        setProgramType(json.department.programType)
        setAddress(json.department.address)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadDepartment()
  }, [id])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const response = await fetch(`/admin/departments/api/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, programType, address }),
      })

      const json = await response.json()
      if (!response.ok) {
        throw new Error(json.error || 'Unable to update department')
      }

      navigate('/admin/departments')
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
          <h1>Edit Department</h1>
          <p>Update department details and save changes.</p>
        </div>

        {loading ? (
          <p className="api-status">Loading department...</p>
        ) : (
          <>
            {error && <p className="api-status api-error">{error}</p>}

            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                Department Name
                <input
                  className="form-input"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </label>

              <label>
                Program Type
                <select
                  className="form-select"
                  value={programType}
                  onChange={(event) => setProgramType(event.target.value)}
                  required
                >
                  <option value="UG">UG</option>
                  <option value="PG">PG</option>
                  <option value="Research">Research</option>
                </select>
              </label>

              <label>
                Address
                <textarea
                  className="form-input"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  rows="4"
                  required
                />
              </label>

              <div className="form-actions">
                <button type="submit" className="primary-button" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <Link to="/admin/departments" className="secondary-button">
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

export default EditDepartmentPage
