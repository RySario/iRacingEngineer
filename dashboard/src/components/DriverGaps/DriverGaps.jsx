import { useTelemetry } from '../../contexts/TelemetryContext'
import './DriverGaps.css'

function DriverGaps() {
  const { telemetry, session } = useTelemetry()

  if (!telemetry || !session?.standings) {
    return <div className="driver-gaps-empty">Waiting for standings data...</div>
  }

  const playerPosition = telemetry.position
  const standings = session.standings || []

  // Find drivers ahead and behind
  const driverAhead = standings.find(d => d.position === playerPosition - 1)
  const driverBehind = standings.find(d => d.position === playerPosition + 1)
  const leader = standings.find(d => d.position === 1)

  const formatGap = (gap) => {
    if (gap === null || gap === undefined || gap === 0) return '--'
    return `${gap.toFixed(3)}s`
  }

  return (
    <div className="driver-gaps">
      <span className="label">Gaps</span>

      <div className="gap-items">
        {driverAhead && (
          <div className="gap-item ahead">
            <span className="gap-label">Ahead</span>
            <span className="gap-driver">{driverAhead.driverName}</span>
            <span className="gap-value mono positive">
              {formatGap(driverAhead.gap - (standings.find(d => d.position === playerPosition)?.gap || 0))}
            </span>
          </div>
        )}

        {leader && playerPosition > 1 && (
          <div className="gap-item leader">
            <span className="gap-label">To Leader</span>
            <span className="gap-driver">{leader.driverName}</span>
            <span className="gap-value mono">
              {formatGap(standings.find(d => d.position === playerPosition)?.gap || 0)}
            </span>
          </div>
        )}

        {driverBehind && (
          <div className="gap-item behind">
            <span className="gap-label">Behind</span>
            <span className="gap-driver">{driverBehind.driverName}</span>
            <span className="gap-value mono negative">
              {formatGap((standings.find(d => d.position === playerPosition)?.gap || 0) - driverBehind.gap)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default DriverGaps
