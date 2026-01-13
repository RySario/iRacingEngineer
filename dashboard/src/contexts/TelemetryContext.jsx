import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { useWebSocket } from '../hooks/useWebSocket'

const TelemetryContext = createContext(null)

export function TelemetryProvider({ children }) {
  const [telemetry, setTelemetry] = useState(null)
  const [session, setSession] = useState(null)
  const [iRacingConnected, setIRacingConnected] = useState(false)
  const [lapHistory, setLapHistory] = useState([])

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

  const value = {
    telemetry,
    session,
    connectionStatus,
    iRacingConnected,
    lapHistory,
    fuelPerLap,
    lapsRemaining,
    requestSession,
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
