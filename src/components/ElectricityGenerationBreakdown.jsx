import { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Treemap } from 'recharts'
import { fetchFuelMixData } from '../services/eurostat'
import { getCountryName } from '../data/countryNames'

/**
 * Electricity Generation Breakdown Component
 * 
 * Shows electricity generation by technology (GWh and %)
 * - Fossil fuels (coal, gas, oil)
 * - Nuclear
 * - Renewables (hydro, wind, solar, bioenergy, geothermal)
 * 
 * Data source: Eurostat nrg_bal_c
 * Conversion: KTOE to GWh (1 KTOE = 11.63 GWh for electricity)
 */

const KTOE_TO_GWH = 11.63

// Technology mapping - maps display names to fuel mix data field names from fetchFuelMixData
const TECHNOLOGY_MAPPING = {
  'coal': { name: 'Coal', category: 'fossil', color: '#1F2937', fieldKey: 'solidFossil' },
  'gas': { name: 'Natural Gas', category: 'fossil', color: '#F59E0B', fieldKey: 'gas' },
  'oil': { name: 'Oil & Oil Products', category: 'fossil', color: '#DC2626', fieldKey: 'oil' },
  'nuclear': { name: 'Nuclear', category: 'nuclear', color: '#3B82F6', fieldKey: 'nuclear' },
  'hydro': { name: 'Hydro', category: 'renewable', color: '#06B6D4', fieldKey: 'hydro' },
  'wind': { name: 'Wind', category: 'renewable', color: '#10B981', fieldKey: 'wind' },
  'solar': { name: 'Solar', category: 'renewable', color: '#FBBF24', fieldKey: 'solar' },
  'bio': { name: 'Bioenergy', category: 'renewable', color: '#84CC16', fieldKey: 'solidBiofuels' },
  'geo': { name: 'Geothermal', category: 'renewable', color: '#EC4899', fieldKey: 'geothermal' }
}

export function ElectricityGenerationBreakdown({ selectedCountries, selectedYear }) {
  const [generationData, setGenerationData] = useState({})
  const [historicalData, setHistoricalData] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (selectedCountries.length === 0) {
        setGenerationData({})
        setHistoricalData({})
        return
      }

      setIsLoading(true)
      try {
        const generation = {}
        const historical = {}

        // Fetch current year fuel mix data (includes all technologies)
        const fuelData = await fetchFuelMixData(selectedCountries, selectedYear)

        for (const country of selectedCountries) {
          const countryFuelData = fuelData[country] || {}
          
          // Map fuel mix data to technologies
          const technologies = {}
          let totalGWh = 0

          Object.entries(TECHNOLOGY_MAPPING).forEach(([key, tech]) => {
            // Get KTOE value from fuel mix data using the field key
            const ktoe = countryFuelData[tech.fieldKey] || 0
            const gwh = (ktoe || 0) * KTOE_TO_GWH
            technologies[tech.name] = {
              gwh: Math.round(gwh),
              category: tech.category,
              color: tech.color
            }
            totalGWh += gwh
          })

          generation[country] = {
            technologies,
            totalGWh: Math.round(totalGWh)
          }

          // Fetch historical data (last 10 years)
          const startYear = Math.max(selectedYear - 10, 2005)
          const historicalYears = Array.from({ length: selectedYear - startYear + 1 }, (_, i) => startYear + i)
          
          const historicalTrends = []
          
          for (const year of historicalYears) {
            try {
              const yearFuelData = await fetchFuelMixData([country], year)
              const countryYearData = yearFuelData[country] || {}
              
              let yearTotal = 0
              const yearTechs = {}
              
              Object.entries(TECHNOLOGY_MAPPING).forEach(([key, tech]) => {
                const ktoe = countryYearData[tech.fieldKey] || 0
                const gwh = (ktoe || 0) * KTOE_TO_GWH
                yearTechs[tech.name] = Math.round(gwh)
                yearTotal += gwh
              })
              
              historicalTrends.push({
                year,
                ...yearTechs,
                total: Math.round(yearTotal)
              })
            } catch (e) {
              console.warn(`Missing data for ${country} year ${year}`)
            }
          }
          
          historical[country] = historicalTrends
        }

        setGenerationData(generation)
        setHistoricalData(historical)
      } catch (error) {
        console.error('Error fetching electricity generation data:', error)
        throw error
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [selectedCountries, selectedYear])

  // Prepare data for stacked bar (current year)
  const barData = selectedCountries.map(country => {
    const data = generationData[country]
    if (!data) return null
    
    const item = {
      country: getCountryName(country),
      code: country,
      total: data.totalGWh
    }
    
    Object.entries(data.technologies).forEach(([tech, values]) => {
      item[tech] = values.gwh
    })
    
    return item
  }).filter(Boolean)

  // Prepare data for treemap (current year breakdown)
  const treemapData = selectedCountries.flatMap(country => {
    const data = generationData[country]
    if (!data) return []
    
    return Object.entries(data.technologies).map(([tech, values]) => ({
      name: `${tech} (${getCountryName(country)})`,
      value: values.gwh,
      category: values.category,
      color: values.color,
      percentage: ((values.gwh / data.totalGWh) * 100).toFixed(1)
    }))
  })

  // Get color based on category
  const getCategoryColor = (category) => {
    const colors = {
      fossil: '#EF4444',
      nuclear: '#3B82F6',
      renewable: '#10B981',
      other: '#9CA3AF'
    }
    return colors[category] || '#9CA3AF'
  }

  // Calculate category shares for current year
  const calculateCategoryShares = (country) => {
    const data = generationData[country]
    if (!data) return {}

    const shares = {
      fossil: 0,
      nuclear: 0,
      renewable: 0,
      other: 0
    }

    Object.entries(data.technologies).forEach(([tech, values]) => {
      shares[values.category] += values.gwh
    })

    const total = data.totalGWh
    Object.keys(shares).forEach(key => {
      shares[key] = ((shares[key] / total) * 100).toFixed(1)
    })

    return shares
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-yellow-100 rounded-xl">
            <span className="text-2xl">⚡</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Electricity Generation Breakdown</h2>
            <p className="text-gray-600 text-sm">Generation by technology in GWh with renewable and fossil shares</p>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mr-3"></div>
            <p className="text-gray-500">Loading electricity generation data...</p>
          </div>
        )}

        {selectedCountries.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>Select countries to view electricity generation breakdown</p>
          </div>
        ) : (
          <>
            {/* Current Year KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {selectedCountries.map(country => {
                const data = generationData[country]
                const shares = calculateCategoryShares(country)
                if (!data) return null

                return (
                  <div key={country} className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-yellow-800">{getCountryName(country)}</h3>
                      <span className="text-2xl">⚡</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-600">Total Generation</p>
                        <p className="text-3xl font-bold text-yellow-700">{data.totalGWh.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">GWh</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-yellow-200">
                        <div>
                          <p className="text-xs text-gray-600">Renewables</p>
                          <p className="text-lg font-bold text-green-600">{shares.renewable}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Nuclear</p>
                          <p className="text-lg font-bold text-blue-600">{shares.nuclear}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Stacked Bar Chart (Current Year) */}
            <div className="mb-8">
              <div className="bg-gray-50 p-4 rounded-xl mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Generation by Technology ({selectedYear})</h3>
                <p className="text-xs text-gray-500">Stacked view showing contribution of each technology to total generation</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={barData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="country" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis label={{ value: 'Generation (GWh)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => `${value.toLocaleString()} GWh`}
                  />
                  <Legend />
                  {Object.entries(TECHNOLOGY_MAPPING).map(([code, tech]) => (
                    <Bar key={tech.name} dataKey={tech.name} stackId="a" fill={tech.color} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Technology Breakdown (Current Year) */}
            <div className="mb-8">
              <div className="bg-gray-50 p-4 rounded-xl mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Generation by Technology - Detailed View</h3>
                <p className="text-xs text-gray-500">Individual technology contribution across selected countries</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedCountries.map(country => {
                  const data = generationData[country]
                  if (!data) return null

                  return (
                    <div key={country} className="bg-white p-4 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-4">{getCountryName(country)}</h4>
                      <div className="space-y-2">
                        {Object.entries(data.technologies).map(([tech, values]) => {
                          const percentage = ((values.gwh / data.totalGWh) * 100).toFixed(1)
                          return (
                            <div key={tech} className="flex items-center gap-3">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: values.color }}
                              ></div>
                              <span className="text-sm text-gray-700 flex-1">{tech}</span>
                              <div className="flex gap-2 text-right">
                                <span className="text-sm font-semibold text-gray-800 w-12">{percentage}%</span>
                                <span className="text-xs text-gray-600 w-16">{values.gwh} GWh</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm font-semibold text-gray-800">Total: {data.totalGWh.toLocaleString()} GWh</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Historical Trend (Single Country) */}
            {selectedCountries.length === 1 && historicalData[selectedCountries[0]] && (
              <div className="mb-8">
                <div className="bg-gray-50 p-4 rounded-xl mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">10-Year Generation Trend</h3>
                  <p className="text-xs text-gray-500">Technology mix evolution for {getCountryName(selectedCountries[0])}</p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={historicalData[selectedCountries[0]]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="year" />
                    <YAxis label={{ value: 'Generation (GWh)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => `${value.toLocaleString()} GWh`}
                    />
                    <Legend />
                    {Object.entries(TECHNOLOGY_MAPPING).map(([code, tech]) => (
                      <Line 
                        key={tech.name}
                        type="monotone" 
                        dataKey={tech.name} 
                        stroke={tech.color} 
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Data Sources & Methodology */}
            <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">📋 Data Sources & Methodology</h4>
              <p className="text-sm text-yellow-700 mb-3">
                <strong>Electricity generation breakdown by technology</strong>
              </p>
              <ul className="text-sm text-yellow-700 space-y-1 ml-4 list-disc mb-3">
                <li><strong>Data Source:</strong> Eurostat nrg_bal_c (Annual energy balance) - Electricity (E7000) broken down by energy sources</li>
                <li><strong>Technologies Covered:</strong> Coal, Natural Gas, Oil, Nuclear, Hydro, Wind, Solar, Bioenergy, Geothermal</li>
                <li><strong>Unit Conversion:</strong> KTOE to GWh (1 KTOE = 11.63 GWh for electricity) - standard conversion factor</li>
                <li><strong>Categories:</strong> Fossil (coal, gas, oil), Nuclear, Renewables (hydro, wind, solar, bio, geo)</li>
                <li><strong>Time Period:</strong> 10-year historical trend (2005-present, varies by country and data availability)</li>
              </ul>
              <p className="text-xs text-yellow-600">
                <strong>Note:</strong> Electricity generation data aligns with EU climate and renewable energy directives. Values represent primary energy input equivalent.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
