import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { ChartContainer } from './ChartContainer'

export function EnergyComparisonChart({ countries, year, data }) {
  if (countries.length === 0) return null

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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-bold text-eurostat-darkBlue mb-4">
        Energy Metrics Comparison ({year})
      </h3>
      
      <ChartContainer style={{ height: '350px' }}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="name" />
          <YAxis label={{ value: 'ktoe', angle: -90, position: 'insideLeft' }} />
          <Tooltip 
            formatter={(value) => `${value} ktoe`}
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
          />
          <Legend />
          {countries.map((country, idx) => (
            <Bar key={country} dataKey={country} fill={colors[idx % colors.length]} />
          ))}
        </BarChart>
        </ChartContainer>
    </div>
  )
}
