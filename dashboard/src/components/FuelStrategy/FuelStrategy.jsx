import { useTelemetry } from '../../contexts/TelemetryContext'
import './FuelStrategy.css'

function FuelStrategy() {
  const { telemetry, fuelPerLap, lapsRemaining, session } = useTelemetry()

  if (!telemetry) {
    return <div className="fuel-empty">Waiting for fuel data...</div>
  }

  const fuelPercent = (telemetry.fuelPercent || 0) * 100
  const sessionLapsRemain = session?.sessionLapsRemain

  // Calculate if we can finish
  const canFinish = sessionLapsRemain && lapsRemaining
    ? lapsRemaining >= sessionLapsRemain
    : null

  return (
    <div className="fuel-strategy">
      <div className="fuel-level">
        <span className="label">Fuel Level</span>
        <div className="fuel-gauge">
          <div
            className={`fuel-fill ${getFuelClass(fuelPercent)}`}
            style={{ height: `${fuelPercent}%` }}
          ></div>
        </div>
        <div className="fuel-values">
          <span className="value-large">{telemetry.fuel?.toFixed(1) || '0.0'}</span>
          <span className="unit">L</span>
        </div>
      </div>

      <div className="fuel-stats">
        <div className="fuel-stat">
          <span className="label">Per Lap</span>
          <span className="value-medium mono">
            {fuelPerLap ? `${fuelPerLap.toFixed(2)} L` : '-- L'}
          </span>
        </div>

        <div className="fuel-stat">
          <span className="label">Laps Remaining</span>
          <span className={`value-medium mono ${lapsRemaining && lapsRemaining < 3 ? 'warning' : ''}`}>
            {lapsRemaining !== null ? lapsRemaining : '--'}
          </span>
        </div>

        {sessionLapsRemain && sessionLapsRemain > 0 && (
          <div className="fuel-stat">
            <span className="label">Race Laps Left</span>
            <span className="value-medium mono">{sessionLapsRemain}</span>
          </div>
        )}

        {canFinish !== null && (
          <div className="fuel-stat finish-status">
            <span className="label">Can Finish?</span>
            <span className={`value-medium ${canFinish ? 'positive' : 'negative'}`}>
              {canFinish ? 'YES' : 'NO - PIT'}
            </span>
          </div>
        )}
      </div>

      {!canFinish && canFinish !== null && fuelPerLap && (
        <div className="pit-recommendation">
          <span className="label">Fuel Needed</span>
          <span className="value-small mono">
            {((sessionLapsRemain - lapsRemaining + 2) * fuelPerLap).toFixed(1)} L
          </span>
          <span className="note">(+2 lap buffer)</span>
        </div>
      )}
    </div>
  )
}

function getFuelClass(percent) {
  if (percent > 50) return 'high'
  if (percent > 20) return 'medium'
  return 'low'
}

export default FuelStrategy
