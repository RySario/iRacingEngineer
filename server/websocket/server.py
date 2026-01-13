"""WebSocket server for broadcasting iRacing telemetry."""

import asyncio
import json
import time
from typing import Set

import websockets
from websockets.server import WebSocketServerProtocol

from config import WS_HOST, WS_PORT, TELEMETRY_INTERVAL, SESSION_INTERVAL
from sdk import IRacingClient


class WebSocketServer:
    """WebSocket server that broadcasts iRacing data to connected clients."""

    def __init__(self):
        self.clients: Set[WebSocketServerProtocol] = set()
        self.ir_client = IRacingClient()
        self._running = False

    async def register(self, websocket: WebSocketServerProtocol):
        """Register a new client connection."""
        self.clients.add(websocket)
        print(f"Client connected. Total clients: {len(self.clients)}")

        # Send initial connection status
        await self._send_to_client(websocket, {
            "type": "connection",
            "status": "connected",
            "iracing_connected": self.ir_client.is_connected,
        })

    async def unregister(self, websocket: WebSocketServerProtocol):
        """Unregister a client connection."""
        self.clients.discard(websocket)
        print(f"Client disconnected. Total clients: {len(self.clients)}")

    async def _send_to_client(self, websocket: WebSocketServerProtocol, data: dict):
        """Send data to a specific client."""
        try:
            await websocket.send(json.dumps(data))
        except websockets.ConnectionClosed:
            pass

    async def broadcast(self, data: dict):
        """Broadcast data to all connected clients."""
        if not self.clients:
            return

        message = json.dumps(data)
        disconnected = set()

        for client in self.clients:
            try:
                await client.send(message)
            except websockets.ConnectionClosed:
                disconnected.add(client)

        # Clean up disconnected clients
        for client in disconnected:
            self.clients.discard(client)

    async def handler(self, websocket: WebSocketServerProtocol):
        """Handle a WebSocket connection."""
        await self.register(websocket)
        try:
            async for message in websocket:
                # Handle incoming messages from clients if needed
                try:
                    data = json.loads(message)
                    await self._handle_client_message(websocket, data)
                except json.JSONDecodeError:
                    pass
        except websockets.ConnectionClosed:
            pass
        finally:
            await self.unregister(websocket)

    async def _handle_client_message(self, websocket: WebSocketServerProtocol, data: dict):
        """Handle messages received from clients."""
        msg_type = data.get("type")

        if msg_type == "ping":
            await self._send_to_client(websocket, {"type": "pong"})
        elif msg_type == "request_session":
            # Client requesting full session info
            session_data = self.ir_client.get_session_info()
            if session_data:
                await self._send_to_client(websocket, {
                    "type": "session",
                    "timestamp": time.time(),
                    "data": session_data,
                })

    async def telemetry_loop(self):
        """Continuously broadcast telemetry data."""
        last_session_time = 0

        while self._running:
            current_time = time.time()

            # Check iRacing connection
            if not self.ir_client.is_connected:
                if not self.ir_client.connect():
                    print("Waiting for iRacing...")
                    await self.broadcast({
                        "type": "status",
                        "iracing_connected": False,
                        "message": "Waiting for iRacing...",
                    })
                    await asyncio.sleep(2)
                    continue
                else:
                    print("Connected to iRacing!")
                    await self.broadcast({
                        "type": "status",
                        "iracing_connected": True,
                        "message": "Connected to iRacing",
                    })

            # Send telemetry at high frequency
            telemetry = self.ir_client.get_telemetry()
            if telemetry:
                await self.broadcast({
                    "type": "telemetry",
                    "timestamp": current_time,
                    "data": telemetry,
                })

            # Send session info at lower frequency
            if current_time - last_session_time >= SESSION_INTERVAL:
                session_data = self.ir_client.get_session_info()
                if session_data:
                    await self.broadcast({
                        "type": "session",
                        "timestamp": current_time,
                        "data": session_data,
                    })
                last_session_time = current_time

            await asyncio.sleep(TELEMETRY_INTERVAL)

    async def start(self):
        """Start the WebSocket server."""
        self._running = True

        print(f"Starting iRacing Telemetry Server on ws://{WS_HOST}:{WS_PORT}")
        print("Server is ready for connections...")
        print()

        try:
            async with websockets.serve(self.handler, WS_HOST, WS_PORT):
                # Run telemetry broadcasting loop in the background
                await self.telemetry_loop()
        except Exception as e:
            print(f"Error starting server: {e}")
            import traceback
            traceback.print_exc()
            raise

    def stop(self):
        """Stop the server."""
        self._running = False
        self.ir_client.disconnect()
