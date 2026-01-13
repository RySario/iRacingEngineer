import { useTelemetry } from '../../contexts/TelemetryContext'
import './TrackMap.css'

function TrackMap() {
  const { telemetry, session } = useTelemetry()

  if (!telemetry) {
    return <div className="track-map-empty">Waiting for data...</div>
  }

  const lapDistPct = telemetry.lapDistPct || 0

  // Calculate position on oval
  const angle = lapDistPct * 2 * Math.PI - Math.PI / 2
  const playerX = 100 + 85 * Math.cos(angle)
  const playerY = 60 + 45 * Math.sin(angle)

  // Get other cars positions
  const otherCars = session?.standings?.slice(0, 15).filter(
    (driver) => driver.position !== telemetry.position
  ) || []

  return (
    <div className="track-map">
      <span className="label">Track Map</span>
      <svg viewBox="0 0 200 120" className="track-map-svg">
        {/* Track outline */}
        <ellipse
          cx="100"
          cy="60"
          rx="85"
          ry="45"
          fill="none"
          stroke="var(--border-color)"
          strokeWidth="3"
        />

        {/* Start/Finish line */}
        <line
          x1="100"
          y1="10"
          x2="100"
          y2="25"
          stroke="var(--text-muted)"
          strokeWidth="2"
        />
        <text x="100" y="8" textAnchor="middle" fontSize="8" fill="var(--text-muted)">
          S/F
        </text>

        {/* Other drivers (simplified) */}
        {otherCars.map((driver, i) => {
          // Approximate position (we don't have exact data for all cars easily)
          const carAngle = (driver.lapsComplete + 0.5) * 2 * Math.PI - Math.PI / 2
          const carX = 100 + 85 * Math.cos(carAngle)
          const carY = 60 + 45 * Math.sin(carAngle)

          return (
            <circle
              key={driver.carIdx}
              cx={carX}
              cy={carY}
              r="3"
              fill="var(--text-muted)"
              opacity="0.6"
            />
          )
        })}

        {/* Player position */}
        <circle
          cx={playerX}
          cy={playerY}
          r="5"
          fill="var(--accent-blue)"
          stroke="white"
          strokeWidth="1"
        />

        {/* Player indicator line */}
        <circle
          cx={playerX}
          cy={playerY}
          r="8"
          fill="none"
          stroke="var(--accent-blue)"
          strokeWidth="1"
        />
      </svg>

      <div className="track-progress">
        <span className="value-small mono">{(lapDistPct * 100).toFixed(1)}%</span>
      </div>
    </div>
  )
}

export default TrackMap
