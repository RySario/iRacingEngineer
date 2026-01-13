import { useTelemetry } from './contexts/TelemetryContext'
import ConnectionStatus from './components/ConnectionStatus/ConnectionStatus'
import Telemetry from './components/Telemetry/Telemetry'
import Timing from './components/Timing/Timing'
import FuelStrategy from './components/FuelStrategy/FuelStrategy'
import Standings from './components/Standings/Standings'

function App() {
  const { connectionStatus, iRacingConnected, session } = useTelemetry()

  return (
    <div className="app">
      <header className="app-header">
        <h1>Race Engineer Dashboard</h1>
        <div className="header-info">
          {session && (
            <>
              <span className="track-name">{session.trackName}</span>
              <span className="driver-name">{session.driverName}</span>
              <span className="car-name">{session.carName}</span>
            </>
          )}
        </div>
        <ConnectionStatus
          wsConnected={connectionStatus === 'connected'}
          iRacingConnected={iRacingConnected}
        />
      </header>

      <main className="dashboard-grid">
        <section className="panel telemetry-panel">
          <h2>Telemetry</h2>
          <Telemetry />
        </section>

        <section className="panel timing-panel">
          <h2>Timing</h2>
          <Timing />
        </section>

        <section className="panel fuel-panel">
          <h2>Fuel Strategy</h2>
          <FuelStrategy />
        </section>

        <section className="panel standings-panel">
          <h2>Standings</h2>
          <Standings />
        </section>
      </main>
    </div>
  )
}

export default App
