import { useTelemetry } from '../../contexts/TelemetryContext'
import './Damage.css'

function Damage() {
  const { telemetry } = useTelemetry()

  if (!telemetry?.damage) {
    return <div className="damage-empty">Waiting for damage data...</div>
  }

  const damage = telemetry.damage

  const getDamageClass = (value) => {
    if (value === 0) return 'ok'
    if (value < 0.5) return 'warning'
    return 'critical'
  }

  const getEngineDamageClass = (warnings) => {
    if (warnings === 0) return 'ok'
    return 'critical'
  }

  const parseEngineWarnings = (warnings) => {
    if (warnings === 0) return 'Engine OK'

    const warningsList = []
    if (warnings & 0x01) warningsList.push('Water Temp')
    if (warnings & 0x02) warningsList.push('Fuel Pressure')
    if (warnings & 0x04) warningsList.push('Oil Pressure')
    if (warnings & 0x08) warningsList.push('Engine Stalled')
    if (warnings & 0x10) warningsList.push('Pit Speed Limiter')
    if (warnings & 0x20) warningsList.push('Rev Limiter')
    if (warnings & 0x40) warningsList.push('Oil Temp')
    if (warnings & 0x80) warningsList.push('Fuel Level')

    return warningsList.length > 0 ? warningsList.join(', ') : 'Engine Warning'
  }

  return (
    <div className="damage">
      <span className="label">Damage Monitor</span>

      <div className="car-diagram">
        <svg viewBox="0 0 100 140" className="car-svg">
          {/* Car body */}
          <rect x="25" y="40" width="50" height="60" fill="var(--panel-bg)" stroke="var(--border-color)" strokeWidth="2" />

          {/* Front wing */}
          <rect x="20" y="35" width="60" height="3" fill="var(--panel-bg)" stroke="var(--border-color)" strokeWidth="1" />

          {/* Rear wing */}
          <rect x="20" y="102" width="60" height="3" fill="var(--panel-bg)" stroke="var(--border-color)" strokeWidth="1" />

          {/* Engine (center of car) */}
          <circle
            cx="50"
            cy="70"
            r="8"
            className={`damage-indicator ${getEngineDamageClass(damage.engineWarnings)}`}
          />
          <text x="50" y="73" textAnchor="middle" fontSize="6" fill="var(--text-primary)">E</text>

          {/* Wheels */}
          {/* LF */}
          <rect
            x="15"
            y="45"
            width="8"
            height="12"
            className={`damage-indicator ${getDamageClass(damage.wheels.LF)}`}
          />
          <text x="19" y="52" textAnchor="middle" fontSize="5" fill="var(--text-primary)">LF</text>

          {/* RF */}
          <rect
            x="77"
            y="45"
            width="8"
            height="12"
            className={`damage-indicator ${getDamageClass(damage.wheels.RF)}`}
          />
          <text x="81" y="52" textAnchor="middle" fontSize="5" fill="var(--text-primary)">RF</text>

          {/* LR */}
          <rect
            x="15"
            y="83"
            width="8"
            height="12"
            className={`damage-indicator ${getDamageClass(damage.wheels.LR)}`}
          />
          <text x="19" y="90" textAnchor="middle" fontSize="5" fill="var(--text-primary)">LR</text>

          {/* RR */}
          <rect
            x="77"
            y="83"
            width="8"
            height="12"
            className={`damage-indicator ${getDamageClass(damage.wheels.RR)}`}
          />
          <text x="81" y="90" textAnchor="middle" fontSize="5" fill="var(--text-primary)">RR</text>
        </svg>
      </div>

      <div className="damage-status">
        {damage.engineWarnings !== 0 && (
          <div className="damage-warning critical">
            {parseEngineWarnings(damage.engineWarnings)}
          </div>
        )}
        {damage.towTime > 0 && (
          <div className="damage-warning critical">
            Severe Damage - Tow Required
          </div>
        )}
        {damage.incidents !== 0 && (
          <div className="damage-info">
            Incidents: {telemetry.incidents}x
          </div>
        )}
      </div>
    </div>
  )
}

export default Damage
