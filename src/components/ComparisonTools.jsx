import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter } from 'recharts'
import { fetchEnergyData } from '../services/eurostat'
import { getCountryName } from '../data/countryNames'

/**
 * Comparison Tools Component
 * 
 * Interactive exploration of energy metrics across countries and years
 * Supports:
 * - Geo compare: 2-5 countries at same year
 * - Year compare: Baseline vs current year deltas
 * - Basket compare: Fuel mix side-by-side
 * 
 * Data source: Eurostat nrg_bal_c
 */

const COMPARISON_MODES = {
  GEO: 'geo',
  YEAR: 'year',
  BASKET: 'basket'
}

const METRICS = [
  { id: 'GIC', label: 'Gross Inland Consumption', unit: 'KTOE' },
  { id: 'production', label: 'Primary Production', unit: 'KTOE' },
  { id: 'imports', label: 'Imports', unit: 'KTOE' },
  { id: 'exports', label: 'Exports', unit: 'KTOE' },
  { id: 'dependence', label: 'Import Dependence', unit: '%' }
]

const FUEL_TYPES = [
  { id: 'coal', label: 'Coal', color: '#1F2937' },
  { id: 'oil', label: 'Oil', color: '#DC2626' },
  { id: 'gas', label: 'Gas', color: '#F59E0B' },
  { id: 'nuclear', label: 'Nuclear', color: '#3B82F6' },
  { id: 'renewables', label: 'Renewables', color: '#10B981' },
  { id: 'other', label: 'Other', color: '#9CA3AF' }
]

export function ComparisonTools({ selectedCountries, selectedYear }) {
  const [comparisonMode, setComparisonMode] = useState(COMPARISON_MODES.GEO)
  const [compareCountries, setCompareCountries] = useState(selectedCountries.slice(0, 5))
  const [baselineYear, setBaselineYear] = useState(Math.max(selectedYear - 1, 2005))
  const [currentYear, setCurrentYear] = useState(selectedYear)
  const [selectedMetric, setSelectedMetric] = useState('GIC')
  const [normalizeBy, setNormalizeBy] = useState('raw') // raw, per-capita, per-gdp
  const [comparisonData, setComparisonData] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  // Fetch comparison data
  useEffect(() => {
    const fetchData = async () => {
      if (compareCountries.length === 0) {
        setComparisonData({})
        return
      }

      setIsLoading(true)
      try {
        const data = {}

        if (comparisonMode === COMPARISON_MODES.GEO) {
          // Fetch current year data for selected countries
          const energyData = await fetchEnergyData(compareCountries, currentYear)
          
          compareCountries.forEach(country => {
            data[country] = {
              year: currentYear,
              ...energyData[country]
            }
          })
        } else if (comparisonMode === COMPARISON_MODES.YEAR) {
          // Fetch both baseline and current year for selected country
          if (compareCountries.length > 0) {
            const country = compareCountries[0]
            const [baselineData, currentData] = await Promise.all([
              fetchEnergyData([country], baselineYear),
              fetchEnergyData([country], currentYear)
            ])

            data[country] = {
              baseline: baselineData[country],
              current: currentData[country],
              deltas: computeDeltas(baselineData[country], currentData[country])
            }
          }
        } else if (comparisonMode === COMPARISON_MODES.BASKET) {
          // Fetch fuel mix data for countries
          const energyData = await fetchEnergyData(compareCountries, currentYear)
          compareCountries.forEach(country => {
            data[country] = energyData[country]
          })
        }

        setComparisonData(data)
      } catch (error) {
        console.error('Error fetching comparison data:', error)
        setComparisonData({})
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [comparisonMode, compareCountries, baselineYear, currentYear])

  const handleCountryToggle = (country) => {
    setCompareCountries(prev => {
      if (prev.includes(country)) {
        return prev.filter(c => c !== country)
      } else if (prev.length < 5) {
        return [...prev, country]
      }
      return prev
    })
  }

  // Prepare data for geo comparison
  const getGeoComparisonData = () => {
    return compareCountries.map(country => {
      const countryData = comparisonData[country] || {}
      const imports = countryData.importsRaw || 0
      const exports = countryData.exportsRaw || 0
      const consumption = countryData.consumptionRaw || 0
      const dependence = consumption > 0 ? ((imports - exports) / consumption) * 100 : 0
      
      return {
        name: getCountryName(country),
        code: country,
        GIC: countryData.grossInlandConsumptionRaw || 0,
        production: countryData.productionRaw || 0,
        imports: imports,
        exports: exports,
        dependence: parseFloat(dependence.toFixed(1))
      }
    })
  }

  // Prepare data for year comparison
  const getYearComparisonData = () => {
    if (compareCountries.length === 0) return []
    
    const country = compareCountries[0]
    const data = comparisonData[country]
    if (!data) return []

    return [
      {
        metric: 'GIC',
        baseline: data.baseline?.grossInlandConsumptionRaw || 0,
        current: data.current?.grossInlandConsumptionRaw || 0,
        delta: data.deltas?.GIC_abs || 0,
        deltaPercent: data.deltas?.GIC_pct || 0
      },
      {
        metric: 'Production',
        baseline: data.baseline?.productionRaw || 0,
        current: data.current?.productionRaw || 0,
        delta: data.deltas?.production_abs || 0,
        deltaPercent: data.deltas?.production_pct || 0
      },
      {
        metric: 'Imports',
        baseline: data.baseline?.importsRaw || 0,
        current: data.current?.importsRaw || 0,
        delta: data.deltas?.imports_abs || 0,
        deltaPercent: data.deltas?.imports_pct || 0
      },
      {
        metric: 'Exports',
        baseline: data.baseline?.exportsRaw || 0,
        current: data.current?.exportsRaw || 0,
        delta: data.deltas?.exports_abs || 0,
        deltaPercent: data.deltas?.exports_pct || 0
      }
    ]
  }

  const geoData = getGeoComparisonData()
  const yearData = getYearComparisonData()

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-100 rounded-xl">
            <span className="text-2xl">🔄</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Comparison Tools</h2>
            <p className="text-gray-600 text-sm">Interactive exploration across countries and years</p>
          </div>
        </div>

        {/* Comparison Mode Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {Object.entries(COMPARISON_MODES).map(([key, mode]) => (
            <button
              key={mode}
              onClick={() => setComparisonMode(mode)}
              className={`px-4 py-2 font-medium transition-colors ${
                comparisonMode === mode
                  ? 'border-b-2 border-purple-500 text-purple-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {key === 'GEO' ? 'Geography' : key === 'YEAR' ? 'Timeline' : 'Fuel Mix'}
            </button>
          ))}
        </div>

        {/* Mode-specific controls */}
        {comparisonMode === COMPARISON_MODES.GEO && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm font-semibold text-gray-700 mb-3">Select Countries (max 5)</p>
            <div className="flex flex-wrap gap-2">
              {selectedCountries.map(country => (
                <button
                  key={country}
                  onClick={() => handleCountryToggle(country)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    compareCountries.includes(country)
                      ? 'bg-purple-500 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-purple-500'
                  }`}
                >
                  {country}
                </button>
              ))}
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700 block mb-2">Select Metric</label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {METRICS.map(metric => (
                  <option key={metric.id} value={metric.id}>
                    {metric.label} ({metric.unit})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {comparisonMode === COMPARISON_MODES.YEAR && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm font-semibold text-gray-700 mb-3">Select Country</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedCountries.map(country => (
                <button
                  key={country}
                  onClick={() => setCompareCountries([country])}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    compareCountries[0] === country
                      ? 'bg-purple-500 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-purple-500'
                  }`}
                >
                  {country}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Baseline Year</label>
                <input
                  type="number"
                  value={baselineYear}
                  onChange={(e) => setBaselineYear(parseInt(e.target.value))}
                  min="2005"
                  max={currentYear - 1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Current Year</label>
                <input
                  type="number"
                  value={currentYear}
                  onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                  min={baselineYear + 1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Normalization toggle */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <label className="text-sm font-medium text-gray-700 block mb-2">Normalize By</label>
          <div className="flex gap-2">
            {['raw', 'per-capita', 'per-gdp'].map(option => (
              <button
                key={option}
                onClick={() => setNormalizeBy(option)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  normalizeBy === option
                    ? 'bg-purple-500 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-purple-500'
                }`}
              >
                {option === 'raw' ? 'Absolute' : option === 'per-capita' ? 'Per Capita' : 'Per GDP'}
              </button>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-3"></div>
            <p className="text-gray-500">Loading comparison data...</p>
          </div>
        )}

        {/* Geographic Comparison */}
        {comparisonMode === COMPARISON_MODES.GEO && !isLoading && geoData.length > 0 && (
          <div>
            <div className="bg-gray-50 p-4 rounded-xl mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Country Comparison ({currentYear})</h3>
              <p className="text-xs text-gray-500">Comparing {METRICS.find(m => m.id === selectedMetric)?.label}</p>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={geoData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12 }}
                />
                <YAxis label={{ value: METRICS.find(m => m.id === selectedMetric)?.unit, angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => {
                    if (typeof value === 'string') return value
                    return value.toLocaleString('en-US', { maximumFractionDigits: 0 })
                  }}
                />
                <Bar dataKey={selectedMetric} fill="#9333EA" radius={[8, 8, 0, 0]}>
                  {geoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'][index % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Year Comparison (Dumbbell-style) */}
        {comparisonMode === COMPARISON_MODES.YEAR && !isLoading && yearData.length > 0 && (
          <div>
            <div className="bg-gray-50 p-4 rounded-xl mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Year-over-Year Change</h3>
              <p className="text-xs text-gray-500">{getCountryName(compareCountries[0])}: {baselineYear} → {currentYear}</p>
            </div>
            <div className="space-y-4">
              {yearData.map((item, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{item.metric}</h4>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${item.deltaPercent >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {item.deltaPercent >= 0 ? '+' : ''}{item.deltaPercent.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-600">
                        {item.deltaPercent >= 0 ? '+' : ''}{item.delta.toLocaleString('en-US', { maximumFractionDigits: 0 })} KTOE
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-16">{item.baseline.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                    <div className="flex-1 h-2 bg-gray-300 rounded-full relative">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${Math.min((item.baseline / Math.max(item.baseline, item.current)) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="w-16 text-right">{item.current.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-600">
                    <span>{baselineYear}</span>
                    <span>{currentYear}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fuel Mix Comparison */}
        {comparisonMode === COMPARISON_MODES.BASKET && !isLoading && compareCountries.length > 0 && (
          <div>
            <div className="bg-gray-50 p-4 rounded-xl mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Fuel Mix Comparison ({currentYear})</h3>
              <p className="text-xs text-gray-500">Energy mix composition across selected countries</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {compareCountries.map(country => {
                const data = comparisonData[country] || {}
                const gic = data.grossInlandConsumptionRaw || 0
                return (
                  <div key={country} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-4">{getCountryName(country)}</h4>
                    {gic > 0 ? (
                      <>
                        <div className="space-y-2 mb-4">
                          {FUEL_TYPES.map(fuel => (
                            <div key={fuel.id} className="flex items-center gap-3">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: fuel.color }}
                              ></div>
                              <span className="text-sm text-gray-700 flex-1">{fuel.label}</span>
                              <span className="text-sm font-semibold text-gray-800">–</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">
                          <strong>Total GIC:</strong> {gic.toLocaleString('en-US', { maximumFractionDigits: 0 })} KTOE
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-gray-400">No data available</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && ((comparisonMode === COMPARISON_MODES.GEO && geoData.length === 0) || 
                       (comparisonMode === COMPARISON_MODES.YEAR && yearData.length === 0) ||
                       (comparisonMode === COMPARISON_MODES.BASKET && compareCountries.length === 0)) && (
          <div className="text-center py-12 text-gray-400">
            <p>
              {comparisonMode === COMPARISON_MODES.GEO && 'Select countries to compare'}
              {comparisonMode === COMPARISON_MODES.YEAR && 'Select a country to compare years'}
              {comparisonMode === COMPARISON_MODES.BASKET && 'Select countries to compare fuel mix'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Compute deltas between two years
 */
function computeDeltas(baselineData, currentData) {
  if (!baselineData || !currentData) return {}

  const baseline = {
    GIC: baselineData.grossInlandConsumptionRaw || 0,
    production: baselineData.productionRaw || 0,
    imports: baselineData.importsRaw || 0,
    exports: baselineData.exportsRaw || 0
  }

  const current = {
    GIC: currentData.grossInlandConsumptionRaw || 0,
    production: currentData.productionRaw || 0,
    imports: currentData.importsRaw || 0,
    exports: currentData.exportsRaw || 0
  }

  return {
    GIC_abs: current.GIC - baseline.GIC,
    GIC_pct: baseline.GIC > 0 ? ((current.GIC - baseline.GIC) / baseline.GIC) * 100 : 0,
    production_abs: current.production - baseline.production,
    production_pct: baseline.production > 0 ? ((current.production - baseline.production) / baseline.production) * 100 : 0,
    imports_abs: current.imports - baseline.imports,
    imports_pct: baseline.imports > 0 ? ((current.imports - baseline.imports) / baseline.imports) * 100 : 0,
    exports_abs: current.exports - baseline.exports,
    exports_pct: baseline.exports > 0 ? ((current.exports - baseline.exports) / baseline.exports) * 100 : 0
  }
}
