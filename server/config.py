"""Configuration settings for the iRacing telemetry server."""

import os
from dotenv import load_dotenv

load_dotenv()

# WebSocket server settings
WS_HOST = os.getenv("WS_HOST", "0.0.0.0")
WS_PORT = int(os.getenv("WS_PORT", "8080"))

# Telemetry update intervals (in seconds)
TELEMETRY_INTERVAL = float(os.getenv("TELEMETRY_INTERVAL_MS", "100")) / 1000
SESSION_INTERVAL = float(os.getenv("SESSION_INTERVAL_MS", "1000")) / 1000

# iRacing SDK settings
SDK_CONNECTION_RETRY_INTERVAL = 5.0  # seconds between connection attempts
