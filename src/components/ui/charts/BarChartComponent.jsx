import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts'

/**
 * Reusable Bar Chart Component
 * 
 * @param {Array} data - Chart data array
 * @param {Array} bars - Array of bar definitions: { dataKey, fill, name }
 * @param {string} xAxisKey - Key for X-axis data (default: 'name')
 * @param {string} xAxisLabel - Label for X-axis
 * @param {string} yAxisLabel - Label for Y-axis
 * @param {boolean} showLegend - Show legend (default: true)
 * @param {boolean} showGrid - Show grid (default: true)
 * @param {function} customTooltip - Custom tooltip formatter
 * @param {number} height - Chart height (default: 300)
 * @param {number} width - Chart width (default: 100%)
 * @param {string} layout - Layout direction: 'vertical' or 'horizontal' (default: 'vertical')
 */
export function BarChartComponent({
  data,
  bars = [],
  xAxisKey = 'name',
  xAxisLabel,
  yAxisLabel,
  showLegend = true,
  showGrid = true,
  customTooltip,
  height = 300,
  width = '100%',
  layout = 'vertical'
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

  const isHorizontal = layout === 'horizontal'

  return (
    <ResponsiveContainer width={width} height={height}>
      <BarChart 
        data={data}
        layout={isHorizontal ? 'vertical' : 'vertical'}
        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis 
          type={isHorizontal ? 'number' : 'category'}
          dataKey={isHorizontal ? undefined : xAxisKey}
          label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottomRight', offset: -5 } : undefined}
        />
        <YAxis 
          type={isHorizontal ? 'category' : 'number'}
          dataKey={isHorizontal ? xAxisKey : undefined}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
        />
        <Tooltip formatter={defaultTooltip} />
        {showLegend && <Legend />}
        {bars.map((barConfig, index) => (
          <Bar
            key={index}
            dataKey={barConfig.dataKey}
            fill={barConfig.fill || `hsl(${index * 360 / bars.length}, 70%, 50%)`}
            name={barConfig.name || barConfig.dataKey}
          >
            {barConfig.colors && barConfig.colors.map((color, idx) => (
              <Cell key={`cell-${idx}`} fill={color} />
            ))}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
