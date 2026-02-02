import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { fetchEnergyData } from '../services/eurostat'
import { getAvailableYears } from '../utils/yearUtils'
import { LineChartComponent } from '../components/ui/charts'

export function EnergyDependencyIndicator({ selectedCountries, selectedYear, data }) {
  const [dependencyData, setDependencyData] = useState({})
  const [isLoadingDependency, setIsLoadingDependency] = useState(false)

  // Fetch historical energy dependency data
  useEffect(() => {
    const fetchDependencyData = async () => {
      if (selectedCountries.length === 0) {
        setDependencyData({})
        return
      }

      setIsLoadingDependency(true)
      try {
        // Get available years from dataset
        const allYears = await getAvailableYears()
        // Use recent years for trend analysis
        const years = allYears.filter(y => y <= selectedYear).slice(0, 5).reverse()
        
        const historicalData = {}

        for (const year of years) {
          const yearData = await fetchEnergyData(selectedCountries, year)
          historicalData[year] = yearData
        }

        setDependencyData(historicalData)
      } catch (error) {
        console.error('Error fetching dependency data:', error)
        setDependencyData({})
      } finally {
        setIsLoadingDependency(false)
      }
    }

    fetchDependencyData()
  }, [selectedCountries, selectedYear])

  // Calculate energy dependency for a country and year
  const calculateDependency = (countryData, countryCode) => {
    if (!countryData || !countryData[countryCode]) return null
    
    const imports = countryData[countryCode]?.importsRaw || 0
    const exports = countryData[countryCode]?.exportsRaw || 0
    const consumption = countryData[countryCode]?.consumptionRaw || 0
    
    if (consumption === 0) return null
    
    const dependency = ((imports - exports) / consumption) * 100
    return Math.round(dependency * 10) / 10 // Round to 1 decimal place
  }

  if (selectedCountries.length === 0) {
    return null
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-100 rounded-xl">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Energy Dependency Indicator</h2>
            <p className="text-gray-600">External energy reliance: (Imports - Exports) ÷ Gross Inland Consumption</p>
          </div>
        </div>

        {/* Current Year KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {selectedCountries.map(countryCode => {
            const currentDependency = calculateDependency(data, countryCode)
            return (
              <div key={countryCode} className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-12 h-12 bg-white border-2 border-red-200 text-red-700 font-bold rounded-full text-lg shadow-sm">
                      {countryCode}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-red-800">{countryCode}</h3>
                      <p className="text-sm text-red-600">Energy Dependency</p>
                    </div>
                  </div>
                  {isLoadingDependency && (
                    <div className="w-6 h-6 border-2 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                  )}
                </div>

                <div className="text-center">
                  <div className="text-4xl font-bold text-red-900 mb-2">
                    {currentDependency !== null ? `${currentDependency}%` : '—'}
                  </div>
                  <div className="text-sm text-red-600">
                    {currentDependency !== null 
                      ? currentDependency > 50 
                        ? 'High Dependency' 
                        : currentDependency > 25 
                          ? 'Moderate Dependency' 
                          : 'Low Dependency'
                      : 'No Data'
                    }
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Time Series Chart */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Dependency Trend</h3>
          <div className="bg-gray-50 rounded-2xl p-6">
            {(() => {
              const chartData = Object.keys(dependencyData).map(Number).sort((a, b) => a - b).filter(y => y <= selectedYear).map(year => {
                const dataPoint = { year: year.toString() }
                selectedCountries.forEach(countryCode => {
                  const dependency = calculateDependency(dependencyData[year], countryCode)
                  dataPoint[countryCode] = dependency
                })
                return dataPoint
              })

              const lines = selectedCountries.map((countryCode, index) => ({
                dataKey: countryCode,
                stroke: `hsl(${(index * 137) % 360}, 70%, 50%)`,
                name: countryCode
              }))

              return (
                <LineChartComponent
                  data={chartData}
                  lines={lines}
                  xAxisKey="year"
                  yAxisLabel="Dependency (%)"
                  height={300}
                  customTooltip={(value) => [`${value}%`, 'Dependency']}
                />
              )
            })()}
          </div>
        </div>

        {/* Country Comparison Chart */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Country Comparison ({selectedYear})</h3>
          <div className="bg-gray-50 rounded-2xl p-6">
            {(() => {
              const barData = selectedCountries.map(countryCode => {
                const dependency = calculateDependency(data, countryCode)
                return {
                  country: countryCode,
                  dependency: dependency || 0,
                  fill: dependency > 50 ? '#ef4444' : dependency > 25 ? '#f97316' : '#22c55e'
                }
              })

              return (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="country" 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                      label={{ value: 'Dependency (%)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                      formatter={(value) => [`${value}%`, 'Energy Dependency']}
                    />
                    <Bar dataKey="dependency" radius={[4, 4, 0, 0]}>
                      {barData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.fill} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )
            })()}
          </div>
        </div>

        {/* Methodology Note */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">📋 Methodology</h4>
          <p className="text-sm text-blue-700">
            Energy dependency measures how reliant a country is on imported energy. 
            Calculated as (Imports - Exports) ÷ Gross Inland Consumption × 100. 
            Higher percentages indicate greater external energy dependence and potential vulnerability to supply disruptions.
          </p>
        </div>
      </div>
    </div>
  )
}
