import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

/**
 * Reusable Line Chart Component
 * 
 * @param {Array} data - Chart data array
 * @param {Array} lines - Array of line definitions: { dataKey, stroke, name, strokeWidth }
 * @param {string} xAxisKey - Key for X-axis data (default: 'year')
 * @param {string} xAxisLabel - Label for X-axis
 * @param {string} yAxisLabel - Label for Y-axis
 * @param {boolean} showLegend - Show legend (default: true)
 * @param {boolean} showGrid - Show grid (default: true)
 * @param {function} customTooltip - Custom tooltip formatter
 * @param {number} height - Chart height (default: 300)
 * @param {number} width - Chart width (default: 100%)
 * @param {boolean} showDots - Show dots on lines (default: false)
 */
export function LineChartComponent({
  data,
  lines = [],
  xAxisKey = 'year',
  xAxisLabel,
  yAxisLabel,
  showLegend = true,
  showGrid = true,
  customTooltip,
  height = 300,
  width = '100%',
  showDots = false
}) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No data available
      </div>
    )
  }

  const defaultTooltip = (value, name) => {
    if (customTooltip) return customTooltip(value, name)
    return [value, name]
  }

  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis 
          dataKey={xAxisKey}
          label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottomRight', offset: -5 } : undefined}
        />
        <YAxis 
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
        />
        <Tooltip formatter={defaultTooltip} />
        {showLegend && <Legend />}
        {lines.map((lineConfig, index) => (
          <Line
            key={index}
            type="monotone"
            dataKey={lineConfig.dataKey}
            stroke={lineConfig.stroke || `hsl(${index * 360 / lines.length}, 70%, 50%)`}
            strokeWidth={lineConfig.strokeWidth || 2}
            name={lineConfig.name || lineConfig.dataKey}
            dot={showDots}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
