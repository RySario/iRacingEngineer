import './ConnectionStatus.css'

function ConnectionStatus({ wsConnected, iRacingConnected }) {
  return (
    <div className="connection-status">
      <div className={`status-indicator ${wsConnected ? 'connected' : 'disconnected'}`}>
        <span className="status-dot"></span>
        <span className="status-text">Server</span>
      </div>
      <div className={`status-indicator ${iRacingConnected ? 'connected' : 'disconnected'}`}>
        <span className="status-dot"></span>
        <span className="status-text">iRacing</span>
      </div>
    </div>
  )
}

export default ConnectionStatus
