import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '../chart'

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
  const defaultPalette = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-1)'
  ]

  const chartConfig = bars.reduce((acc, barConfig, index) => {
    const paletteColor = defaultPalette[index % defaultPalette.length]
    const color = barConfig.useCustomFill ? barConfig.fill : paletteColor
    acc[barConfig.dataKey] = {
      label: barConfig.name || barConfig.dataKey,
      color,
    }
    return acc
  }, {})

  return (
    <ChartContainer config={chartConfig} width={width} height={height} minHeight={height}>
      <BarChart 
        data={data}
        layout={isHorizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 8, right: 12, left: isHorizontal ? 80 : 12, bottom: 8 }}
      >
        {showGrid && <CartesianGrid vertical={false} />}
        <XAxis 
          type={isHorizontal ? 'number' : 'category'}
          dataKey={isHorizontal ? undefined : xAxisKey}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottomRight', offset: -5 } : undefined}
        />
        <YAxis 
          type={isHorizontal ? 'category' : 'number'}
          dataKey={isHorizontal ? xAxisKey : undefined}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
        />
        <ChartTooltip content={<ChartTooltipContent formatter={defaultTooltip} />} />
        {showLegend && <ChartLegend content={<ChartLegendContent />} />}
        {bars.map((barConfig, index) => {
          const paletteColor = defaultPalette[index % defaultPalette.length]
          const fill = barConfig.useCustomFill ? barConfig.fill : paletteColor

          return (
          <Bar
            key={index}
            dataKey={barConfig.dataKey}
            fill={fill || `var(--color-${barConfig.dataKey})`}
            name={barConfig.name || barConfig.dataKey}
            radius={[6, 6, 0, 0]}
          >
            {barConfig.colors && barConfig.colors.map((color, idx) => (
              <Cell key={`cell-${idx}`} fill={color} />
            ))}
          </Bar>
          )
        })}
      </BarChart>
    </ChartContainer>
  )
}
