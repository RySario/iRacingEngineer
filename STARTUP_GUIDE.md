# iRacing Race Engineer Dashboard - Startup Guide

Quick reference guide for getting the telemetry dashboard up and running for race sessions.

## Prerequisites

### Both Driver and Race Engineer

- **Tailscale installed and running** on both computers
  - Download: https://tailscale.com/download
  - Make sure you're both logged in and on the same tailnet
  - Verify with: `tailscale status` (you should see each other's machines)

### Driver (Server Side)

- **iRacing installed** and ready to launch
- **Python 3.x** installed
- **Virtual environment set up** (one-time setup already done)

### Race Engineer (Dashboard Side)

- **Node.js** installed
- **Dependencies installed** (one-time setup already done)

---

## Step 1: Driver - Start the Server

**Open PowerShell or Command Prompt**

```bash
# Navigate to the server directory
cd C:\Users\sario\OneDrive\Desktop\Projects\iracingDashboard\server

# Activate virtual environment
venv\Scripts\activate.bat

# Start the server
python main.py
```

**Expected Output:**
```
==================================================
iRacing Race Engineer Telemetry Server
==================================================

Make sure iRacing is running before starting.
Press Ctrl+C to stop the server.

Starting iRacing Telemetry Server on ws://0.0.0.0:8080
Server is ready for connections...

Waiting for iRacing...
Waiting for iRacing...
```

**Launch iRacing** - Once you're in a session, you should see:
```
Connected to iRacing!
```

**Leave the server running** - Don't close this window during the race session.

---

## Step 2: Driver - Get Your Tailscale IP

**In a new terminal window:**

```bash
tailscale ip -4
```

**Example output:**
```
100.110.112.71
```

**Share this IP with your race engineer** via Discord, text, etc.

---

## Step 3: Race Engineer - Configure and Start Dashboard

**Open Terminal**

```bash
# Navigate to the dashboard directory
cd /path/to/iracingDashboard/dashboard

# Verify/update the .env file with driver's Tailscale IP
echo "VITE_WS_URL=ws://100.110.112.71:8080" > .env
```

Replace `100.110.112.71` with the driver's actual Tailscale IP.

**Start the dashboard:**

```bash
npm run dev
```

**Expected Output:**
```
  VITE v5.4.21  ready in 203 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://172.20.11.192:3000/
```

**Open your browser** and go to: **http://localhost:3000**

---

## Step 4: Verify Connection

### On the Dashboard (Race Engineer)

Look for the connection indicators in the top-right corner:

- **Server**: Should turn **GREEN** when connected to the driver's server
- **iRacing**: Should turn **GREEN** when the driver is in an iRacing session

All panels should show live data:
- **Telemetry**: Speed, RPM, gear, throttle/brake, tire temps
- **Timing**: Current lap, delta, position
- **Fuel Strategy**: Fuel level, consumption, laps remaining
- **Standings**: Live race order

### On the Server (Driver)

When the race engineer connects, you should see:
```
Client connected. Total clients: 1
```

---

## Troubleshooting

### "Waiting for data..." on all panels

**Check:**
1. Is the server running on the driver's PC?
2. Is iRacing running and in a session?
3. Is the `.env` file on the dashboard side using the correct Tailscale IP?
4. Did you restart the dashboard after updating `.env`?

### Connection indicators show RED

**Server (RED):**
- Driver's server isn't running
- Wrong Tailscale IP in `.env` file
- Firewall blocking port 8080 (run as Admin on Windows):
  ```bash
  New-NetFirewallRule -DisplayName "iRacing Telemetry" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow
  ```

**iRacing (RED):**
- iRacing isn't running on the driver's PC
- Driver needs to be in a test session or race (not just menus)

### Can't ping Tailscale IP

```bash
# Race engineer: test connection to driver
ping DRIVER_TAILSCALE_IP

# Both: verify Tailscale status
tailscale status
```

Make sure both machines appear in `tailscale status` output.

---

## Shutting Down

### Driver (Server)

1. Press `Ctrl+C` in the server terminal
2. Type `deactivate` to exit the virtual environment
3. Close the terminal

### Race Engineer (Dashboard)

1. Press `Ctrl+C` in the dashboard terminal
2. Close the browser tab
3. Close the terminal

---

## Quick Commands Reference

### Driver (Windows)

```bash
# Start server
cd C:\Users\sario\OneDrive\Desktop\Projects\iracingDashboard\server
venv\Scripts\activate.bat
python main.py

# Get Tailscale IP
tailscale ip -4

# Check Tailscale status
tailscale status
```

### Race Engineer (Mac)

```bash
# Update .env with driver's IP
cd /path/to/iracingDashboard/dashboard
echo "VITE_WS_URL=ws://DRIVER_IP:8080" > .env

# Start dashboard
npm run dev

# Test connection
ping DRIVER_TAILSCALE_IP
nc -zv DRIVER_TAILSCALE_IP 8080
```

---

## Tips for Race Day

1. **Test before the race**: Start everything 10-15 minutes early to ensure connectivity
2. **Keep server running**: Driver should not close the server window during the session
3. **Browser performance**: Race engineer should close other tabs/apps for best performance
4. **Voice communication**: Use Discord/voice for quick calls during races
5. **Stable connection**: Make sure both have stable internet connections

---

## Need Help?

- Check the main `CLAUDE.md` file for detailed technical documentation
- Check the GitHub repository for updates
- Review server logs for error messages

---

**Now go race! 🏁**
