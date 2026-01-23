import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { motion } from 'framer-motion'
import { ChartContainer } from './ChartContainer'

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

  const fuelKeys = Object.keys(FUEL_COLORS)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-hidden"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-6">Energy Supply by Source (KTOE)</h3>
      
      <ChartContainer style={{ height: '400px' }}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
            <XAxis type="number" axisLine={false} tickLine={false} />
            <YAxis 
              dataKey="country" 
              type="category" 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 14, fontWeight: 600 }}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                padding: '12px'
              }}
              formatter={(value, name) => [value.toLocaleString() + ' KTOE', FUEL_LABELS[name] || name]}
            />
            <Legend 
              formatter={(value) => FUEL_LABELS[value] || value}
              wrapperStyle={{ paddingTop: '20px' }}
            />
            {fuelKeys.map(key => (
              <Bar 
                key={key} 
                dataKey={key} 
                stackId="a" 
                fill={FUEL_COLORS[key]}
                radius={[0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ChartContainer>
    </motion.div>
  )
}
