import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ScatterChart, Scatter, Cell } from 'recharts'

export function EnergyIntensityMetrics({ selectedCountries, selectedYear, intensityData, isLoadingIntensity }) {
  if (selectedCountries.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Energy Intensity Metrics</h2>
          {isLoadingIntensity && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Loading intensity data...</span>
            </div>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {selectedCountries.map(countryCode => {
            const currentYearData = intensityData[selectedYear]?.[countryCode]
            if (!currentYearData) return null

            return (
              <div key={countryCode} className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-green-800">{countryCode}</h3>
                  <span className="text-2xl">📊</span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-green-600">
                    {currentYearData.energyPerCapita.toFixed(2)}
                  </p>
                  <p className="text-sm text-green-600">Energy per capita (toe)</p>
                  <p className="text-xs text-gray-600">
                    GDP intensity: {currentYearData.energyIntensity.toFixed(4)} toe/€
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Indexed Line Chart: Long-run trend (1990 = 100) */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Energy Intensity Trends (Country Base Year = 100)</h3>
            <ResponsiveContainer width="100%" height={300}>
              {(() => {
                // Calculate indexed values using each country's earliest available year as base (100)
                const indexedData = Object.keys(intensityData).sort((a, b) => parseInt(a) - parseInt(b)).map(year => {
                  const yearData = intensityData[year]
                  const dataPoint = { year: parseInt(year) }

                  selectedCountries.forEach(country => {
                    const countryData = yearData[country]
                    if (!countryData) return

                    // Find the earliest year this country has data
                    const availableYears = Object.keys(intensityData).filter(y => intensityData[y][country]?.energyPerCapita > 0).sort((a, b) => parseInt(a) - parseInt(b))
                    const baseYear = availableYears[0]
                    const baseData = intensityData[baseYear]?.[country]

                    if (baseData && baseData.energyPerCapita > 0) {
                      dataPoint[`${country}_indexed`] = Math.round((countryData.energyPerCapita / baseData.energyPerCapita) * 100)
                    }
                  })

                  return dataPoint
                }).filter(point => Object.keys(point).length > 1) // Only include years with data

                return indexedData.length > 0 ? (
                  <LineChart data={indexedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis label={{ value: 'Index (Base Year = 100)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      formatter={(value, name) => {
                        const country = name.split('_')[0]
                        const availableYears = Object.keys(intensityData).filter(y => intensityData[y][country]?.energyPerCapita > 0).sort((a, b) => parseInt(a) - parseInt(b))
                        const baseYear = availableYears[0]
                        return [`${value}`, `${country} Energy per Capita Index (Base: ${baseYear})`]
                      }} 
                    />
                    <Legend />
                    {selectedCountries.map((country, index) => {
                      // Only show line if country has any data
                      const hasData = Object.keys(intensityData).some(y => intensityData[y][country]?.energyPerCapita > 0)
                      if (!hasData) return null

                      return (
                        <Line
                          key={country}
                          type="monotone"
                          dataKey={`${country}_indexed`}
                          stroke={`hsl(${index * 360 / selectedCountries.length}, 70%, 50%)`}
                          strokeWidth={2}
                          name={country}
                        />
                      )
                    })}
                  </LineChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No trend data available
                  </div>
                )
              })()}
            </ResponsiveContainer>
          </div>

          {/* Bubble Chart: Per capita vs GDP intensity */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Energy Efficiency Matrix</h3>
            <ResponsiveContainer width="100%" height={300}>
              {(() => {
                const bubbleData = selectedCountries.map(country => {
                  const data = intensityData[selectedYear]?.[country]
                  return data ? {
                    country,
                    perCapita: data.energyPerCapita,
                    gdpIntensity: data.energyIntensity * 10000, // Scale for visibility
                    population: data.population / 1000000, // Population in millions for bubble size
                    gic: data.gic
                  } : null
                }).filter(Boolean)

                return bubbleData.length > 0 ? (
                  <ScatterChart data={bubbleData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      dataKey="perCapita" 
                      name="Energy per Capita" 
                      label={{ value: 'Energy per Capita (toe)', position: 'insideBottom', offset: -5 }} 
                    />
                    <YAxis 
                      type="number" 
                      dataKey="gdpIntensity" 
                      name="GDP Energy Intensity" 
                      label={{ value: 'GDP Energy Intensity (toe/€ × 10⁴)', angle: -90, position: 'insideLeft' }} 
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                              <p className="font-semibold text-gray-800">{`Country: ${data.country}`}</p>
                              <p className="text-blue-600">{`Energy per Capita: ${data.perCapita.toFixed(2)} toe`}</p>
                              <p className="text-green-600">{`GDP Intensity: ${(data.gdpIntensity / 10000).toFixed(4)} toe/€`}</p>
                              <p className="text-purple-600">{`Population: ${data.population.toFixed(1)}M`}</p>
                              <p className="text-orange-600">{`GIC: ${data.gic.toLocaleString()} ktoe`}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Scatter dataKey="gdpIntensity">
                      {bubbleData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`hsl(${index * 360 / bubbleData.length}, 70%, 50%)`}
                          r={Math.sqrt(entry.population) * 3} // Bubble size based on population
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No efficiency data available
                  </div>
                )
              })()}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Methodology Note */}
        <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
          <h4 className="font-semibold text-green-800 mb-2">📋 Methodology & Data Sources</h4>
          <p className="text-sm text-green-700 mb-2">
            Energy intensity metrics normalize consumption by socioeconomic factors.
            Per capita measures show energy use efficiency, while GDP intensity reveals economic decoupling from energy.
          </p>
          <p className="text-xs text-green-600">
            <strong>Data Sources:</strong> GIC from Eurostat nrg_bal_c (GIC, TOTAL, KTOE).
            Population from demo_pjan, GDP from nama_10_gdp. Indexed trends use 1990 baseline.
            Bubble size represents population; tooltips show raw GIC values.
          </p>
        </div>
      </div>
    </div>
  )
}
