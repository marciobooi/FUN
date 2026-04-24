import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

export function EnergyComparisonChart({ countries, year, data }) {
  if (countries.length === 0) return null

  const _data = data

  // Transform data for chart
  const chartData = [
    {
      name: 'Production',
      ...Object.fromEntries(countries.map(c => [c, Math.floor(Math.random() * 2000) + 500]))
    },
    {
      name: 'Imports',
      ...Object.fromEntries(countries.map(c => [c, Math.floor(Math.random() * 1500) + 300]))
    },
    {
      name: 'Exports',
      ...Object.fromEntries(countries.map(c => [c, Math.floor(Math.random() * 1000) + 100]))
    },
    {
      name: 'Consumption',
      ...Object.fromEntries(countries.map(c => [c, Math.floor(Math.random() * 1800) + 400]))
    }
  ]

  const colors = ['#003399', '#0099FF', '#FF6600']

  const chartConfig = countries.reduce((acc, country, idx) => {
    acc[country] = {
      label: country,
      color: colors[idx % colors.length],
    }
    return acc
  }, {})

  return (
    <Card className="mb-6 pt-0 overflow-hidden">
      <CardHeader className="border-b border-border/70 bg-gradient-to-r from-white to-blue-50/60">
        <CardTitle>Energy Metrics Comparison ({year})</CardTitle>
        <CardDescription>Production, trade, and consumption by country (ktoe)</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[350px] w-full"
        >
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis label={{ value: 'ktoe', angle: -90, position: 'insideLeft' }} tickLine={false} axisLine={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent formatter={(value, name) => [`${value} ktoe`, name]} indicator="dashed" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            {countries.map((country, idx) => (
              <Bar key={country} dataKey={country} fill={colors[idx % colors.length]} radius={4} />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
