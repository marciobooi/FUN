import { motion } from 'framer-motion'
import { ChartContainer } from './ui/ChartContainer'
import { BarChartComponent } from '../components/ui/charts'

const FUEL_COLORS = {
  solidFossil: '#374151',  // Gray-700
  oil: '#3B82F6',          // Blue-500
  gas: '#F59E0B',          // Amber-500
  nuclear: '#8B5CF6',      // Violet-500
  renewables: '#10B981',   // Emerald-500
  electricity: '#EF4444',  // Red-500
  heat: '#F97316'          // Orange-500
}

const FUEL_LABELS = {
  solidFossil: 'Solid Fossil Fuels',
  oil: 'Oil & Petroleum',
  gas: 'Natural Gas',
  nuclear: 'Nuclear',
  renewables: 'Renewables',
  electricity: 'Electricity',
  heat: 'Heat'
}

export function FuelMixChart({ data, selectedCountries }) {
  if (!data || Object.keys(data).length === 0 || selectedCountries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>Select countries to view fuel mix data</p>
      </div>
    )
  }

  // Transform data for Recharts
  const chartData = selectedCountries.map(country => {
    const fuels = data[country] || {}
    return {
      country,
      ...fuels
    }
  })

  // Transform data for chart component
  const fuelKeys = Object.keys(FUEL_COLORS)
  const barConfig = fuelKeys.map(key => ({
    dataKey: key,
    fill: FUEL_COLORS[key],
    name: FUEL_LABELS[key] || key
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-hidden"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-6">Energy Supply by Source (KTOE)</h3>
      
      <ChartContainer style={{ height: '400px' }}>
        <BarChartComponent
          data={chartData}
          bars={barConfig}
          xAxisKey="country"
          layout="horizontal"
          height={400}
          customTooltip={(value, name) => [
            `${value.toLocaleString()} KTOE`,
            FUEL_LABELS[name] || name
          ]}
        />
      </ChartContainer>
    </motion.div>
  )
}
