import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts'

/**
 * Reusable Scatter Chart Component
 * 
 * @param {Array} data - Chart data array with x, y, and size properties
 * @param {Array} scatters - Array of scatter definitions: { dataKey, fill, name }
 * @param {string} xAxisKey - Key for X-axis data (default: 'x')
 * @param {string} yAxisKey - Key for Y-axis data (default: 'y')
 * @param {string} sizeKey - Key for bubble size (default: 'size')
 * @param {string} xAxisLabel - Label for X-axis
 * @param {string} yAxisLabel - Label for Y-axis
 * @param {boolean} showLegend - Show legend (default: true)
 * @param {boolean} showGrid - Show grid (default: true)
 * @param {function} customTooltip - Custom tooltip formatter
 * @param {number} height - Chart height (default: 300)
 * @param {number} width - Chart width (default: 100%)
 * @param {number} bubbleScale - Scale for bubble size (default: 1)
 */
export function ScatterChartComponent({
  data,
  scatters = [],
  xAxisKey = 'x',
  yAxisKey = 'y',
  sizeKey = 'size',
  xAxisLabel,
  yAxisLabel,
  showLegend = true,
  showGrid = true,
  customTooltip,
  height = 300,
  width = '100%',
  bubbleScale = 1
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
      <ScatterChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis 
          type="number"
          dataKey={xAxisKey}
          label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottomRight', offset: -5 } : undefined}
        />
        <YAxis 
          type="number"
          dataKey={yAxisKey}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
        />
        <Tooltip formatter={defaultTooltip} cursor={{ strokeDasharray: '3 3' }} />
        {showLegend && <Legend />}
        {scatters.map((scatterConfig, index) => (
          <Scatter
            key={index}
            name={scatterConfig.name || scatterConfig.dataKey}
            data={data}
            fill={scatterConfig.fill || `hsl(${index * 360 / scatters.length}, 70%, 50%)`}
          >
            {data.map((entry, idx) => (
              <Cell
                key={`cell-${idx}`}
                fill={scatterConfig.fill || `hsl(${index * 360 / scatters.length}, 70%, 50%)`}
                r={(entry[sizeKey] || 5) * bubbleScale}
              />
            ))}
          </Scatter>
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  )
}
