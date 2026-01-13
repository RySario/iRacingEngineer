# iRacing Race Engineer Dashboard

## Project Overview

A real-time telemetry dashboard for iRacing that allows a remote race engineer to view live data from an ongoing race session. The driver runs a Python server that reads from the iRacing SDK and streams data via WebSocket to a React dashboard viewed by the race engineer.

## Architecture

```
Driver's PC                          Race Engineer's PC
┌─────────────────────┐              ┌─────────────────────┐
│  iRacing Game       │              │  React Dashboard    │
│        │            │              │        ▲            │
│        ▼            │   Tailscale  │        │            │
│  Python Server ─────┼──────────────┼────────┘            │
│  (pyirsdk + WS)     │   WebSocket  │                     │
└─────────────────────┘              └─────────────────────┘
```

## Tech Stack

- **Backend:** Python 3.10+
  - `pyirsdk` - iRacing SDK wrapper
  - `websockets` - WebSocket server
  - `asyncio` - Async event loop

- **Frontend:** React 18+
  - Vite - Build tool
  - WebSocket API - Real-time communication
  - CSS Modules or Tailwind - Styling (TBD)

- **Networking:** Tailscale VPN mesh

## Project Structure

```
iracingDashboard/
├── CLAUDE.md                 # This file
├── README.md                 # User-facing documentation
├── .gitignore
│
├── server/                   # Python backend
│   ├── main.py              # Entry point
│   ├── config.py            # Configuration settings
│   ├── requirements.txt     # Python dependencies
│   │
│   ├── sdk/                 # iRacing SDK integration
│   │   ├── __init__.py
│   │   └── iracing_client.py
│   │
│   └── websocket/           # WebSocket server
│       ├── __init__.py
│       └── server.py
│
└── dashboard/               # React frontend
    ├── package.json
    ├── vite.config.js
    ├── index.html
    │
    └── src/
        ├── main.jsx         # React entry point
        ├── App.jsx          # Root component
        ├── App.css
        │
        ├── components/      # UI components
        │   ├── Telemetry/
        │   ├── Standings/
        │   ├── Timing/
        │   └── FuelStrategy/
        │
        ├── hooks/           # Custom React hooks
        │   └── useWebSocket.js
        │
        └── contexts/        # React contexts
            └── TelemetryContext.jsx
```

## Common Commands

### Server (from /server directory)

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Activate virtual environment (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
python main.py
```

### Dashboard (from /dashboard directory)

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Key Data Structures

### Telemetry Packet (sent every 100ms)

```json
{
  "type": "telemetry",
  "timestamp": 1234567890,
  "data": {
    "speed": 65.5,
    "rpm": 7200,
    "gear": 4,
    "throttle": 1.0,
    "brake": 0.0,
    "fuel": 45.2,
    "fuelPerLap": 2.8,
    "lapCurrentTime": 82.456,
    "lapDelta": -0.234,
    "tireTemps": {
      "LF": [85, 90, 88],
      "RF": [86, 91, 89],
      "LR": [82, 85, 83],
      "RR": [83, 86, 84]
    }
  }
}
```

### Session Packet (sent every 1s or on change)

```json
{
  "type": "session",
  "timestamp": 1234567890,
  "data": {
    "sessionType": "Race",
    "sessionTime": 1234.5,
    "sessionTimeRemain": 3600.0,
    "flagState": "green",
    "position": 5,
    "lapsCompleted": 12,
    "lapsRemaining": 38,
    "standings": [...]
  }
}
```

## Environment Variables

### Server (.env)

```
WS_HOST=0.0.0.0
WS_PORT=8080
TELEMETRY_INTERVAL_MS=100
SESSION_INTERVAL_MS=1000
```

### Dashboard (.env)

```
VITE_WS_URL=ws://100.x.x.x:8080
```

## Development Guidelines

1. **SDK Reading:** The iRacing SDK can only be read when iRacing is running. Handle disconnection gracefully.

2. **Data Frequency:** Telemetry updates at 60Hz from SDK, but we throttle to 10Hz (100ms) for network efficiency.

3. **Connection State:** Dashboard should clearly indicate connection status and handle reconnection.

4. **Error Handling:** Both server and client should handle errors gracefully without crashing.

## Tailscale Setup

1. Both driver and race engineer install Tailscale
2. Both join the same Tailscale network (tailnet)
3. Driver notes their Tailscale IP (100.x.x.x)
4. Race engineer connects dashboard to driver's Tailscale IP

## Important Notes

- The server MUST run on the same PC as iRacing (SDK reads shared memory)
- iRacing must be running for telemetry data to be available
- Tailscale IPs are stable, but verify before each session
- WebSocket port 8080 should be accessible (no firewall blocking on Tailscale interface)
