import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts'
import { ChartContainer } from './ChartContainer'

const FUEL_COLORS = {
  'Coal': '#8B7355',
  'Oil': '#2C3E50',
  'Natural Gas': '#FF9800',
  'Nuclear': '#FFD700',
  'Renewables': '#4CAF50',
  'Hydro': '#2196F3',
  'Wind': '#7E57C2',
  'Solar': '#FFC107',
  'Biomass': '#795548'
}

export function FuelDecomposition({ countryCode, year }) {
  // Mock fuel breakdown data
  const fuelData = [
    { name: 'Coal', value: 25 },
    { name: 'Oil', value: 15 },
    { name: 'Natural Gas', value: 35 },
    { name: 'Nuclear', value: 12 },
    { name: 'Renewables', value: 13 }
  ]

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-eurostat-darkBlue mb-4">
        Primary Energy Mix - {countryCode}
      </h3>
      
      <ChartContainer style={{ height: '300px' }}>
          <PieChart>
          <Pie
            data={fuelData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name} ${value}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {fuelData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={FUEL_COLORS[entry.name] || '#999'} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value}%`} />
          <Legend />
          </PieChart>
        </ChartContainer>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        {fuelData.map(fuel => (
          <div key={fuel.name} className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: FUEL_COLORS[fuel.name] }}
            />
            <span className="text-sm text-gray-700">
              {fuel.name}: <span className="font-bold">{fuel.value}%</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
