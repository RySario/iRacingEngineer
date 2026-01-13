import { useTelemetry } from '../../contexts/TelemetryContext'
import './Telemetry.css'

function Telemetry() {
  const { telemetry } = useTelemetry()

  if (!telemetry) {
    return <div className="telemetry-empty">Waiting for telemetry data...</div>
  }

  const speedKmh = (telemetry.speed * 3.6).toFixed(0)
  const speedMph = (telemetry.speed * 2.237).toFixed(0)

  return (
    <div className="telemetry">
      <div className="telemetry-row">
        <div className="telemetry-item speed">
          <span className="label">Speed</span>
          <span className="value-large">{speedKmh}</span>
          <span className="unit">km/h</span>
        </div>

        <div className="telemetry-item rpm">
          <span className="label">RPM</span>
          <span className="value-large">{telemetry.rpm?.toFixed(0) || '0'}</span>
        </div>

        <div className="telemetry-item gear">
          <span className="label">Gear</span>
          <span className="value-large gear-value">
            {telemetry.gear === 0 ? 'N' : telemetry.gear === -1 ? 'R' : telemetry.gear}
          </span>
        </div>
      </div>

      <div className="telemetry-row inputs">
        <div className="input-bar throttle">
          <span className="label">Throttle</span>
          <div className="bar-container">
            <div
              className="bar-fill"
              style={{ width: `${(telemetry.throttle || 0) * 100}%` }}
            ></div>
          </div>
          <span className="value-small">{((telemetry.throttle || 0) * 100).toFixed(0)}%</span>
        </div>

        <div className="input-bar brake">
          <span className="label">Brake</span>
          <div className="bar-container">
            <div
              className="bar-fill"
              style={{ width: `${(telemetry.brake || 0) * 100}%` }}
            ></div>
          </div>
          <span className="value-small">{((telemetry.brake || 0) * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div className="telemetry-row tires">
        <span className="label">Tire Temps (I/M/O)</span>
        <div className="tire-grid">
          {['LF', 'RF', 'LR', 'RR'].map((tire) => {
            const temps = telemetry.tireTemps?.[tire]
            if (!temps) return (
              <div key={tire} className="tire-item">
                <span className="tire-label">{tire}</span>
                <div className="tire-temps">
                  <span>--</span>
                </div>
              </div>
            )

            // Reorder temps to Inner/Middle/Outer
            // Left tires (LF, LR): [L, C, R] -> [R, C, L] (Right=Inner, Center=Middle, Left=Outer)
            // Right tires (RF, RR): [L, C, R] -> [L, C, R] (Left=Inner, Center=Middle, Right=Outer)
            const isLeftTire = tire === 'LF' || tire === 'LR'
            const orderedTemps = isLeftTire ? [temps[2], temps[1], temps[0]] : temps

            return (
              <div key={tire} className="tire-item">
                <span className="tire-label">{tire}</span>
                <div className="tire-temps">
                  {orderedTemps.map((temp, i) => (
                    <span
                      key={i}
                      className={`tire-temp ${getTempClass(temp)}`}
                    >
                      {temp?.toFixed(0) || '--'}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function getTempClass(temp) {
  if (!temp) return ''
  if (temp < 70) return 'cold'
  if (temp > 110) return 'hot'
  return 'optimal'
}

export default Telemetry
