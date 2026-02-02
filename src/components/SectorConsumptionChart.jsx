import { motion } from 'framer-motion'
import { ChartContainer } from './ui/ChartContainer'
import { PieChartComponent } from '../components/ui/charts'
import { getCountryName } from '../data/countryNames'

const SECTOR_COLORS = {
  industry: '#3B82F6',    // Blue
  transport: '#F59E0B',   // Amber
  households: '#10B981',  // Emerald
  commercial: '#8B5CF6'   // Violet
}

const SECTOR_LABELS = {
  industry: 'Industry',
  transport: 'Transport',
  households: 'Households',
  commercial: 'Commercial & Public'
}

export function SectorConsumptionChart({ data, selectedCountries }) {
  if (!data || Object.keys(data).length === 0 || selectedCountries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>Select countries to view sector consumption data</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-6">Consumption by Sector</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{selectedCountries.map(country => {
          const sectors = data[country] || {}
          const chartData = Object.entries(sectors).map(([key, value]) => ({
            name: SECTOR_LABELS[key] || key,
            value,
            key
          })).filter(d => d.value > 0)

          const total = chartData.reduce((sum, d) => sum + d.value, 0)

          const pieData = chartData.map(d => ({
            ...d,
            color: SECTOR_COLORS[d.key] || '#999'
          }))

          return (
            <div key={country} className="text-center">
              <h4 className="font-bold text-gray-700 mb-4">{getCountryName(country)}</h4>
              <ChartContainer style={{ height: '200px' }}>
                <PieChartComponent
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={70}
                  customLabel={(name, value) => `${name} ${value.toLocaleString()} KTOE`}
                  customTooltip={(value) => [`${value.toLocaleString()} KTOE`, country]}
                  height={200}
                />
              </ChartContainer>
              <p className="text-sm text-gray-500 mt-2">Total: {total.toLocaleString()} KTOE</p>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-6 pt-4 border-t border-gray-100">
        {Object.entries(SECTOR_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SECTOR_COLORS[key] }} />
            <span className="text-sm text-gray-600">{label}</span>
          </div>
        ))}
      </div>

      {/* Methodology & Data Sources */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-2">📋 Methodology & Data Sources</h4>
        <div className="space-y-2 text-xs text-gray-700">
          <p>
            <strong>Data Source:</strong> Eurostat nrg_bal_c (Energy balance by product) - AFC (Apparent Fuel Consumption) by sector
          </p>
          <p>
            <strong>Sectors:</strong> 
            <span className="block ml-2 mt-1">
              • Industry (manufacturing, mining, construction) | 
              • Transport (road, rail, aviation, maritime) | 
              • Households (residential buildings) | 
              • Commercial & Public (services, commercial, public administration)
            </span>
          </p>
          <p>
            <strong>Unit:</strong> KTOE (Kilotonnes of Oil Equivalent) - final energy consumption by end-use sector
          </p>
          <p>
            <strong>Coverage:</strong> All countries in the dataset from 2005 to present (annual data)
          </p>
          <p>
            <strong>Note:</strong> Final consumption excludes transformation losses and non-energy uses. See "Practical Field Mapping" guide for detailed definitions of AFC (Apparent Fuel Consumption) sector breakdowns.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
