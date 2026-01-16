import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import './PedalChart.css'

function PedalChart({ lapData = [], compareLaps = [], title = 'Pedal Inputs', onFullscreen, isFullscreen = false }) {
  const compareColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24']

  if (!lapData || lapData.length === 0) {
    return (
      <div className="pedal-chart-empty">
        <span className="label">{title}</span>
        <span className="empty-message">Complete a lap to see pedal inputs</span>
      </div>
    )
  }

  // Create unified data structure with all laps
  const unifiedData = lapData.map(sample => ({
    distPct: (sample.distPct || 0) * 100,
    throttle: sample.throttle || 0,
    brake: sample.brake || 0,
    clutch: sample.clutch || 0,
  }))

  // Add comparison lap data by interpolating at current lap's distance points
  compareLaps.forEach((compareLap, lapIndex) => {
    const throttleKey = `throttle_lap${compareLap.lap}`
    const brakeKey = `brake_lap${compareLap.lap}`

    unifiedData.forEach((point) => {
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

      point[throttleKey] = closestSample?.throttle || 0
      point[brakeKey] = closestSample?.brake || 0
    })
  })

  return (
    <div className="pedal-chart" onClick={onFullscreen} style={{ cursor: onFullscreen ? 'pointer' : 'default', flex: isFullscreen ? 1 : 'none', display: 'flex', flexDirection: 'column' }}>
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
            domain={[0, 1]}
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            stroke="var(--text-muted)"
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--panel-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
            }}
            formatter={(value, name) => {
              const displayValue = `${(value * 100).toFixed(0)}%`
              if (name.includes('throttle')) return [displayValue, name.replace('throttle_', 'Throttle ')]
              if (name.includes('brake')) return [displayValue, name.replace('brake_', 'Brake ')]
              return [displayValue, name]
            }}
            labelFormatter={(label) => `${label.toFixed(1)}%`}
          />
          <Legend
            wrapperStyle={{ color: 'var(--text-primary)', fontSize: '12px' }}
            formatter={(value) => {
              if (value.includes('throttle_lap')) return value.replace('throttle_lap', 'Throttle L')
              if (value.includes('brake_lap')) return value.replace('brake_lap', 'Brake L')
              return value
            }}
          />
          {/* Current lap */}
          <Line
            type="monotone"
            dataKey="throttle"
            stroke="var(--accent-green)"
            dot={false}
            strokeWidth={2}
            name="Throttle"
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="brake"
            stroke="var(--accent-red)"
            dot={false}
            strokeWidth={2}
            name="Brake"
            isAnimationActive={false}
          />
          {/* Comparison laps - throttle */}
          {compareLaps.map((compareLap, i) => (
            <Line
              key={`throttle_${compareLap.lap}`}
              type="monotone"
              dataKey={`throttle_lap${compareLap.lap}`}
              stroke={compareColors[i % compareColors.length]}
              dot={false}
              strokeWidth={1.5}
              opacity={0.5}
              isAnimationActive={false}
              name={`throttle_lap${compareLap.lap}`}
              strokeDasharray="3 3"
            />
          ))}
          {/* Comparison laps - brake */}
          {compareLaps.map((compareLap, i) => (
            <Line
              key={`brake_${compareLap.lap}`}
              type="monotone"
              dataKey={`brake_lap${compareLap.lap}`}
              stroke={compareColors[i % compareColors.length]}
              dot={false}
              strokeWidth={1.5}
              opacity={0.7}
              isAnimationActive={false}
              name={`brake_lap${compareLap.lap}`}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default PedalChart
