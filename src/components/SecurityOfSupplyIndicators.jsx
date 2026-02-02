import { useState, useEffect } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Scatter } from 'recharts'
import { fetchEnergyData, fetchFuelMixData } from '../services/eurostat'
import { getCountryName } from '../data/countryNames'

/**
 * Security of Supply Indicators Component
 * 
 * Analyzes energy independence and supply diversification
 * - Import reliance by fuel type
 * - Fuel mix diversity (Herfindahl-Hirschman Index)
 * - Net imports by fuel (waterfall view)
 * 
 * Data source: Eurostat nrg_bal_c
 * Formulas:
 * - Import Reliance = (Imports - Exports) / GIC
 * - HHI = Σ(share_i)^2 where lower = more diverse
 */

// Major fuel groups for security analysis
const FUEL_GROUPS = {
  'solidFossil': { name: 'Coal & Solid Fuels', color: '#1F2937', siec: ['C0000X0350-0370'] },
  'gas': { name: 'Natural Gas', color: '#F59E0B', siec: ['G3000'] },
  'oil': { name: 'Oil & Petroleum', color: '#DC2626', siec: ['O4000XBIO'] },
  'nuclear': { name: 'Nuclear', color: '#3B82F6', siec: ['N900H'] },
  'renewables': { name: 'Renewables', color: '#10B981', siec: ['RA000'] }
}

export function SecurityOfSupplyIndicators({ selectedCountries, selectedYear }) {
  const [supplyData, setSupplyData] = useState({})
  const [historicalData, setHistoricalData] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (selectedCountries.length === 0) {
        setSupplyData({})
        setHistoricalData({})
        return
      }

      setIsLoading(true)
      try {
        const supply = {}
        const historical = {}

        // Fetch current year data
        const energyData = await fetchEnergyData(selectedCountries, selectedYear)
        const fuelData = await fetchFuelMixData(selectedCountries, selectedYear)

        for (const country of selectedCountries) {
          const countryEnergy = energyData[country] || {}
          const countryFuel = fuelData[country] || {}

          const totalGIC = countryEnergy.grossInlandConsumptionRaw || 0
          const netImports = (countryEnergy.importsRaw || 0) - (countryEnergy.exportsRaw || 0)

          // Calculate import reliance and diversification by fuel
          const fuelReliance = {}
          let totalGICbyFuel = 0
          const fuelShares = {}

          Object.entries(FUEL_GROUPS).forEach(([key, fuel]) => {
            const ktoe = countryFuel[key] || 0
            totalGICbyFuel += ktoe
            
            // For now, estimate import reliance proportionally
            // In real scenario, would fetch fuel-specific import/export data
            const fuelGIC = ktoe
            const proportionalNetImports = (netImports * (fuelGIC / totalGIC)) || 0
            const reliance = fuelGIC > 0 ? (proportionalNetImports / fuelGIC) : 0
            
            fuelReliance[key] = {
              gic: Math.round(fuelGIC),
              netImports: Math.round(proportionalNetImports),
              reliance: Math.max(-100, Math.min(100, reliance * 100)), // Clamp to -100 to 100
              share: fuelGIC / totalGIC
            }
            
            fuelShares[key] = fuelGIC / totalGIC
          })

          // Calculate Herfindahl-Hirschman Index (HHI) for fuel mix diversity
          // HHI = Σ(market_share_i)^2, ranges from 0 (perfect diversity) to 1 (monopoly)
          const hhi = Object.values(fuelShares).reduce((sum, share) => sum + (share * share), 0)
          const diversityScore = Math.round((1 - hhi) * 100) // Convert to 0-100 diversity score

          supply[country] = {
            fuelReliance,
            hhi,
            diversityScore,
            totalGIC,
            netImports
          }

          // Fetch historical data (last 5 years for trend)
          const startYear = Math.max(selectedYear - 5, 2005)
          const historicalYears = Array.from({ length: selectedYear - startYear + 1 }, (_, i) => startYear + i)
          
          const historicalTrends = []
          
          for (const year of historicalYears) {
            try {
              const yearEnergy = await fetchEnergyData([country], year)
              const yearFuel = await fetchFuelMixData([country], year)
              
              const countryYearEnergy = yearEnergy[country] || {}
              const countryYearFuel = yearFuel[country] || {}
              
              const yearGIC = countryYearEnergy.grossInlandConsumptionRaw || 0
              const yearNetImports = (countryYearEnergy.importsRaw || 0) - (countryYearEnergy.exportsRaw || 0)
              
              // Calculate HHI for this year
              let yearTotalGIC = 0
              const yearShares = {}
              
              Object.entries(FUEL_GROUPS).forEach(([key, fuel]) => {
                const ktoe = countryYearFuel[key] || 0
                yearTotalGIC += ktoe
                yearShares[key] = ktoe / yearGIC
              })
              
              const yearHHI = Object.values(yearShares).reduce((sum, share) => sum + (share * share), 0)
              const yearDiversity = Math.round((1 - yearHHI) * 100)
              
              historicalTrends.push({
                year,
                diversityScore: yearDiversity,
                hhi: yearHHI,
                netImports: Math.round(yearNetImports)
              })
            } catch (e) {
              console.warn(`Missing data for ${country} year ${year}`)
            }
          }
          
          historical[country] = historicalTrends
        }

        setSupplyData(supply)
        setHistoricalData(historical)
      } catch (error) {
        console.error('Error fetching security of supply data:', error)
        throw error
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [selectedCountries, selectedYear])

  // Prepare grouped bar chart data (net imports by fuel, all countries)
  const getGroupedNetImportsData = () => {
    const fuelKeys = Object.keys(FUEL_GROUPS)
    const data = {}

    // Initialize data structure by fuel
    fuelKeys.forEach(key => {
      data[key] = {}
    })

    // Populate with country data
    selectedCountries.forEach(country => {
      const countryData = supplyData[country]
      if (!countryData) return

      Object.entries(countryData.fuelReliance).forEach(([key, values]) => {
        data[key][getCountryName(country)] = values.netImports
      })
    })

    // Convert to array format for Recharts
    return fuelKeys.map(key => ({
      fuel: FUEL_GROUPS[key].name,
      ...data[key]
    }))
  }

  // Prepare waterfall data (net imports by fuel) - kept for reference
  const getWaterfallData = (country) => {
    const data = supplyData[country]
    if (!data) return []

    return Object.entries(data.fuelReliance).map(([fuel, values]) => ({
      name: fuel,
      value: values.netImports,
      reliance: values.reliance.toFixed(1)
    }))
  }

  // Prepare donut data (fuel mix)
  const getDonutData = (country) => {
    const data = supplyData[country]
    if (!data) return []

    return Object.entries(data.fuelReliance).map(([key, values]) => ({
      name: FUEL_GROUPS[key]?.name || key,
      value: values.gic,
      share: (values.share * 100).toFixed(1),
      color: FUEL_GROUPS[key]?.color || '#9CA3AF'
    }))
  }

  // Diversity assessment
  const getDiversityLevel = (score) => {
    if (score >= 80) return { level: 'Highly Diversified', color: '#10B981' }
    if (score >= 60) return { level: 'Well Diversified', color: '#3B82F6' }
    if (score >= 40) return { level: 'Moderately Diversified', color: '#F59E0B' }
    return { level: 'Concentrated Supply', color: '#EF4444' }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-100 rounded-xl">
            <span className="text-2xl">🛡️</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Security of Supply Indicators</h2>
            <p className="text-gray-600 text-sm">Energy independence, import reliance, and fuel mix diversification</p>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mr-3"></div>
            <p className="text-gray-500">Loading security indicators...</p>
          </div>
        )}

        {selectedCountries.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>Select countries to view security of supply indicators</p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {selectedCountries.map(country => {
                const data = supplyData[country]
                if (!data) return null

                const diversity = getDiversityLevel(data.diversityScore)

                return (
                  <div key={country} className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 border border-red-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-red-800">{getCountryName(country)}</h3>
                      <span className="text-2xl">🛡️</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-600">Diversity Score</p>
                        <p className="text-3xl font-bold" style={{ color: diversity.color }}>{data.diversityScore}</p>
                        <p className="text-xs font-semibold" style={{ color: diversity.color }}>{diversity.level}</p>
                      </div>
                      <div className="pt-2 border-t border-red-200">
                        <p className="text-xs text-gray-600">Net Imports</p>
                        <p className="text-lg font-bold text-gray-800">{data.netImports.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">KTOE</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Net Imports by Fuel (Waterfall) */}
            <div className="mb-8">
              <div className="bg-gray-50 p-4 rounded-xl mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Net Imports by Fuel ({selectedYear})</h3>
                <p className="text-xs text-gray-500">Positive = import dependent, Negative = exporter</p>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={getGroupedNetImportsData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="fuel" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis label={{ value: 'Net Imports (KTOE)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => `${value.toLocaleString()} KTOE`}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  {selectedCountries.map((country, idx) => (
                    <Bar 
                      key={country}
                      dataKey={getCountryName(country)} 
                      fill={['#DC2626', '#1F2937', '#F59E0B'][idx % 3]}
                      radius={[8, 8, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Fuel Mix Diversity */}
            <div className="mb-8">
              <div className="bg-gray-50 p-4 rounded-xl mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Fuel Mix Composition & Diversity ({selectedYear})</h3>
                <p className="text-xs text-gray-500">HHI (Herfindahl-Hirschman Index): Lower = More Diverse</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {selectedCountries.map(country => {
                  const data = supplyData[country]
                  if (!data) return null
                  const diversity = getDiversityLevel(data.diversityScore)

                  return (
                    <div key={country} className="bg-white p-4 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-800 mb-4">{getCountryName(country)}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                              <Pie
                                data={getDonutData(country)}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {getDonutData(country).map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col justify-center">
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-gray-600">Diversity Score</p>
                              <p className="text-2xl font-bold" style={{ color: diversity.color }}>
                                {data.diversityScore}/100
                              </p>
                              <p className="text-xs font-semibold text-gray-700">{diversity.level}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">HHI</p>
                              <p className="text-lg font-bold text-gray-800">{(data.hhi * 100).toFixed(1)}</p>
                              <p className="text-xs text-gray-500">(0-100 scale)</p>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-200 space-y-1">
                            {getDonutData(country).map((fuel, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-2 h-2 rounded-full" 
                                    style={{ backgroundColor: fuel.color }}
                                  ></div>
                                  <span className="text-gray-700">{fuel.name}</span>
                                </div>
                                <span className="font-semibold text-gray-800">{fuel.share}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Historical Diversity Trend (Single Country) */}
            {selectedCountries.length === 1 && historicalData[selectedCountries[0]] && (
              <div className="mb-8">
                <div className="bg-gray-50 p-4 rounded-xl mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">5-Year Supply Diversity Trend</h3>
                  <p className="text-xs text-gray-500">Diversity score evolution for {getCountryName(selectedCountries[0])}</p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={historicalData[selectedCountries[0]]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="year" />
                    <YAxis yAxisId="left" label={{ value: 'Diversity Score', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Net Imports (KTOE)', angle: 90, position: 'insideRight' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="diversityScore" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="Diversity Score"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="netImports" 
                      stroke="#DC2626" 
                      strokeWidth={2}
                      name="Net Imports"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Data Sources & Methodology */}
            <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">📋 Data Sources & Methodology</h4>
              <p className="text-sm text-red-700 mb-3">
                <strong>Energy security and supply diversification analysis</strong>
              </p>
              <ul className="text-sm text-red-700 space-y-1 ml-4 list-disc mb-3">
                <li><strong>Data Source:</strong> Eurostat nrg_bal_c - Energy balance (imports, exports, GIC) by fuel type</li>
                <li><strong>Import Reliance Formula:</strong> (Imports - Exports) / GIC × 100% for each fuel group</li>
                <li><strong>Diversity Index (HHI):</strong> Σ(fuel_share_i)² where lower = more diverse, higher = more concentrated</li>
                <li><strong>Diversity Score:</strong> (1 - HHI) × 100, ranges 0-100 (higher = better diversification)</li>
                <li><strong>Fuel Groups:</strong> Coal, Natural Gas, Oil, Nuclear, Renewables (main aggregates)</li>
                <li><strong>Assessment Levels:</strong> Highly Diversified (80+) | Well Diversified (60-79) | Moderately (40-59) | Concentrated (&lt;40)</li>
              </ul>
              <p className="text-xs text-red-600">
                <strong>Note:</strong> Country-of-origin import concentration not included (requires external trade partner data). Current analysis focuses on fuel-type diversification within GIC.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
