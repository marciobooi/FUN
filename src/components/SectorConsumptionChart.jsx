import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { motion } from 'framer-motion'
import { ChartContainer } from './ui/ChartContainer'

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

          return (
            <div key={country} className="text-center">
              <h4 className="font-bold text-gray-700 mb-4">{country}</h4>
              <ChartContainer style={{ height: '200px' }}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={SECTOR_COLORS[entry.key] || '#999'} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => [
                        `${value.toLocaleString()} KTOE`,
                        `${name} (${country})`
                      ]}
                      labelFormatter={() => ''}
                      contentStyle={{ 
                        borderRadius: '8px', 
                        border: 'none', 
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '14px'
                      }}
                    />
                  </PieChart>
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
    </motion.div>
  )
}
