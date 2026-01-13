import { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useWebSocket } from '../hooks/useWebSocket'

const TelemetryContext = createContext(null)

export function TelemetryProvider({ children }) {
  const [telemetry, setTelemetry] = useState(null)
  const [session, setSession] = useState(null)
  const [iRacingConnected, setIRacingConnected] = useState(false)
  const [lapHistory, setLapHistory] = useState([])
  const [lapTelemetryData, setLapTelemetryData] = useState({}) // Store telemetry samples per lap
  const [isRecording, setIsRecording] = useState(false)
  const [sectorTimes, setSectorTimes] = useState([])
  const currentLapRef = useRef(0)
  const lastSectorRef = useRef(0)

  const handleMessage = useCallback((data) => {
    switch (data.type) {
      case 'telemetry':
        setTelemetry(data.data)
        break

      case 'session':
        setSession(data.data)
        break

      case 'status':
        setIRacingConnected(data.iracing_connected)
        break

      case 'connection':
        setIRacingConnected(data.iracing_connected)
        break

      default:
        break
    }
  }, [])

  const { connectionStatus, send } = useWebSocket(handleMessage)

  // Track lap completions for history
  const currentLap = telemetry?.lap
  const lastLapTime = telemetry?.lapLastTime

  useMemo(() => {
    if (lastLapTime && lastLapTime > 0 && currentLap > 1) {
      setLapHistory((prev) => {
        const lastEntry = prev[prev.length - 1]
        if (!lastEntry || lastEntry.lap !== currentLap - 1) {
          return [
            ...prev.slice(-49), // Keep last 50 laps
            {
              lap: currentLap - 1,
              time: lastLapTime,
              fuel: telemetry?.fuel,
            },
          ]
        }
        return prev
      })
    }
  }, [currentLap, lastLapTime, telemetry?.fuel])

  // Calculate fuel usage per lap
  const fuelPerLap = useMemo(() => {
    if (lapHistory.length < 2) return null

    const recentLaps = lapHistory.slice(-5)
    if (recentLaps.length < 2) return null

    let totalFuelUsed = 0
    for (let i = 1; i < recentLaps.length; i++) {
      const fuelUsed = recentLaps[i - 1].fuel - recentLaps[i].fuel
      if (fuelUsed > 0) {
        totalFuelUsed += fuelUsed
      }
    }

    return totalFuelUsed / (recentLaps.length - 1)
  }, [lapHistory])

  // Calculate laps remaining on fuel
  const lapsRemaining = useMemo(() => {
    if (!fuelPerLap || !telemetry?.fuel) return null
    return Math.floor(telemetry.fuel / fuelPerLap)
  }, [fuelPerLap, telemetry?.fuel])

  const requestSession = useCallback(() => {
    send({ type: 'request_session' })
  }, [send])

  const toggleRecording = useCallback(() => {
    const newState = !isRecording
    setIsRecording(newState)
    send({
      type: newState ? 'enable_recording' : 'disable_recording'
    })
  }, [isRecording, send])

  // Store telemetry samples for current lap for charting
  useEffect(() => {
    if (!telemetry || !telemetry.lap) return

    const lap = telemetry.lap
    const sample = {
      distPct: telemetry.lapDistPct || 0,
      speed: telemetry.speed || 0,
      throttle: telemetry.throttle || 0,
      brake: telemetry.brake || 0,
      clutch: telemetry.clutch || 0,
      steeringAngle: telemetry.steeringAngle || 0,
      rpm: telemetry.rpm || 0,
      gear: telemetry.gear || 0,
    }

    // Store sample for current lap
    setLapTelemetryData(prev => {
      const currentLapData = prev[telemetry.lap] || []

      // Only add if we're progressing through the lap (avoid duplicates)
      const lastSample = currentLapData[currentLapData.length - 1]
      if (!lastSample || telemetry.lapDistPct > lastSample.distPct + 0.001) {
        return {
          ...prev,
          [telemetry.lap]: [
            ...(prev[telemetry.lap] || []).slice(-999), // Limit to ~1000 samples per lap
            {
              distPct: telemetry.lapDistPct,
              speed: telemetry.speed,
              throttle: telemetry.throttle,
              brake: telemetry.brake,
              clutch: telemetry.clutch,
              rpm: telemetry.rpm,
              gear: telemetry.gear,
              steeringAngle: telemetry.steeringAngle,
            }
          ]
        }
      }
      return prev
    })
  }, [telemetry])

  const value = {
    telemetry,
    session,
    connectionStatus,
    iRacingConnected,
    lapHistory,
    fuelPerLap,
    lapsRemaining,
    requestSession,
    lapTelemetryData,
    isRecording,
    toggleRecording,
    sectorTimes,
  }

  return (
    <TelemetryContext.Provider value={value}>
      {children}
    </TelemetryContext.Provider>
  )
}

export function useTelemetry() {
  const context = useContext(TelemetryContext)
  if (!context) {
    throw new Error('useTelemetry must be used within a TelemetryProvider')
  }
  return context
}
