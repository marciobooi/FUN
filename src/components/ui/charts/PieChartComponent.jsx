import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

/**
 * Reusable Pie Chart Component
 * 
 * @param {Array} data - Chart data array with 'name', 'value', and 'color' properties
 * @param {string} dataKey - Key to extract from data objects (default: 'value')
 * @param {string} nameKey - Key for display name (default: 'name')
 * @param {number} outerRadius - Outer radius of the pie (default: 70)
 * @param {boolean} showLegend - Show legend (default: true)
 * @param {boolean} labelLine - Show label lines (default: false)
 * @param {function} customLabel - Custom label formatter function
 * @param {function} customTooltip - Custom tooltip formatter
 * @param {number} height - Chart height (default: 300)
 * @param {number} width - Chart width (default: 100%)
 */
export function PieChartComponent({
  data,
  dataKey = 'value',
  nameKey = 'name',
  outerRadius = 70,
  showLegend = true,
  labelLine = false,
  customLabel,
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

  const defaultLabel = ({ name, value }) => {
    if (customLabel) return customLabel(name, value)
    return `${name} ${value}%`
  }

  const defaultTooltip = (formatter) => {
    return (value, name, props) => {
      if (customTooltip) return customTooltip(value, name, props)
      return [
        `${value}%`,
        props.payload?.name || name
      ]
    }
  }

  return (
    <ResponsiveContainer width={width} height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={labelLine}
          label={defaultLabel}
          outerRadius={outerRadius}
          fill="#8884d8"
          dataKey={dataKey}
          nameKey={nameKey}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || `hsl(${index * 360 / data.length}, 70%, 50%)`} />
          ))}
        </Pie>
        <Tooltip formatter={defaultTooltip()} labelStyle={{ color: '#374151' }} />
        {showLegend && <Legend />}
      </PieChart>
    </ResponsiveContainer>
  )
}
