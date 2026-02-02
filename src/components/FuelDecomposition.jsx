import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts'
import { ChartContainer } from './ui/ChartContainer'
import { fuelFamilies } from '../data/siecCodes'

// Enhanced color mapping based on fuel families
const FUEL_COLORS = {
  // Solid Fossil Fuels
  'C0000X0350-0370': '#374151',  // Gray-700
  'C0100': '#2D3748',            // Gray-800
  'C0200': '#4A5568',            // Gray-600
  'C0300': '#718096',            // Gray-500
  'C0350-0370': '#A0AEC0',       // Gray-400

  // Peat
  'P1000': '#8B7355',            // Brown

  // Oil Shale
  'S2000': '#2C1810',            // Dark brown

  // Natural Gas
  'G3000': '#F59E0B',            // Amber-500

  // Oil and Petroleum Products
  'O4000XBIO': '#3B82F6',        // Blue-500
  'O4100_TOT': '#1E40AF',        // Blue-700
  'O4600': '#60A5FA',            // Blue-400
  'O4650': '#93C5FD',            // Blue-300
  'O4660': '#BFDBFE',            // Blue-200

  // Renewables and Biofuels
  'RA000': '#10B981',            // Emerald-500
  'RA100': '#059669',            // Emerald-600
  'RA200': '#047857',            // Emerald-700
  'RA300': '#065F46',            // Emerald-800
  'RA400': '#064E3B',            // Emerald-900
  'R5000': '#16A34A',            // Green-600
  'R5100': '#15803D',            // Green-700
  'R5200': '#166534',            // Green-800

  // Waste
  'W6100_6220': '#92400E',       // Amber-700

  // Nuclear
  'N900H': '#8B5CF6',            // Violet-500

  // Electricity
  'E7000': '#EF4444',            // Red-500

  // Heat
  'H8000': '#F97316'             // Orange-500
}

// Function to flatten fuel families for chart data using real fuel mix data
function createFuelDataFromFamilies(families, fuelMixData) {
  const result = []
  
  // Calculate total consumption for percentage calculation
  const totalConsumption = Object.values(fuelMixData).reduce((sum, value) => sum + (value || 0), 0)

  families.forEach(family => {
    if (family.children && family.children.length > 0) {
      // Add main category using real data
      const familyValue = fuelMixData[family.id] || 0
      const percentage = totalConsumption > 0 ? (familyValue / totalConsumption) * 100 : 0
      
      result.push({
        id: family.id,
        name: family.name,
        category: family.category,
        description: family.description,
        value: Math.round(percentage * 10) / 10, // Real data as percentage
        color: FUEL_COLORS[family.id] || '#6B7280'
      })

      // Add children with real values
      family.children.forEach(child => {
        if (child.children && child.children.length > 0) {
          const childValue = fuelMixData[child.id] || 0
          const childPercentage = totalConsumption > 0 ? (childValue / totalConsumption) * 100 : 0
          
          result.push({
            id: child.id,
            name: child.name,
            category: child.category,
            parent: family.name,
            value: Math.round(childPercentage * 10) / 10, // Real data as percentage
            color: FUEL_COLORS[child.id] || '#9CA3AF'
          })
        }
      })
    } else {
      // Leaf node with real data
      const leafValue = fuelMixData[family.id] || 0
      const leafPercentage = totalConsumption > 0 ? (leafValue / totalConsumption) * 100 : 0
      
      result.push({
        id: family.id,
        name: family.name,
        category: family.category,
        description: family.description,
        value: Math.round(leafPercentage * 10) / 10, // Real data as percentage
        color: FUEL_COLORS[family.id] || '#6B7280'
      })
    }
  })

  return result
}

export function FuelDecomposition({ countryCode, year, fuelMix }) {
  // Create fuel data from fuel families using real fuel mix data
  const fuelData = createFuelDataFromFamilies(fuelFamilies, fuelMix || {})

  // Group by category for better organization
  const primaryFuels = fuelData.filter(f => f.category === 'primary')
  const secondaryFuels = fuelData.filter(f => f.category === 'secondary')

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-eurostat-darkBlue mb-4">
        Energy Mix Decomposition - {countryCode} ({year})
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Primary Energy Sources */}
        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            Primary Energy Sources
          </h4>
          <ChartContainer style={{ height: '250px' }}>
            <PieChart>
              <Pie
                data={primaryFuels}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name.split(' ')[0]} ${value}%`}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {primaryFuels.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => [
                  `${value}%`,
                  props.payload.name
                ]}
                labelStyle={{ color: '#374151' }}
              />
            </PieChart>
          </ChartContainer>
        </div>

        {/* Secondary Energy Sources */}
        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            Secondary Energy Sources
          </h4>
          <ChartContainer style={{ height: '250px' }}>
            <PieChart>
              <Pie
                data={secondaryFuels}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name.split(' ')[0]} ${value}%`}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {secondaryFuels.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => [
                  `${value}%`,
                  props.payload.name
                ]}
                labelStyle={{ color: '#374151' }}
              />
            </PieChart>
          </ChartContainer>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="mt-6">
        <h4 className="text-md font-semibold text-gray-800 mb-4">Detailed Breakdown</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Primary Fuels */}
          <div>
            <h5 className="text-sm font-medium text-green-700 mb-2">Primary Energy</h5>
            <div className="space-y-2">
              {primaryFuels.slice(0, 6).map(fuel => (
                <div key={fuel.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: fuel.color }}
                    />
                    <span className="text-gray-700 truncate" title={fuel.name}>
                      {fuel.name}
                    </span>
                  </div>
                  <span className="font-bold text-gray-900">{fuel.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Secondary Fuels */}
          <div>
            <h5 className="text-sm font-medium text-blue-700 mb-2">Secondary Energy</h5>
            <div className="space-y-2">
              {secondaryFuels.slice(0, 6).map(fuel => (
                <div key={fuel.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: fuel.color }}
                    />
                    <span className="text-gray-700 truncate" title={fuel.name}>
                      {fuel.name}
                    </span>
                  </div>
                  <span className="font-bold text-gray-900">{fuel.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Energy Categories Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-800 mb-2">Energy Categories</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Primary Energy:</span>
            <span className="font-bold text-green-700">
              {primaryFuels.reduce((sum, fuel) => sum + fuel.value, 0)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Secondary Energy:</span>
            <span className="font-bold text-blue-700">
              {secondaryFuels.reduce((sum, fuel) => sum + fuel.value, 0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
