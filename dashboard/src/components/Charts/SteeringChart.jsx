import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts'
import './SteeringChart.css'

function SteeringChart({ lapData = [], compareLaps = [], title = 'Steering Angle' }) {
  // Prepare data with steering angle in degrees
  const chartData = lapData.map(sample => ({
    ...sample,
    steeringAngle: ((sample.steeringAngle || 0) * (180 / Math.PI)),
    distPct: (sample.distPct || 0) * 100, // Convert to percentage
  }))

  const compareColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7']

  if (!chartData || chartData.length === 0) {
    return (
      <div className="steering-chart-empty">
        <span className="label">{title}</span>
        <span className="empty-message">Complete a lap to see steering trace</span>
      </div>
    )
  }

  return (
    <div className="steering-chart">
      <span className="label">{title}</span>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
          <XAxis
            dataKey="distPct"
            domain={[0, 100]}
            tickFormatter={(v) => `${v.toFixed(0)}%`}
            stroke="var(--text-muted)"
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
          />
          <YAxis
            stroke="var(--text-muted)"
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            domain={[-90, 90]}
          />
          <ReferenceLine y={0} stroke="var(--text-muted)" strokeDasharray="3 3" opacity={0.5} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--panel-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
            }}
            formatter={(value) => `${value.toFixed(1)}°`}
            labelFormatter={(label) => `${label.toFixed(1)}%`}
          />
          <Line
            type="monotone"
            dataKey="steeringAngle"
            stroke="var(--accent-green)"
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
          />
          {compareLaps.map((compareLap, i) => {
            const compareData = compareLap.data.map(sample => ({
              distPct: (sample.distPct || 0) * 100,
              steeringAngle: ((sample.steeringAngle || 0) * (180 / Math.PI)),
            }))
            return (
              <Line
                key={compareLap.lap}
                data={compareData}
                type="monotone"
                dataKey="steeringAngle"
                stroke={compareColors[i % compareColors.length]}
                dot={false}
                strokeWidth={1.5}
                opacity={0.7}
                isAnimationActive={false}
              />
            )
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SteeringChart
