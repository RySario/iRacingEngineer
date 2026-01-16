import { useTelemetry } from '../../contexts/TelemetryContext'
import { useMemo } from 'react'
import './TrackMap.css'

function TrackMap() {
  const { telemetry, session, trackMapData } = useTelemetry()

  if (!telemetry) {
    return <div className="track-map-empty">Waiting for data...</div>
  }

  const lapDistPct = telemetry.lapDistPct || 0

  // Process track map data to create SVG path
  const { trackPath, viewBox, playerPos } = useMemo(() => {
    if (!trackMapData || trackMapData.length < 10) {
      // Fallback to oval if no track data
      const angle = lapDistPct * 2 * Math.PI - Math.PI / 2
      return {
        trackPath: null,
        viewBox: "0 0 200 120",
        playerPos: {
          x: 100 + 85 * Math.cos(angle),
          y: 60 + 45 * Math.sin(angle)
        }
      }
    }

    // Find min/max lat/lon to normalize coordinates
    const lats = trackMapData.map(p => p.lat)
    const lons = trackMapData.map(p => p.lon)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLon = Math.min(...lons)
    const maxLon = Math.max(...lons)

    const latRange = maxLat - minLat
    const lonRange = maxLon - minLon

    // Normalize to 0-200 range for SVG, maintaining aspect ratio
    const scale = Math.min(180 / latRange, 180 / lonRange)
    const normalize = (lat, lon) => ({
      x: 10 + (lon - minLon) * scale,
      y: 10 + (maxLat - lat) * scale // Flip Y axis
    })

    // Create path
    const points = trackMapData.map(p => normalize(p.lat, p.lon))
    const pathD = points.reduce((path, point, i) => {
      if (i === 0) return `M ${point.x} ${point.y}`
      return `${path} L ${point.x} ${point.y}`
    }, '')

    // Find player position
    const currentPos = telemetry.trackPosition
    let playerPosition = points[0]
    if (currentPos && currentPos.lat && currentPos.lon) {
      playerPosition = normalize(currentPos.lat, currentPos.lon)
    }

    return {
      trackPath: pathD,
      viewBox: "0 0 200 200",
      playerPos: playerPosition
    }
  }, [trackMapData, lapDistPct, telemetry.trackPosition])

  // Get other cars positions (simplified for now)
  const otherCars = session?.standings?.slice(0, 15).filter(
    (driver) => driver.position !== telemetry.position
  ) || []

  return (
    <div className="track-map">
      <span className="label">Track Map {trackMapData.length < 10 && "(collecting...)"}</span>
      <svg viewBox={viewBox} className="track-map-svg">
        {/* Track outline */}
        {trackPath ? (
          <path
            d={trackPath}
            fill="none"
            stroke="var(--border-color)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <ellipse
            cx="100"
            cy="60"
            rx="85"
            ry="45"
            fill="none"
            stroke="var(--border-color)"
            strokeWidth="3"
          />
        )}

        {/* Player position */}
        <circle
          cx={playerPos.x}
          cy={playerPos.y}
          r="5"
          fill="var(--accent-blue)"
          stroke="white"
          strokeWidth="1"
        />

        {/* Player indicator ring */}
        <circle
          cx={playerPos.x}
          cy={playerPos.y}
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
