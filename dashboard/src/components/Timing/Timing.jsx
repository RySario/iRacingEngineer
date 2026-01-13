import { useTelemetry } from '../../contexts/TelemetryContext'
import './Timing.css'

function Timing() {
  const { telemetry, lapHistory } = useTelemetry()

  if (!telemetry) {
    return <div className="timing-empty">Waiting for timing data...</div>
  }

  return (
    <div className="timing">
      <div className="timing-current">
        <div className="timing-item">
          <span className="label">Current Lap</span>
          <span className="value-medium mono">{formatTime(telemetry.lapCurrentTime)}</span>
        </div>

        <div className="timing-item">
          <span className="label">Delta to Best</span>
          <span className={`value-medium mono ${getDeltaClass(telemetry.lapDeltaToBest)}`}>
            {formatDelta(telemetry.lapDeltaToBest)}
          </span>
        </div>
      </div>

      <div className="timing-reference">
        <div className="timing-item">
          <span className="label">Best Lap</span>
          <span className="value-small mono positive">
            {formatTime(telemetry.lapBestTime)}
          </span>
        </div>

        <div className="timing-item">
          <span className="label">Last Lap</span>
          <span className="value-small mono">
            {formatTime(telemetry.lapLastTime)}
          </span>
        </div>
      </div>

      <div className="timing-position">
        <div className="timing-item">
          <span className="label">Position</span>
          <span className="value-large">P{telemetry.position || '-'}</span>
        </div>

        <div className="timing-item">
          <span className="label">Lap</span>
          <span className="value-medium mono">{telemetry.lap || 0}</span>
        </div>
      </div>

      {lapHistory.length > 0 && (
        <div className="lap-history">
          <span className="label">Recent Laps</span>
          <div className="history-list">
            {lapHistory.slice(-5).reverse().map((lap) => (
              <div key={lap.lap} className="history-item">
                <span className="lap-num">L{lap.lap}</span>
                <span className="lap-time mono">{formatTime(lap.time)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function formatTime(seconds) {
  if (!seconds || seconds <= 0) return '--:--.---'

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toFixed(3).padStart(6, '0')}`
}

function formatDelta(delta) {
  if (delta === null || delta === undefined) return '+0.000'

  const sign = delta >= 0 ? '+' : ''
  return `${sign}${delta.toFixed(3)}`
}

function getDeltaClass(delta) {
  if (delta === null || delta === undefined) return ''
  return delta < 0 ? 'positive' : delta > 0 ? 'negative' : ''
}

export default Timing
