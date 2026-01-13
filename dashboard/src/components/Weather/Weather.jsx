import { useTelemetry } from '../../contexts/TelemetryContext'
import './Weather.css'

function Weather() {
  const { telemetry, session } = useTelemetry()

  if (!telemetry?.weather || !session) {
    return <div className="weather-empty">Waiting for weather data...</div>
  }

  const weather = telemetry.weather

  const getSkiesLabel = (skies) => {
    const skiesMap = {
      0: 'Clear',
      1: 'Partly Cloudy',
      2: 'Mostly Cloudy',
      3: 'Overcast',
    }
    return skiesMap[skies] || 'Unknown'
  }

  const getWindDirection = (degrees) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    const index = Math.round(((degrees % 360) / 45)) % 8
    return directions[index]
  }

  const getWeatherIcon = (skies) => {
    const iconMap = {
      0: '☀️',
      1: '⛅',
      2: '☁️',
      3: '☁️',
    }
    return iconMap[skies] || '?'
  }

  return (
    <div className="weather">
      <div className="weather-header">
        <span className="weather-icon">{getWeatherIcon(weather.skies)}</span>
        <span className="weather-condition">{getSkiesLabel(weather.skies)}</span>
      </div>

      <div className="weather-details">
        <div className="weather-row">
          <span className="label">Air Temp</span>
          <span className="value-small mono">{(session.airTemp || 0).toFixed(1)}°C</span>
        </div>

        <div className="weather-row">
          <span className="label">Track Temp</span>
          <span className="value-small mono">{(session.trackTemp || 0).toFixed(1)}°C</span>
        </div>

        <div className="weather-row">
          <span className="label">Wind</span>
          <span className="value-small mono">
            {(weather.windSpeed || 0).toFixed(1)} m/s {getWindDirection(weather.windDir)}
          </span>
        </div>

        <div className="weather-row">
          <span className="label">Humidity</span>
          <span className="value-small mono">{((weather.humidity || 0) * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  )
}

export default Weather
