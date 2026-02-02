import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

/**
 * Reusable Composed Chart Component (Bars + Lines combined)
 * 
 * @param {Array} data - Chart data array
 * @param {Array} bars - Array of bar definitions: { dataKey, fill, name }
 * @param {Array} lines - Array of line definitions: { dataKey, stroke, name, strokeWidth }
 * @param {string} xAxisKey - Key for X-axis data (default: 'name')
 * @param {string} xAxisLabel - Label for X-axis
 * @param {string} yAxisLabel - Label for Y-axis
 * @param {string} yAxis2Label - Label for secondary Y-axis (right side)
 * @param {boolean} showLegend - Show legend (default: true)
 * @param {boolean} showGrid - Show grid (default: true)
 * @param {function} customTooltip - Custom tooltip formatter
 * @param {number} height - Chart height (default: 300)
 * @param {number} width - Chart width (default: 100%)
 */
export function ComposedChartComponent({
  data,
  bars = [],
  lines = [],
  xAxisKey = 'name',
  xAxisLabel,
  yAxisLabel,
  yAxis2Label,
  showLegend = true,
  showGrid = true,
  customTooltip,
  height = 300,
  width = '100%'
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
      <ComposedChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis 
          dataKey={xAxisKey}
          label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottomRight', offset: -5 } : undefined}
        />
        <YAxis 
          yAxisId="left"
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
        />
        {yAxis2Label && (
          <YAxis 
            yAxisId="right"
            orientation="right"
            label={yAxis2Label ? { value: yAxis2Label, angle: 90, position: 'insideRight' } : undefined}
          />
        )}
        <Tooltip formatter={defaultTooltip} />
        {showLegend && <Legend />}
        
        {bars.map((barConfig, index) => (
          <Bar
            key={`bar-${index}`}
            yAxisId={barConfig.yAxisId || 'left'}
            dataKey={barConfig.dataKey}
            fill={barConfig.fill || `hsl(${index * 360 / bars.length}, 70%, 50%)`}
            name={barConfig.name || barConfig.dataKey}
          />
        ))}
        
        {lines.map((lineConfig, index) => (
          <Line
            key={`line-${index}`}
            yAxisId={lineConfig.yAxisId || 'left'}
            type="monotone"
            dataKey={lineConfig.dataKey}
            stroke={lineConfig.stroke || `hsl(${(bars.length + index) * 360 / (bars.length + lines.length)}, 70%, 50%)`}
            strokeWidth={lineConfig.strokeWidth || 2}
            name={lineConfig.name || lineConfig.dataKey}
            connectNulls
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
