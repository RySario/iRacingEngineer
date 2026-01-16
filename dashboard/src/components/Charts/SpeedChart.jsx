import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import './SpeedChart.css'

function SpeedChart({ lapData = [], compareLaps = [], title = 'Speed (km/h)', onFullscreen, isFullscreen = false }) {
  const compareColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7']

  if (!lapData || lapData.length === 0) {
    return (
      <div className="speed-chart-empty">
        <span className="label">{title}</span>
        <span className="empty-message">Complete a lap to see speed trace</span>
      </div>
    )
  }

  // Create unified data structure with all laps
  // Start with current lap data
  const unifiedData = lapData.map(sample => ({
    distPct: (sample.distPct || 0) * 100,
    currentLap: (sample.speed || 0) * 3.6, // Convert m/s to km/h
  }))

  // Add comparison lap data by interpolating at current lap's distance points
  compareLaps.forEach((compareLap, lapIndex) => {
    const compareKey = `lap${compareLap.lap}`

    unifiedData.forEach((point, i) => {
      // Find closest data point in comparison lap
      const targetDist = point.distPct / 100
      let closestSample = compareLap.data[0]
      let minDiff = Math.abs((compareLap.data[0]?.distPct || 0) - targetDist)

      for (const sample of compareLap.data) {
        const diff = Math.abs((sample.distPct || 0) - targetDist)
        if (diff < minDiff) {
          minDiff = diff
          closestSample = sample
        }
      }

      point[compareKey] = (closestSample?.speed || 0) * 3.6
    })
  })

  return (
    <div className="speed-chart" onClick={onFullscreen} style={{ cursor: onFullscreen ? 'pointer' : 'default', flex: isFullscreen ? 1 : 'none', display: 'flex', flexDirection: 'column' }}>
      <span className="label">{title}</span>
      <ResponsiveContainer width="100%" height={isFullscreen ? '100%' : 200}>
        <LineChart data={unifiedData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
          <XAxis
            dataKey="distPct"
            type="number"
            domain={[0, 100]}
            tickFormatter={(v) => `${v.toFixed(0)}%`}
            stroke="var(--text-muted)"
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            allowDataOverflow={false}
          />
          <YAxis
            stroke="var(--text-muted)"
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--panel-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
            }}
            formatter={(value, name) => {
              if (name === 'currentLap') return [`${value.toFixed(1)} km/h`, 'Current']
              return [`${value.toFixed(1)} km/h`, name]
            }}
            labelFormatter={(label) => `${label.toFixed(1)}%`}
          />
          <Line
            type="monotone"
            dataKey="currentLap"
            stroke="var(--accent-blue)"
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
            name="Current Lap"
          />
          {compareLaps.map((compareLap, i) => (
            <Line
              key={compareLap.lap}
              type="monotone"
              dataKey={`lap${compareLap.lap}`}
              stroke={compareColors[i % compareColors.length]}
              dot={false}
              strokeWidth={1.5}
              opacity={0.7}
              isAnimationActive={false}
              name={`Lap ${compareLap.lap}`}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SpeedChart
