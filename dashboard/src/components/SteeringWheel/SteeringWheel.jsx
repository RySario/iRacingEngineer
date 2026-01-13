import { useTelemetry } from '../../contexts/TelemetryContext'
import './SteeringWheel.css'

function SteeringWheel() {
  const { telemetry } = useTelemetry()

  if (!telemetry) {
    return <div className="steering-empty">Waiting for data...</div>
  }

  // Convert radians to degrees
  const angleDegrees = ((telemetry.steeringAngle || 0) * (180 / Math.PI))

  return (
    <div className="steering-wheel">
      <span className="label">Steering</span>
      <div className="steering-visual">
        <svg viewBox="0 0 100 100" className="steering-svg">
          {/* Outer ring */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="var(--border-color)"
            strokeWidth="4"
          />

          {/* Center marker (top of wheel) - rotates with angle */}
          <line
            x1="50"
            y1="15"
            x2="50"
            y2="30"
            stroke="var(--accent-green)"
            strokeWidth="4"
            strokeLinecap="round"
            transform={`rotate(${angleDegrees}, 50, 50)`}
          />

          {/* Left 90 deg marker */}
          <line
            x1="10"
            y1="50"
            x2="15"
            y2="50"
            stroke="var(--text-muted)"
            strokeWidth="2"
          />

          {/* Right 90 deg marker */}
          <line
            x1="85"
            y1="50"
            x2="90"
            y2="50"
            stroke="var(--text-muted)"
            strokeWidth="2"
          />
        </svg>
      </div>
      <span className="steering-value mono">
        {angleDegrees.toFixed(0)}°
      </span>
    </div>
  )
}

export default SteeringWheel
