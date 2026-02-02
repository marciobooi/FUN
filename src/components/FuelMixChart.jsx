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

      {/* Methodology & Data Sources */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-2">📋 Methodology & Data Sources</h4>
        <div className="space-y-2 text-xs text-gray-700">
          <p>
            <strong>Data Source:</strong> Eurostat nrg_bal_c (Energy balance by product) - GIC (Gross Inland Consumption)
          </p>
          <p>
            <strong>Fuel Categories:</strong> 
            <span className="block ml-2 mt-1">
              • Solid Fossil Fuels (coal, lignite, peat) | 
              • Oil & Petroleum (crude oil, petroleum products) | 
              • Natural Gas | 
              • Nuclear (primary energy equivalent) | 
              • Renewables (hydro, wind, solar, biomass, geothermal) | 
              • Electricity (from net imports) | 
              • Heat (district heating)
            </span>
          </p>
          <p>
            <strong>Unit:</strong> KTOE (Kilotonnes of Oil Equivalent) - standard for energy balance accounting across all fuel types
          </p>
          <p>
            <strong>Coverage:</strong> All countries in the dataset from 2005 to present (annual data)
          </p>
          <p>
            <strong>Note:</strong> GIC includes all energy consumed domestically, including losses in transformation and distribution. See "Practical Field Mapping" guide for detailed definitions of energy balance items.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
