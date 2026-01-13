import { useTelemetry } from '../../contexts/TelemetryContext'
import './Standings.css'

function Standings() {
  const { session, telemetry } = useTelemetry()

  const standings = session?.standings || []
  const playerPosition = telemetry?.position

  if (standings.length === 0) {
    return <div className="standings-empty">Waiting for standings data...</div>
  }

  return (
    <div className="standings">
      <table className="standings-table">
        <thead>
          <tr>
            <th>Pos</th>
            <th>#</th>
            <th>Driver</th>
            <th>Car</th>
            <th>Best Lap</th>
            <th>Last Lap</th>
            <th>Gap</th>
            <th>Laps</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((entry) => (
            <tr
              key={entry.carIdx}
              className={entry.position === playerPosition ? 'player-row' : ''}
            >
              <td className="position">
                <span className={`pos-badge pos-${getPositionClass(entry.position)}`}>
                  {entry.position}
                </span>
              </td>
              <td className="car-number">{entry.carNumber}</td>
              <td className="driver-name">{entry.driverName}</td>
              <td className="car-name">{entry.carName}</td>
              <td className="lap-time mono">{formatTime(entry.bestLapTime)}</td>
              <td className="lap-time mono">{formatTime(entry.lastLapTime)}</td>
              <td className="gap mono">{formatGap(entry.gap, entry.position)}</td>
              <td className="laps">{entry.lapsComplete}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function formatTime(seconds) {
  if (!seconds || seconds <= 0) return '--:--.---'

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toFixed(3).padStart(6, '0')}`
}

function formatGap(gap, position) {
  if (position === 1) return 'Leader'
  if (!gap || gap <= 0) return '--'
  return `+${gap.toFixed(3)}`
}

function getPositionClass(position) {
  if (position === 1) return 'first'
  if (position === 2) return 'second'
  if (position === 3) return 'third'
  return 'other'
}

export default Standings
