"""Main entry point for the iRacing telemetry server."""

import asyncio
import signal
import sys
import os
import platform

# Add the server directory to Python path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Fix for Windows asyncio event loop
if platform.system() == 'Windows':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from websocket import WebSocketServer


def main():
    """Run the iRacing telemetry server."""
    server = WebSocketServer()

    # Handle graceful shutdown
    def shutdown_handler(signum, frame):
        print("\nShutting down server...")
        server.stop()
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown_handler)
    signal.signal(signal.SIGTERM, shutdown_handler)

    print("=" * 50)
    print("iRacing Race Engineer Telemetry Server")
    print("=" * 50)
    print()
    print("Make sure iRacing is running before starting.")
    print("Press Ctrl+C to stop the server.")
    print()

    try:
        asyncio.run(server.start())
    except KeyboardInterrupt:
        print("\nServer stopped.")
    except Exception as e:
        print(f"\nError starting server: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
