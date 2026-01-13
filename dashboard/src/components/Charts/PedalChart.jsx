import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import './PedalChart.css'

function PedalChart({ lapData = [], compareLaps = [], title = 'Pedal Inputs' }) {
  // Prepare data with percentage values
  const chartData = lapData.map(sample => ({
    distPct: (sample.distPct || 0) * 100,
    throttle: sample.throttle || 0,
    brake: sample.brake || 0,
    clutch: sample.clutch || 0,
  }))

  if (!chartData || chartData.length === 0) {
    return (
      <div className="pedal-chart-empty">
        <span className="label">{title}</span>
        <span className="empty-message">Complete a lap to see pedal inputs</span>
      </div>
    )
  }

  return (
    <div className="pedal-chart">
      <span className="label">{title}</span>
      <ResponsiveContainer width="100%" height={150}>
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
            formatter={(value) => `${(value * 100).toFixed(0)}%`}
            labelFormatter={(label) => `${label.toFixed(1)}%`}
          />
          <Legend
            wrapperStyle={{ color: 'var(--text-primary)', fontSize: '12px' }}
          />
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
          <Line
            type="monotone"
            dataKey="clutch"
            stroke="var(--accent-yellow)"
            dot={false}
            strokeWidth={1.5}
            name="Clutch"
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default PedalChart
