import { useState, useEffect } from 'react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import axios from 'axios'
import { getCountryName } from '../data/countryNames'

/**
 * Peak / Seasonal Demand Insights Component
 * 
 * Shows seasonal patterns in energy demand (winter peaks, summer troughs)
 * Uses monthly Eurostat data from:
 * - nrg_cb_em (monthly electricity)
 * - nrg_cb_gasm (monthly gas)
 * - nrg_cb_sffm (monthly solid fuels)
 * 
 * Data source: Eurostat monthly energy balance datasets (not annual nrg_bal_c)
 */

const MONTHLY_DATASETS = {
  electricity: {
    code: 'nrg_cb_em',
    nrg_bal: 'IMP', // Import/demand
    siec: 'E7000',
    unit: 'GWH'
  },
  gas: {
    code: 'nrg_cb_gasm',
    nrg_bal: 'IPRD', // Production/demand
    siec: 'G3000',
    unit: 'TJ_GCV'
  },
  solidFuels: {
    code: 'nrg_cb_sffm',
    nrg_bal: 'IPRD',
    siec: 'C0100',
    unit: 'THS_T'
  }
}

// Month names for display
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const SEASON_COLORS = {
  winter: '#3B82F6',   // Blue
  spring: '#10B981',   // Green
  summer: '#F59E0B',   // Amber
  autumn: '#EF4444'    // Red
}

export function PeakSeasonalDemand({ selectedCountries, selectedYear }) {
  const [monthlyData, setMonthlyData] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [seasonalStats, setSeasonalStats] = useState({})

  useEffect(() => {
    const fetchMonthlyData = async () => {
      if (selectedCountries.length === 0) {
        setMonthlyData({})
        setSeasonalStats({})
        return
      }

      setIsLoading(true)
      try {
        const data = {}
        const stats = {}

        for (const country of selectedCountries) {
          data[country] = {
            electricity: [],
            gas: [],
            solidFuels: []
          }

          // Fetch monthly electricity data
          const elecResponse = await fetchMonthlyDataFromEurostat(
            MONTHLY_DATASETS.electricity.code,
            country,
            selectedYear
          )
          data[country].electricity = elecResponse

          // Fetch monthly gas data
          const gasResponse = await fetchMonthlyDataFromEurostat(
            MONTHLY_DATASETS.gas.code,
            country,
            selectedYear
          )
          data[country].gas = gasResponse

          // Calculate seasonal statistics
          stats[country] = calculateSeasonalStats(
            data[country].electricity,
            data[country].gas
          )
        }

        setMonthlyData(data)
        setSeasonalStats(stats)
      } catch (error) {
        console.error('Error fetching monthly data:', error)
        throw error
      } finally {
        setIsLoading(false)
      }
    }

    fetchMonthlyData()
  }, [selectedCountries, selectedYear])

  // Transform data for multi-country comparison charts
  const electricityChartData = transformChartData(monthlyData, selectedCountries, 'electricity')
  const gasChartData = transformChartData(monthlyData, selectedCountries, 'gas')

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <span className="text-2xl">📈</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Peak & Seasonal Demand Insights</h2>
            <p className="text-gray-600 text-sm">Monthly energy demand patterns - Winter peaks and summer troughs</p>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-gray-500">Loading monthly data...</p>
          </div>
        )}

        {selectedCountries.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>Select countries to view seasonal demand patterns</p>
          </div>
        ) : (
          <>
            {/* Seasonal Statistics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {selectedCountries.map(country => {
                const stats = seasonalStats[country]
                if (!stats) return null

                return (
                  <div key={country} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-blue-800">{getCountryName(country)}</h3>
                      <span className="text-2xl">❄️</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-600">Winter Peak (Dec-Feb)</p>
                        <p className="text-xl font-bold text-blue-600">{stats.winterPeak.toFixed(1)} GWh</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Summer Trough (Jun-Aug)</p>
                        <p className="text-lg font-bold text-orange-600">{stats.summerTrough.toFixed(1)} GWh</p>
                      </div>
                      <div className="pt-2 border-t border-blue-200">
                        <p className="text-xs text-gray-600">Seasonal Variation</p>
                        <p className="text-sm font-bold text-gray-800">{stats.variation.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Monthly Electricity Demand */}
            <div className="mb-8">
              <div className="bg-gray-50 p-4 rounded-xl mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Monthly Electricity Demand (GWh)</h3>
                <p className="text-xs text-gray-500">Data source: Eurostat nrg_cb_em (monthly electricity)</p>
              </div>
              {selectedCountries.length === 1 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={monthlyData[selectedCountries[0]]?.electricity || []}>
                    <defs>
                      <linearGradient id="colorElectric" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" />
                    <YAxis label={{ value: 'Demand (GWh)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => `${value.toFixed(1)} GWh`}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3B82F6"
                      fillOpacity={1}
                      fill="url(#colorElectric)"
                      name="Electricity Demand"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={electricityChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" />
                    <YAxis label={{ value: 'Demand (GWh)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => `${value.toFixed(1)} GWh`}
                    />
                    <Legend />
                    {selectedCountries.map((country, idx) => {
                      const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B']
                      return (
                        <Line
                          key={country}
                          type="monotone"
                          dataKey={country}
                          stroke={colors[idx % colors.length]}
                          strokeWidth={2}
                          dot={false}
                          name={getCountryName(country)}
                          isAnimationActive={false}
                        />
                      )
                    })}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Monthly Gas Demand */}
            <div className="mb-8">
              <div className="bg-gray-50 p-4 rounded-xl mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Monthly Gas Demand (TJ)</h3>
                <p className="text-xs text-gray-500">Data source: Eurostat nrg_cb_gasm (monthly gas) - Highly seasonal due to heating demand</p>
              </div>
              {selectedCountries.length === 1 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={monthlyData[selectedCountries[0]]?.gas || []}>
                    <defs>
                      <linearGradient id="colorGas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" />
                    <YAxis label={{ value: 'Demand (TJ)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => `${value.toFixed(0)} TJ`}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#F59E0B"
                      fillOpacity={1}
                      fill="url(#colorGas)"
                      name="Gas Demand"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={gasChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" />
                    <YAxis label={{ value: 'Demand (TJ)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => `${value.toFixed(0)} TJ`}
                    />
                    <Legend />
                    {selectedCountries.map((country, idx) => {
                      const colors = ['#F59E0B', '#3B82F6', '#10B981', '#EF4444']
                      return (
                        <Line
                          key={country}
                          type="monotone"
                          dataKey={country}
                          stroke={colors[idx % colors.length]}
                          strokeWidth={2}
                          dot={false}
                          name={getCountryName(country)}
                          isAnimationActive={false}
                        />
                      )
                    })}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Seasonal Pattern Analysis */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Seasonal Pattern Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedCountries.map(country => {
                  const stats = seasonalStats[country]
                  if (!stats) return null

                  return (
                    <div key={country} className="bg-white p-4 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-4">{getCountryName(country)}</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3B82F6' }}></div>
                            <span className="text-sm font-medium text-gray-700">Winter (Dec-Feb)</span>
                          </div>
                          <span className="text-sm font-bold text-gray-800">{stats.winterPeak.toFixed(0)} GWh</span>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10B981' }}></div>
                            <span className="text-sm font-medium text-gray-700">Spring (Mar-May)</span>
                          </div>
                          <span className="text-sm font-bold text-gray-800">{stats.springAvg.toFixed(0)} GWh</span>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F59E0B' }}></div>
                            <span className="text-sm font-medium text-gray-700">Summer (Jun-Aug)</span>
                          </div>
                          <span className="text-sm font-bold text-gray-800">{stats.summerTrough.toFixed(0)} GWh</span>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EF4444' }}></div>
                            <span className="text-sm font-medium text-gray-700">Autumn (Sep-Nov)</span>
                          </div>
                          <span className="text-sm font-bold text-gray-800">{stats.autumnAvg.toFixed(0)} GWh</span>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-600 uppercase">Peak-to-Trough Variation</span>
                            <span className="text-lg font-bold text-blue-600">{stats.variation.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${Math.min(stats.variation / 2, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Methodology & Data Sources */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">📋 Data Sources & Methodology</h4>
              <p className="text-sm text-blue-700 mb-2">
                <strong>⚠️ Important:</strong> This component uses <strong>monthly Eurostat datasets</strong>, not the annual nrg_bal_c:
              </p>
              <ul className="text-sm text-blue-700 space-y-1 ml-4 list-disc">
                <li><strong>nrg_cb_em:</strong> Monthly electricity demand (GWh) - Shows daily/seasonal load variations</li>
                <li><strong>nrg_cb_gasm:</strong> Monthly gas demand (TJ) - Highly seasonal due to heating, especially winter peaks</li>
                <li><strong>nrg_cb_sffm:</strong> Monthly solid fuels (coal, lignite) - Heating and power generation seasonal patterns</li>
              </ul>
              <p className="text-xs text-blue-600 mt-3">
                <strong>Note:</strong> This component fetches real monthly data directly from Eurostat APIs. All displayed values are actual energy demand measurements.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/**
 * Transform chart data to combine all countries into one data structure
 * Converts from: { country: [{ month, value }, ...] }
 * To: [{ month, country1: value, country2: value, ... }, ...]
 */
function transformChartData(monthlyData, countries, dataType) {
  if (!countries || countries.length === 0) return []
  
  const firstCountryData = monthlyData[countries[0]]?.[dataType] || []
  
  return firstCountryData.map((item, idx) => {
    const dataPoint = {
      month: item.month
    }
    
    // Add each country's value for this month
    countries.forEach(country => {
      const countryData = monthlyData[country]?.[dataType] || []
      dataPoint[country] = countryData[idx]?.value || 0
    })
    
    return dataPoint
  })
}

/**
 * Fetch monthly data from Eurostat
 */
async function fetchMonthlyDataFromEurostat(datasetCode, country, year) {
  try {
    // Fetch all 12 months for the year
    const monthlyValues = []
    
    for (let month = 1; month <= 12; month++) {
      const timeParam = `${year}-${String(month).padStart(2, '0')}`
      
      const params = new URLSearchParams()
      params.append('format', 'JSON')
      params.append('geo', country)
      params.append('time', timeParam)
      
      // Add parameters based on dataset
      switch(datasetCode) {
        case 'nrg_cb_em':
          // Electricity: nrg_bal=IMP, siec=E7000, unit=GWH
          params.append('nrg_bal', 'IMP')
          params.append('siec', 'E7000')
          params.append('unit', 'GWH')
          break
        case 'nrg_cb_gasm':
          // Gas: nrg_bal=IPRD, siec=G3000, unit=TJ_GCV
          params.append('nrg_bal', 'IPRD')
          params.append('siec', 'G3000')
          params.append('unit', 'TJ_GCV')
          break
        case 'nrg_cb_sffm':
          // Solid fuels: nrg_bal=IPRD, siec=C0100, unit=THS_T
          params.append('nrg_bal', 'IPRD')
          params.append('siec', 'C0100')
          params.append('unit', 'THS_T')
          break
        default:
          throw new Error(`Unknown dataset: ${datasetCode}`)
      }
      
      const response = await axios.get(
        `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${datasetCode}`,
        { params, timeout: 5000 }
      )

      // Extract value from response for the specific time period
      const value = extractValueFromResponse(response.data, timeParam)
      monthlyValues.push({
        month: MONTH_NAMES[month - 1],
        value: value !== null ? value : 0
      })
    }

    return monthlyValues
  } catch (error) {
    console.error(`Failed to fetch ${datasetCode} for ${country}:`, error.message)
    throw error
  }
}

/**
 * Extract numeric value from Eurostat API response for specific time period
 */
function extractValueFromResponse(data, timeParam) {
  if (!data || !data.value) return null
  
  // Look for value matching the specific time parameter
  const values = Object.entries(data.value)
  
  // Find entry where the key contains the time parameter
  for (const [key, val] of values) {
    // Eurostat API response keys can be complex, but we're looking for the time dimension match
    if (key.includes(timeParam) || Object.keys(data.dimension?.time || {}).some(t => t === timeParam)) {
      const parsedVal = parseFloat(val)
      return !isNaN(parsedVal) ? parsedVal : null
    }
  }
  
  // If no specific match, try to get the first value (fallback)
  const values_array = Object.values(data.value)
  if (values_array.length > 0) {
    const val = parseFloat(values_array[0])
    return !isNaN(val) ? val : null
  }
  
  return null
}

/**
 * Calculate seasonal statistics
 */
function calculateSeasonalStats(electricityData, gasData) {
  if (!electricityData || electricityData.length === 0) {
    return {
      winterPeak: 0,
      summerTrough: 0,
      springAvg: 0,
      autumnAvg: 0,
      variation: 0
    }
  }

  // Winter: Dec (11), Jan (0), Feb (1)
  const winterValues = [electricityData[11], electricityData[0], electricityData[1]].map(d => d?.value || 0)
  const winterPeak = winterValues.reduce((a, b) => a + b, 0) / 3

  // Spring: Mar (2), Apr (3), May (4)
  const springValues = [electricityData[2], electricityData[3], electricityData[4]].map(d => d?.value || 0)
  const springAvg = springValues.reduce((a, b) => a + b, 0) / 3

  // Summer: Jun (5), Jul (6), Aug (7)
  const summerValues = [electricityData[5], electricityData[6], electricityData[7]].map(d => d?.value || 0)
  const summerTrough = summerValues.reduce((a, b) => a + b, 0) / 3

  // Autumn: Sep (8), Oct (9), Nov (10)
  const autumnValues = [electricityData[8], electricityData[9], electricityData[10]].map(d => d?.value || 0)
  const autumnAvg = autumnValues.reduce((a, b) => a + b, 0) / 3

  const variation = winterPeak > 0 ? ((winterPeak - summerTrough) / winterPeak) * 100 : 0

  return {
    winterPeak,
    summerTrough,
    springAvg,
    autumnAvg,
    variation
  }
}
