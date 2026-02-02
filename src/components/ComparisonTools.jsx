import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter } from 'recharts'
import { fetchEnergyData, fetchPopulationData, fetchGDPData } from '../services/eurostat'
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
  const [normalizationData, setNormalizationData] = useState({}) // Population and GDP data
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
          // Fetch both baseline and current year for all selected countries
          const promises = compareCountries.flatMap(country => [
            fetchEnergyData([country], baselineYear),
            fetchEnergyData([country], currentYear)
          ])
          
          const results = await Promise.all(promises)
          
          for (let i = 0; i < compareCountries.length; i++) {
            const country = compareCountries[i]
            const baselineData = results[i * 2]
            const currentData = results[i * 2 + 1]
            
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
        
        // Fetch normalization data (population and GDP)
        const yearForNorm = comparisonMode === COMPARISON_MODES.YEAR ? currentYear : currentYear
        const popData = await fetchPopulationData(compareCountries, yearForNorm)
        const gdpData = await fetchGDPData(compareCountries, yearForNorm)
        
        const normData = {}
        compareCountries.forEach(country => {
          normData[country] = {
            population: (popData[country] || 1) / 1000, // Convert thousands to millions
            gdp: (gdpData[country] || 1) / 1000 // Convert million EUR to billion EUR
          }
        })
        setNormalizationData(normData)
      } catch (error) {
        console.error('Error fetching comparison data:', error)
        setComparisonData({})
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [comparisonMode, compareCountries, baselineYear, currentYear, normalizeBy])



  // Prepare data for geo comparison
  const getGeoComparisonData = () => {
    return compareCountries.map(country => {
      const countryData = comparisonData[country] || {}
      const normData = normalizationData[country] || { population: 1, gdp: 1 }
      const imports = countryData.importsRaw || 0
      const exports = countryData.exportsRaw || 0
      const consumption = countryData.consumptionRaw || 0
      const dependence = consumption > 0 ? ((imports - exports) / consumption) * 100 : 0
      
      let gicValue = countryData.grossInlandConsumptionRaw || 0
      let prodValue = countryData.productionRaw || 0
      let impValue = imports
      let expValue = exports
      
      // Apply normalization
      if (normalizeBy === 'per-capita') {
        gicValue = gicValue / normData.population
        prodValue = prodValue / normData.population
        impValue = impValue / normData.population
        expValue = expValue / normData.population
      } else if (normalizeBy === 'per-gdp') {
        gicValue = gicValue / normData.gdp
        prodValue = prodValue / normData.gdp
        impValue = impValue / normData.gdp
        expValue = expValue / normData.gdp
      }
      
      return {
        name: getCountryName(country),
        code: country,
        GIC: gicValue,
        production: prodValue,
        imports: impValue,
        exports: expValue,
        dependence: parseFloat(dependence.toFixed(1))
      }
    })
  }

  // Prepare data for year comparison
  const getYearComparisonData = () => {
    if (compareCountries.length === 0) return []
    
    const metrics = ['GIC', 'Production', 'Imports', 'Exports']
    const metricLabels = {
      'GIC': 'Gross Inland Consumption',
      'Production': 'Primary Production',
      'Imports': 'Imports',
      'Exports': 'Exports'
    }
    const metricKeyMap = {
      'GIC': 'grossInlandConsumption',
      'Production': 'production',
      'Imports': 'imports',
      'Exports': 'exports'
    }
    const deltaKeyMap = {
      'GIC': 'GIC',
      'Production': 'production',
      'Imports': 'imports',
      'Exports': 'exports'
    }
    
    return metrics.map(metric => {
      const countryData = []
      
      compareCountries.forEach(country => {
        const data = comparisonData[country]
        if (!data) return

        const normData = normalizationData[country] || { population: 1, gdp: 1 }
        const fieldKey = metricKeyMap[metric]
        const deltaKey = deltaKeyMap[metric]
        
        let baseline = data.baseline?.[`${fieldKey}Raw`] || 0
        let current = data.current?.[`${fieldKey}Raw`] || 0
        
        // Apply normalization
        if (normalizeBy === 'per-capita') {
          baseline = baseline / normData.population
          current = current / normData.population
        } else if (normalizeBy === 'per-gdp') {
          baseline = baseline / normData.gdp
          current = current / normData.gdp
        }
        
        // Recalculate deltas after normalization
        const delta = current - baseline
        const deltaPercent = baseline > 0 ? ((current - baseline) / baseline) * 100 : 0
        
        countryData.push({
          country,
          countryName: getCountryName(country),
          baseline,
          current,
          delta,
          deltaPercent
        })
      })

      return {
        metric,
        metricLabel: metricLabels[metric],
        countries: countryData
      }
    })
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
          <div className="mb-6 p-4 bg-gray-50 rounded-xl grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Select Metric</label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {METRICS.map(metric => (
                  <option key={metric.id} value={metric.id}>
                    {metric.label} ({metric.unit})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Normalize By</label>
              <div className="flex gap-2">
                {['raw', 'per-capita', 'per-gdp'].map(option => (
                  <button
                    key={option}
                    onClick={() => setNormalizeBy(option)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-1 ${
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
          </div>
        )}

        {comparisonMode === COMPARISON_MODES.YEAR && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="grid grid-cols-3 gap-4">
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
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Normalize By</label>
                <div className="flex gap-2">
                  {['raw', 'per-capita', 'per-gdp'].map(option => (
                    <button
                      key={option}
                      onClick={() => setNormalizeBy(option)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-1 ${
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
            </div>
          </div>
        )}

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
              <p className="text-xs text-gray-500">
                Comparing {METRICS.find(m => m.id === selectedMetric)?.label} 
                {normalizeBy === 'per-capita' ? ' (per capita)' : normalizeBy === 'per-gdp' ? ' (per GDP)' : ''}
              </p>
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

        {/* Year Comparison (Compact Grid) */}
        {comparisonMode === COMPARISON_MODES.YEAR && !isLoading && yearData.length > 0 && (
          <div>
            <div className="bg-gray-50 p-4 rounded-xl mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Year-over-Year Change</h3>
              <p className="text-xs text-gray-500">{baselineYear} → {currentYear}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {yearData.map((metricGroup) => (
                <div key={metricGroup.metric} className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">{metricGroup.metricLabel}</h4>
                  <div className="space-y-3">
                    {metricGroup.countries.map((country, idx) => (
                      <div key={idx} className="text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-700">{country.countryName}</span>
                          <span className={`text-sm font-bold ${country.deltaPercent >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {country.deltaPercent >= 0 ? '+' : ''}{country.deltaPercent.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="w-12 text-gray-600">{country.baseline.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                          <div className="flex-1 h-1.5 bg-gray-300 rounded-full">
                            <div 
                              className="h-full bg-blue-500 rounded-full" 
                              style={{ width: `${Math.min((country.baseline / Math.max(country.baseline, country.current)) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <span className="w-12 text-right text-gray-600">{country.current.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                        </div>
                      </div>
                    ))}
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
                {/* Data Sources & Methodology */}
        <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
          <h4 className="font-semibold text-purple-800 mb-2">📋 Data Sources & Methodology</h4>
          <p className="text-sm text-purple-700 mb-3">
            <strong>Multi-dimensional energy comparison across countries and years</strong>
          </p>
          <ul className="text-sm text-purple-700 space-y-1 ml-4 list-disc mb-3">
            <li><strong>Energy Balance:</strong> Eurostat nrg_bal_c - Gross Inland Consumption (GIC), Primary Production, Imports, Exports (KTOE)</li>
            <li><strong>Population Data:</strong> Eurostat demo_pjan - Total population (thousands) for per capita normalization</li>
            <li><strong>GDP Data:</strong> Eurostat namq_10_gdp - Gross Domestic Product in million EUR (2010 chain-linked prices) for per GDP normalization</li>
            <li><strong>Normalization Methods:</strong> Absolute (KTOE) | Per Capita (KTOE per million inhabitants) | Per GDP (KTOE per billion EUR)</li>
            <li><strong>Year-over-Year Analysis:</strong> Baseline year vs current year comparison showing percentage and absolute changes</li>
          </ul>
          <p className="text-xs text-purple-600">
            <strong>Data Source:</strong> All data fetched directly from Eurostat APIs. Data availability varies by country and year (typically 2005-present).
          </p>
        </div>
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
