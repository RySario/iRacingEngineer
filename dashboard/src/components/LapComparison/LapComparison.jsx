import { useState } from 'react'
import { useTelemetry } from '../../contexts/TelemetryContext'
import SpeedChart from '../Charts/SpeedChart'
import PedalChart from '../Charts/PedalChart'
import SteeringChart from '../Charts/SteeringChart'
import './LapComparison.css'

function LapComparison() {
  const { lapHistory, lapTelemetryData, telemetry } = useTelemetry()
  const [selectedLaps, setSelectedLaps] = useState([])

  const toggleLap = (lapNum) => {
    setSelectedLaps(prev => {
      if (prev.includes(lapNum)) {
        return prev.filter(l => l !== lapNum)
      } else {
        // Limit to 4 comparison laps
        if (prev.length >= 4) {
          return [...prev.slice(1), lapNum]
        }
        return [...prev, lapNum]
      }
    })
  }

  const formatLapTime = (seconds) => {
    if (!seconds) return '--:--.---'
    const mins = Math.floor(seconds / 60)
    const secs = (seconds % 60).toFixed(3).padStart(6, '0')
    return `${mins}:${secs}`
  }

  // Get current lap data
  const currentLap = telemetry?.lap
  const currentLapData = lapTelemetryData[currentLap] || []

  // Get selected laps data for comparison
  const compareLapsData = selectedLaps
    .filter(lapNum => lapTelemetryData[lapNum])
    .map(lapNum => ({
      lap: lapNum,
      data: lapTelemetryData[lapNum] || []
    }))

  return (
    <div className="lap-comparison">
      <span className="label">Lap Comparison</span>

      <div className="lap-selector">
        <span className="selector-label">Select laps to compare (max 4):</span>
        <div className="lap-chips">
          {lapHistory.slice().reverse().map((lap) => (
            <button
              key={lap.lap}
              className={`lap-chip ${selectedLaps.includes(lap.lap) ? 'selected' : ''}`}
              onClick={() => toggleLap(lap.lap)}
            >
              <span className="lap-number">L{lap.lap}</span>
              <span className="lap-time">{formatLapTime(lap.time)}</span>
            </button>
          ))}
          {lapHistory.length === 0 && (
            <span className="no-laps">Complete laps to compare</span>
          )}
        </div>
      </div>

      <div className="comparison-charts">
        <SpeedChart
          lapData={currentLapData}
          compareLaps={compareLapsData}
          title={`Speed - Lap ${currentLap || 1}`}
        />
        <PedalChart
          lapData={currentLapData}
          compareLaps={compareLapsData}
          title={`Pedals - Lap ${currentLap || 1}`}
        />
        <SteeringChart
          lapData={currentLapData}
          compareLaps={compareLapsData}
          title={`Steering - Lap ${currentLap || 1}`}
        />
      </div>

      {selectedLaps.length > 0 && (
        <div className="selected-info">
          <span className="info-text">Comparing with laps: {selectedLaps.join(', ')}</span>
        </div>
      )}
    </div>
  )
}

export default LapComparison
