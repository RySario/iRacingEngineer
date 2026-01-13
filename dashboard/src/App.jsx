import { useTelemetry } from './contexts/TelemetryContext'
import ConnectionStatus from './components/ConnectionStatus/ConnectionStatus'
import Telemetry from './components/Telemetry/Telemetry'
import Timing from './components/Timing/Timing'
import FuelStrategy from './components/FuelStrategy/FuelStrategy'
import Standings from './components/Standings/Standings'
import SteeringWheel from './components/SteeringWheel/SteeringWheel'
import Weather from './components/Weather/Weather'
import Damage from './components/Damage/Damage'
import TrackMap from './components/TrackMap/TrackMap'
import SectorTimes from './components/SectorTimes/SectorTimes'
import DriverGaps from './components/DriverGaps/DriverGaps'
import LapComparison from './components/LapComparison/LapComparison'

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
        {/* Row 1 */}
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

        <section className="panel weather-panel">
          <h2>Weather</h2>
          <Weather />
        </section>

        <section className="panel damage-panel">
          <h2>Damage</h2>
          <Damage />
        </section>

        <section className="panel steering-panel">
          <h2>Steering</h2>
          <SteeringWheel />
        </section>

        {/* Row 2 */}
        <section className="panel track-map-panel">
          <h2>Track Position</h2>
          <TrackMap />
        </section>

        <section className="panel sector-panel">
          <h2>Sectors</h2>
          <SectorTimes />
        </section>

        <section className="panel gaps-panel">
          <h2>Driver Gaps</h2>
          <DriverGaps />
        </section>

        {/* Row 3 */}
        <section className="panel standings-panel">
          <h2>Standings</h2>
          <Standings />
        </section>

        <section className="panel comparison-panel">
          <h2>Lap Comparison</h2>
          <LapComparison />
        </section>
      </main>
    </div>
  )
}

export default App
