import { useState } from 'react'
import { useTelemetry } from '../../contexts/TelemetryContext'
import './SessionNotes.css'

function SessionNotes() {
  const { session, telemetry } = useTelemetry()
  const [corners, setCorners] = useState([
    { id: 1, name: 'Corner 1', notes: '' },
    { id: 2, name: 'Corner 2', notes: '' },
    { id: 3, name: 'Corner 3', notes: '' },
    { id: 4, name: 'Corner 4', notes: '' },
  ])
  const [generalNotes, setGeneralNotes] = useState('')

  const addCorner = () => {
    const newId = corners.length > 0 ? Math.max(...corners.map(c => c.id)) + 1 : 1
    setCorners([...corners, { id: newId, name: `Corner ${newId}`, notes: '' }])
  }

  const removeCorner = (id) => {
    setCorners(corners.filter(c => c.id !== id))
  }

  const updateCornerName = (id, name) => {
    setCorners(corners.map(c => c.id === id ? { ...c, name } : c))
  }

  const updateCornerNotes = (id, notes) => {
    setCorners(corners.map(c => c.id === id ? { ...c, notes } : c))
  }

  const saveSessionReport = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const trackName = session?.trackName || 'Unknown Track'
    const driverName = session?.driverName || 'Unknown Driver'
    const sessionType = session?.sessionType || 'Unknown Session'

    let report = '========================================\n'
    report += 'SESSION REPORT\n'
    report += '========================================\n\n'
    report += `Track: ${trackName}\n`
    report += `Driver: ${driverName}\n`
    report += `Session: ${sessionType}\n`
    report += `Date: ${new Date().toLocaleString()}\n`
    report += `Laps Completed: ${telemetry?.lap || 0}\n`
    report += '\n========================================\n'
    report += 'CORNER NOTES\n'
    report += '========================================\n\n'

    corners.forEach(corner => {
      report += `${corner.name}:\n`
      report += `${corner.notes || '(No notes)'}\n\n`
    })

    report += '========================================\n'
    report += 'GENERAL NOTES\n'
    report += '========================================\n\n'
    report += generalNotes || '(No general notes)'
    report += '\n'

    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `session-report_${trackName.replace(/\s+/g, '-')}_${timestamp}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="session-notes">
      <div className="notes-header">
        <span className="label">Session Notes</span>
        <button className="save-report-btn" onClick={saveSessionReport}>
          Save Report
        </button>
      </div>

      <div className="corner-notes-section">
        <div className="section-header">
          <h3>Corner Notes</h3>
          <button className="add-corner-btn" onClick={addCorner}>
            + Add Corner
          </button>
        </div>

        <div className="corners-list">
          {corners.map(corner => (
            <div key={corner.id} className="corner-item">
              <div className="corner-header">
                <input
                  type="text"
                  className="corner-name-input"
                  value={corner.name}
                  onChange={(e) => updateCornerName(corner.id, e.target.value)}
                  placeholder="Corner name"
                />
                <button
                  className="remove-corner-btn"
                  onClick={() => removeCorner(corner.id)}
                  title="Remove corner"
                >
                  ×
                </button>
              </div>
              <textarea
                className="corner-notes-textarea"
                value={corner.notes}
                onChange={(e) => updateCornerNotes(corner.id, e.target.value)}
                placeholder="Enter notes for this corner..."
                rows={3}
              />
            </div>
          ))}

          {corners.length === 0 && (
            <div className="no-corners">
              No corners added. Click "Add Corner" to start taking notes.
            </div>
          )}
        </div>
      </div>

      <div className="general-notes-section">
        <h3>General Notes</h3>
        <textarea
          className="general-notes-textarea"
          value={generalNotes}
          onChange={(e) => setGeneralNotes(e.target.value)}
          placeholder="Enter general session notes, setup changes, weather conditions, etc..."
          rows={6}
        />
      </div>
    </div>
  )
}

export default SessionNotes
