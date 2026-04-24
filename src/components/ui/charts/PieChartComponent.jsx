import { PieChart, Pie, Cell } from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '../chart'

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

  const defaultTooltip = (value, name, props) => {
    if (customTooltip) return customTooltip(value, name, props)
    return [`${value}%`, props.payload?.name || name]
  }

  const chartConfig = data.reduce((acc, entry, index) => {
    const key = String(entry[nameKey] || entry.name || `segment-${index}`)
    acc[key] = {
      label: entry[nameKey] || entry.name || key,
      color: entry.color || `hsl(${(index * 360) / Math.max(data.length, 1)}, 70%, 50%)`,
    }
    return acc
  }, {})

  return (
    <ChartContainer config={chartConfig} width={width} height={height} minHeight={height}>
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
        <ChartTooltip content={<ChartTooltipContent formatter={defaultTooltip} />} />
        {showLegend && <ChartLegend content={<ChartLegendContent />} />}
      </PieChart>
    </ChartContainer>
  )
}
