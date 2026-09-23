import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function AddDepartmentPage() {
  const [name, setName] = useState('')
  const [programType, setProgramType] = useState('UG')
  const [address, setAddress] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/admin/departments/api', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, programType, address }),
      })

      const json = await response.json()
      if (!response.ok) {
        throw new Error(json.error || 'Could not create department')
      }

      navigate('/admin/departments')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell">
      <div className="page-backdrop" />
      <main className="form-card">
        <div className="form-header">
          <h1>Create Department</h1>
          <p>Add a new academic department to the system.</p>
        </div>

        {error && <p className="api-status api-error">{error}</p>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Department Name
            <input
              className="form-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Example: Computer Science"
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
              placeholder="Building, campus or location"
              rows="4"
              required
            />
          </label>

          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Creating…' : 'Create Department'}
            </button>
            <Link to="/admin/departments" className="secondary-button">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}

export default AddDepartmentPage
