import { useTelemetry } from '../../contexts/TelemetryContext'
import './SectorTimes.css'

function SectorTimes() {
  const { telemetry } = useTelemetry()

  if (!telemetry || !telemetry.sectorTimes) {
    return <div className="sector-times-empty">Waiting for data...</div>
  }

  const { sectorTimes } = telemetry
  const currentSectorTimes = sectorTimes.current || [null, null, null]
  const bestSectorTimes = sectorTimes.best || [null, null, null]
  const currentSector = sectorTimes.currentSector || 0

  // Create sectors array with status
  const sectors = currentSectorTimes.map((time, index) => {
    let status = 'pending'

    if (time !== null && bestSectorTimes[index] !== null) {
      if (time === bestSectorTimes[index]) {
        status = 'purple'  // Personal best
      } else if (time < bestSectorTimes[index] * 1.01) {
        status = 'green'   // Close to best
      } else if (time < bestSectorTimes[index] * 1.03) {
        status = 'yellow'  // Within 3%
      } else {
        status = 'red'     // Slower
      }
    } else if (time !== null) {
      status = 'purple'  // First sector time is best
    }

    return {
      number: index + 1,
      time: time,
      status: status,
    }
  })

  const getSectorClass = (status) => {
    switch (status) {
      case 'purple': return 'sector-purple'   // All-time best
      case 'green': return 'sector-green'     // Session best
      case 'yellow': return 'sector-yellow'   // Personal best
      case 'red': return 'sector-red'         // Slower
      default: return 'sector-pending'
    }
  }

  const formatTime = (time) => {
    if (!time) return '--:--.---'
    const minutes = Math.floor(time / 60)
    const seconds = (time % 60).toFixed(3).padStart(6, '0')
    return `${minutes}:${seconds}`
  }

  return (
    <div className="sector-times">
      <span className="label">Sector Times</span>
      <div className="sectors">
        {sectors.map((sector) => (
          <div key={sector.number} className={`sector-item ${getSectorClass(sector.status)}`}>
            <span className="sector-label">S{sector.number}</span>
            <span className="sector-time mono">{formatTime(sector.time)}</span>
          </div>
        ))}
      </div>
      <div className="sector-legend">
        <div className="legend-item">
          <span className="legend-color purple"></span>
          <span className="legend-label">All-time</span>
        </div>
        <div className="legend-item">
          <span className="legend-color green"></span>
          <span className="legend-label">Session</span>
        </div>
        <div className="legend-item">
          <span className="legend-color yellow"></span>
          <span className="legend-label">Personal</span>
        </div>
      </div>
    </div>
  )
}

export default SectorTimes
