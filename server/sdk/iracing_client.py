"""iRacing SDK client wrapper for reading telemetry data."""

import irsdk
from typing import Optional


class IRacingClient:
    """Wrapper around pyirsdk for reading iRacing telemetry."""

    def __init__(self):
        self.ir = irsdk.IRSDK()
        self._connected = False

    @property
    def is_connected(self) -> bool:
        """Check if connected to iRacing."""
        return self._connected and self.ir.is_connected

    def connect(self) -> bool:
        """Attempt to connect to iRacing.

        Returns:
            True if connection successful, False otherwise.
        """
        if self.ir.startup():
            self._connected = True
            return True
        return False

    def disconnect(self):
        """Disconnect from iRacing."""
        self.ir.shutdown()
        self._connected = False

    def get_telemetry(self) -> Optional[dict]:
        """Get current telemetry data.

        Returns:
            Dictionary of telemetry values or None if not connected.
        """
        if not self.is_connected:
            return None

        # Freeze the data buffer for consistent reads
        self.ir.freeze_var_buffer_latest()

        try:
            telemetry = {
                # Speed and engine
                "speed": self.ir["Speed"] or 0,  # m/s
                "rpm": self.ir["RPM"] or 0,
                "gear": self.ir["Gear"] or 0,

                # Inputs
                "throttle": self.ir["Throttle"] or 0,
                "brake": self.ir["Brake"] or 0,
                "clutch": self.ir["Clutch"] or 0,
                "steeringAngle": self.ir["SteeringWheelAngle"] or 0,

                # Fuel
                "fuel": self.ir["FuelLevel"] or 0,  # liters
                "fuelPercent": self.ir["FuelLevelPct"] or 0,

                # Lap timing
                "lapCurrentTime": self.ir["LapCurrentLapTime"] or 0,
                "lapBestTime": self.ir["LapBestLapTime"] or 0,
                "lapLastTime": self.ir["LapLastLapTime"] or 0,
                "lapDeltaToBest": self.ir["LapDeltaToBestLap"] or 0,
                "lapDeltaToOptimal": self.ir["LapDeltaToOptimalLap"] or 0,

                # Position
                "lap": self.ir["Lap"] or 0,
                "lapDistPct": self.ir["LapDistPct"] or 0,
                "position": self.ir["PlayerCarPosition"] or 0,
                "positionInClass": self.ir["PlayerCarClassPosition"] or 0,

                # Tire temps (inner, middle, outer for each tire)
                "tireTemps": {
                    "LF": self._get_tire_temps("LF"),
                    "RF": self._get_tire_temps("RF"),
                    "LR": self._get_tire_temps("LR"),
                    "RR": self._get_tire_temps("RR"),
                },

                # Tire wear
                "tireWear": {
                    "LF": self.ir["LFwearL"] or 0,
                    "RF": self.ir["RFwearL"] or 0,
                    "LR": self.ir["LRwearL"] or 0,
                    "RR": self.ir["RRwearL"] or 0,
                },

                # Session flags
                "sessionFlags": self.ir["SessionFlags"] or 0,

                # Incidents
                "incidents": self.ir["PlayerCarMyIncidentCount"] or 0,

                # Damage data
                "damage": {
                    "engineWarnings": self.ir["EngineWarnings"] or 0,
                    "wheels": {
                        "LF": abs(self.ir["LFshockDefl"] or 0),
                        "RF": abs(self.ir["RFshockDefl"] or 0),
                        "LR": abs(self.ir["LRshockDefl"] or 0),
                        "RR": abs(self.ir["RRshockDefl"] or 0),
                    },
                    "towTime": self.ir["PlayerCarTowTime"] or 0,
                },

                # Weather data
                "weather": {
                    "type": self.ir["WeatherType"] or 0,
                    "skies": self.ir["Skies"] or 0,
                    "windSpeed": self.ir["WindVel"] or 0,
                    "windDir": self.ir["WindDir"] or 0,
                    "humidity": self.ir["RelativeHumidity"] or 0,
                    "airDensity": self.ir["AirDensity"] or 0,
                    "fogLevel": self.ir["FogLevel"] or 0,
                },

                # Sector and position data
                "sector": self.ir["PlayerCarClassPosition"] or 0,
                "carIdxLapDistPct": list(self.ir["CarIdxLapDistPct"] or []),
                "carIdxPosition": list(self.ir["CarIdxPosition"] or []),
                "carIdxEstTime": list(self.ir["CarIdxEstTime"] or []),
            }
            return telemetry
        except Exception:
            return None

    def _get_tire_temps(self, tire: str) -> list:
        """Get tire temperatures for a specific tire.

        Args:
            tire: Tire identifier (LF, RF, LR, RR)

        Returns:
            List of [left, middle, right] temperatures in Celsius
        """
        return [
            self.ir[f"{tire}tempCL"] or 0,
            self.ir[f"{tire}tempCM"] or 0,
            self.ir[f"{tire}tempCR"] or 0,
        ]

    def get_session_info(self) -> Optional[dict]:
        """Get current session information.

        Returns:
            Dictionary of session data or None if not connected.
        """
        if not self.is_connected:
            return None

        try:
            session_info = self.ir["SessionInfo"]
            driver_info = self.ir["DriverInfo"]

            # Get current session
            session_num = self.ir["SessionNum"] or 0
            sessions = session_info.get("Sessions", [])
            current_session = sessions[session_num] if session_num < len(sessions) else {}

            return {
                "sessionType": current_session.get("SessionType", "Unknown"),
                "sessionTime": self.ir["SessionTime"] or 0,
                "sessionTimeRemain": self.ir["SessionTimeRemain"] or 0,
                "sessionLapsRemain": self.ir["SessionLapsRemain"] or 0,

                # Track info
                "trackName": session_info.get("WeekendInfo", {}).get("TrackDisplayName", "Unknown"),
                "trackLength": session_info.get("WeekendInfo", {}).get("TrackLength", "0 km"),
                "trackTemp": self.ir["TrackTemp"] or 0,
                "airTemp": self.ir["AirTemp"] or 0,

                # Driver info
                "driverName": self._get_driver_name(driver_info),
                "carName": self._get_car_name(driver_info),
                "iRating": self._get_driver_irating(driver_info),

                # Results/standings
                "standings": self._get_standings(),
            }
        except Exception:
            return None

    def _get_driver_name(self, driver_info: dict) -> str:
        """Get the player's driver name."""
        if not driver_info:
            return "Unknown"
        drivers = driver_info.get("Drivers", [])
        player_idx = driver_info.get("DriverCarIdx", 0)
        if player_idx < len(drivers):
            return drivers[player_idx].get("UserName", "Unknown")
        return "Unknown"

    def _get_car_name(self, driver_info: dict) -> str:
        """Get the player's car name."""
        if not driver_info:
            return "Unknown"
        drivers = driver_info.get("Drivers", [])
        player_idx = driver_info.get("DriverCarIdx", 0)
        if player_idx < len(drivers):
            return drivers[player_idx].get("CarScreenName", "Unknown")
        return "Unknown"

    def _get_driver_irating(self, driver_info: dict) -> int:
        """Get the player's iRating."""
        if not driver_info:
            return 0
        drivers = driver_info.get("Drivers", [])
        player_idx = driver_info.get("DriverCarIdx", 0)
        if player_idx < len(drivers):
            return drivers[player_idx].get("IRating", 0)
        return 0

    def _get_standings(self) -> list:
        """Get current session standings."""
        if not self.is_connected:
            return []

        try:
            session_info = self.ir["SessionInfo"]
            driver_info = self.ir["DriverInfo"]
            session_num = self.ir["SessionNum"] or 0

            sessions = session_info.get("Sessions", [])
            if session_num >= len(sessions):
                return []

            results = sessions[session_num].get("ResultsPositions", [])
            if not results:
                return []

            drivers = driver_info.get("Drivers", [])
            standings = []

            for result in results[:20]:  # Top 20
                car_idx = result.get("CarIdx", 0)
                driver = drivers[car_idx] if car_idx < len(drivers) else {}

                standings.append({
                    "position": result.get("Position", 0),
                    "carIdx": car_idx,
                    "driverName": driver.get("UserName", "Unknown"),
                    "carNumber": driver.get("CarNumber", ""),
                    "carName": driver.get("CarScreenName", "Unknown"),
                    "bestLapTime": result.get("FastestTime", 0),
                    "lastLapTime": result.get("LastTime", 0),
                    "lapsComplete": result.get("LapsComplete", 0),
                    "gap": result.get("Time", 0),
                    "iRating": driver.get("IRating", 0),
                })

            return standings
        except Exception:
            return []
