import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { fetchEnergyData } from '../services/eurostat'
import { getCountryName } from '../data/countryNames'

/**
 * Self-Sufficiency Ratio Component
 * 
 * Shows energy self-sufficiency for each country
 * Self-sufficiency = Primary Production ÷ GIC (Gross Inland Consumption)
 * 
 * Data source: Eurostat nrg_bal_c (annual energy balance)
 * - Production: nrg_bal = PRD, siec = TOTAL, unit = KTOE
 * - Demand: nrg_bal = GIC, siec = TOTAL, unit = KTOE
 */

const KTOE_TO_GWH = 11.63 // Conversion factor

export function SelfSufficiencyRatio({ selectedCountries, selectedYear }) {
  const [sufficiencyData, setSufficiencyData] = useState({})
  const [historicalData, setHistoricalData] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFuel, setSelectedFuel] = useState('TOTAL')
  const [fuelBreakdown, setFuelBreakdown] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      if (selectedCountries.length === 0) {
        setSufficiencyData({})
        setHistoricalData({})
        setFuelBreakdown({})
        return
      }

      setIsLoading(true)
      try {
        const sufficiency = {}
        const historical = {}
        const breakdown = {}

        // Fetch all energy data for current year in one call
        const energyData = await fetchEnergyData(selectedCountries, selectedYear)

        for (const country of selectedCountries) {
          const countryData = energyData[country] || {}

          // Extract production and GIC values from the energy data structure
          const production = countryData.productionRaw || 0
          const gic = countryData.grossInlandConsumptionRaw || 0

          const ratio = gic > 0 ? (production / gic) * 100 : 0
          sufficiency[country] = {
            production,
            gic,
            selfSufficiency: ratio
          }

          // Fetch historical data (last 10 years) - batch call
          const startYear = Math.max(selectedYear - 10, 2005)
          const historicalYears = Array.from({ length: selectedYear - startYear + 1 }, (_, i) => startYear + i)
          
          const historicalRatios = []
          
          for (const year of historicalYears) {
            try {
              const yearData = await fetchEnergyData([country], year)
              const prod = yearData[country]?.productionRaw || 0
              const demand = yearData[country]?.grossInlandConsumptionRaw || 0
              
              historicalRatios.push({
                year,
                selfSufficiency: demand > 0 ? (prod / demand) * 100 : 0
              })
            } catch (e) {
              console.warn(`Missing data for ${country} year ${year}`)
            }
          }
          
          historical[country] = historicalRatios

          // Fuel breakdown - not available in the current energy data structure
          // This would require a separate call to fetchFuelMixDataForCodes or similar
          const fuelData = {}
          breakdown[country] = fuelData
        }

        setSufficiencyData(sufficiency)
        setHistoricalData(historical)
        setFuelBreakdown(breakdown)
      } catch (error) {
        console.error('Error fetching self-sufficiency data:', error)
        throw error
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [selectedCountries, selectedYear])

  // Prepare data for ranked bars (current year)
  const rankedData = selectedCountries
    .map(country => ({
      country: getCountryName(country),
      code: country,
      selfSufficiency: sufficiencyData[country]?.selfSufficiency || 0
    }))
    .sort((a, b) => b.selfSufficiency - a.selfSufficiency)

  // Get color based on self-sufficiency level
  const getColor = (ratio) => {
    if (ratio >= 100) return '#10B981' // Green - self-sufficient
    if (ratio >= 75) return '#F59E0B'  // Amber - mostly sufficient
    return '#EF4444'                    // Red - dependent on imports
  }

  // Fuel labels
  const FUEL_LABELS = {
    TOTAL: 'Total Energy',
    C0000: 'Coal',
    O4000: 'Oil',
    G3000: 'Gas',
    E7000: 'Electricity',
    N6000: 'Nuclear',
    R5000: 'Renewables'
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 rounded-xl">
            <span className="text-2xl">🛡️</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Self-Sufficiency Ratio</h2>
            <p className="text-gray-600 text-sm">Energy independence metric - Primary production ÷ Gross Inland Consumption</p>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mr-3"></div>
            <p className="text-gray-500">Loading self-sufficiency data...</p>
          </div>
        )}

        {selectedCountries.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>Select countries to view self-sufficiency ratios</p>
          </div>
        ) : (
          <>
            {/* Current Year KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {selectedCountries.map(country => {
                const data = sufficiencyData[country]
                if (!data) return null

                const ratio = data.selfSufficiency
                const color = getColor(ratio)
                const status = ratio >= 100 ? '✓ Self-sufficient' : 
                              ratio >= 75 ? '⚠ Mostly sufficient' : '✗ Import dependent'

                return (
                  <div key={country} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-green-800">{getCountryName(country)}</h3>
                      <span className="text-2xl">⚡</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-600">Self-Sufficiency Ratio</p>
                        <p className="text-3xl font-bold" style={{ color }}>{ratio.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Production</p>
                        <p className="text-sm font-semibold text-gray-800">{(data.production / 1000).toFixed(1)} Mtoe</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Consumption</p>
                        <p className="text-sm font-semibold text-gray-800">{(data.gic / 1000).toFixed(1)} Mtoe</p>
                      </div>
                      <div className="pt-2 border-t border-green-200">
                        <p className="text-xs font-semibold text-gray-700">{status}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Ranked Comparison Bar Chart */}
            <div className="mb-8">
              <div className="bg-gray-50 p-4 rounded-xl mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Self-Sufficiency Ranking ({selectedYear})</h3>
                <p className="text-xs text-gray-500">Ranked by self-sufficiency ratio - 100% = fully self-sufficient</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={rankedData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" label={{ value: 'Self-Sufficiency (%)', position: 'insideBottomRight', offset: -5 }} />
                  <YAxis dataKey="country" type="category" width={145} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => `${value.toFixed(1)}%`}
                  />
                  <Bar dataKey="selfSufficiency" fill="#3B82F6" radius={[0, 8, 8, 0]}>
                    {rankedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColor(entry.selfSufficiency)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {/* Reference line at 100% */}
              <div className="mt-2 px-4 text-xs text-gray-600 flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>{'≥100% (self-sufficient)'}</span>
                <div className="w-4 h-4 bg-amber-500 rounded ml-4"></div>
                <span>{'75-99% (mostly sufficient)'}</span>
                <div className="w-4 h-4 bg-red-500 rounded ml-4"></div>
                <span>{'<75% (import dependent)'}</span>
              </div>
            </div>

            {/* Historical Trend Line */}
            {selectedCountries.length === 1 && historicalData[selectedCountries[0]] && (
              <div className="mb-8">
                <div className="bg-gray-50 p-4 rounded-xl mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">10-Year Trend</h3>
                  <p className="text-xs text-gray-500">Self-sufficiency trajectory for {getCountryName(selectedCountries[0])}</p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={historicalData[selectedCountries[0]]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="year" />
                    <YAxis label={{ value: 'Self-Sufficiency (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => `${value.toFixed(1)}%`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="selfSufficiency"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ fill: '#10B981', r: 4 }}
                      name="Self-Sufficiency"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Fuel Breakdown Drill-down */}
            {selectedCountries.length === 1 && fuelBreakdown[selectedCountries[0]] && (
              <div className="mb-8">
                <div className="bg-gray-50 p-4 rounded-xl mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Self-Sufficiency by Fuel Type</h3>
                  <p className="text-xs text-gray-500">Which energy carriers drive {getCountryName(selectedCountries[0])}'s independence</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(fuelBreakdown[selectedCountries[0]]).map(([fuel, data]) => {
                    const ratio = data.selfSufficiency
                    const color = getColor(ratio)
                    
                    return (
                      <div key={fuel} className="bg-white p-4 rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-3">{FUEL_LABELS[fuel]}</h4>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-gray-600">Self-Sufficiency</p>
                            <p className="text-2xl font-bold" style={{ color }}>{ratio.toFixed(1)}%</p>
                          </div>
                          <div className="flex gap-4 text-sm">
                            <div>
                              <p className="text-xs text-gray-600">Production</p>
                              <p className="font-semibold text-gray-800">{(data.production / 1000).toFixed(1)} Mtoe</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Demand</p>
                              <p className="font-semibold text-gray-800">{(data.demand / 1000).toFixed(1)} Mtoe</p>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ 
                                width: `${Math.min(ratio, 100)}%`,
                                backgroundColor: color
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Methodology & Data Sources */}
            <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">📋 Methodology</h4>
              <p className="text-sm text-green-700 mb-3">
                <strong>Self-Sufficiency Ratio = Primary Production ÷ Gross Inland Consumption (GIC)</strong>
              </p>
              <ul className="text-sm text-green-700 space-y-1 ml-4 list-disc mb-3">
                <li><strong>Production:</strong> Primary production (nrg_bal = PROD or PRIM_PROD), all fuels (TOTAL), unit = KTOE</li>
                <li><strong>GIC:</strong> Gross Inland Consumption (nrg_bal = GIC), all fuels (TOTAL), unit = KTOE</li>
                <li><strong>Interpretation:</strong> Values {'>'} 100% indicate net energy exporters; {'<'} 100% indicate import dependence</li>
              </ul>
              <p className="text-xs text-green-600">
                <strong>Data Source:</strong> Eurostat nrg_bal_c (annual energy balance - comprehensive version)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/**
 * Extract numeric value from Eurostat API response
 */
function extractEnergyValue(data) {
  if (!data || !data.value) {
    console.warn('No value field in response:', data)
    return null
  }
  
  // Log response structure for debugging
  console.log('API Response structure:', {
    hasValue: !!data.value,
    valueType: typeof data.value,
    valueKeys: Object.keys(data.value).slice(0, 3),
    firstValue: Object.values(data.value)[0]
  })
  
  const values = Object.values(data.value)
  if (values.length > 0) {
    const val = parseFloat(values[0])
    console.log('Extracted value:', val)
    return !isNaN(val) ? val : null
  }
  return null
}
