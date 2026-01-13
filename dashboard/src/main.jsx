import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { TelemetryProvider } from './contexts/TelemetryContext.jsx'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TelemetryProvider>
      <App />
    </TelemetryProvider>
  </React.StrictMode>,
)
