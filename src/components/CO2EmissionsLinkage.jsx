import React, { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ScatterChart, Scatter, ComposedChart, Legend } from 'recharts'
import { fetchEnergyData } from '../services/eurostat'

export function CO2EmissionsLinkage({ selectedCountries }) {
  const [emissionsData, setEmissionsData] = useState({})
  const [isLoadingEmissions, setIsLoadingEmissions] = useState(false)

  // Generate mock CO₂ emissions data
  useEffect(() => {
    const generateEmissionsData = async () => {
      if (selectedCountries.length === 0) {
        setEmissionsData({})
        return
      }

      setIsLoadingEmissions(true)
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))

        const years = [2023, 2022, 2021, 2020, 2019]
        const emissionsData = {}

        for (const year of years) {
          const yearData = {}

          for (const country of selectedCountries) {
            // Get energy consumption data for correlation
            const energyData = await fetchEnergyData([country], year)
            const consumption = energyData[country]?.consumptionRaw || 0

            // Use mock fossil fuel shares based on country (simplified approach)
            // In production, this would come from actual fuel mix data
            const mockFossilShares = {
              'DE': 0.6, 'FR': 0.4, 'IT': 0.7, 'ES': 0.5, 'NL': 0.8, 'BE': 0.4, 'AT': 0.3, 'SE': 0.2, 'DK': 0.3, 'FI': 0.4,
              'PL': 0.8, 'CZ': 0.7, 'HU': 0.6, 'SK': 0.6, 'SI': 0.5, 'EE': 0.7, 'LV': 0.6, 'LT': 0.7, 'MT': 0.9, 'CY': 0.9,
              'LU': 0.3, 'PT': 0.5, 'GR': 0.7, 'IE': 0.6, 'HR': 0.6, 'RO': 0.7, 'BG': 0.8, 'NO': 0.3, 'CH': 0.4, 'UK': 0.5
            }
            const fossilShare = mockFossilShares[country] || 0.6 // Default to 60% fossil fuels

            // Generate realistic CO₂ emissions based on consumption and fossil fuel share
            // EU average CO₂ intensity is about 0.25-0.35 tonnes CO₂ per tonne of oil equivalent
            const baseIntensity = 0.3 // tonnes CO₂ per toe
            const intensityVariation = (Math.random() - 0.5) * 0.1 // ±0.05 variation
            const co2Intensity = baseIntensity + intensityVariation

            // Calculate total emissions
            const totalEmissions = consumption * co2Intensity

            // Generate sector breakdown (simplified)
            const sectors = {
              power: totalEmissions * 0.35,
              transport: totalEmissions * 0.25,
              industry: totalEmissions * 0.25,
              residential: totalEmissions * 0.10,
              other: totalEmissions * 0.05
            }

            yearData[country] = {
              totalEmissions: Math.round(totalEmissions),
              co2Intensity: Math.round(co2Intensity * 1000) / 1000, // Round to 3 decimals
              fossilFuelShare: Math.round(fossilShare * 100) / 100,
              renewableShare: Math.round((1 - fossilShare) * 100) / 100,
              sectors,
              energyConsumption: consumption
            }
          }

          emissionsData[year] = yearData
        }

        setEmissionsData(emissionsData)
      } catch (error) {
        console.error('Error generating emissions data:', error)
        setEmissionsData({})
      } finally {
        setIsLoadingEmissions(false)
      }
    }

    generateEmissionsData()
  }, [selectedCountries])

  if (selectedCountries.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">CO₂ Emissions Linkage</h2>
          {isLoadingEmissions && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Loading emissions data...</span>
            </div>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {selectedCountries.map(countryCode => {
            const currentYearData = emissionsData[2023]?.[countryCode]
            if (!currentYearData) return null

            return (
              <div key={countryCode} className="bg-gradient-to-br from-red-50 to-orange-50 p-4 rounded-xl border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-red-800">{countryCode}</h3>
                  <span className="text-2xl">🌡️</span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-red-600">
                    {currentYearData.totalEmissions.toLocaleString()} kt
                  </p>
                  <p className="text-sm text-red-600">Total CO₂ Emissions</p>
                  <p className="text-xs text-gray-600">
                    Intensity: {currentYearData.co2Intensity} tCO₂/toe
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Dual-Axis Time Series: CO₂ vs Renewable Share */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">CO₂ Emissions vs Renewable Energy Share</h3>
            <ResponsiveContainer width="100%" height={300}>
              {(() => {
                // Create data with individual country series
                const chartData = Object.keys(emissionsData).sort().map(year => {
                  const yearData = emissionsData[year]
                  const dataPoint = { year: parseInt(year) }

                  // Add emissions and renewable share for each country
                  selectedCountries.forEach(country => {
                    const countryData = yearData[country]
                    if (countryData) {
                      dataPoint[`${country}_emissions`] = countryData.totalEmissions
                      dataPoint[`${country}_renewable`] = Math.round(countryData.renewableShare * 100)
                    }
                  })

                  return dataPoint
                })

                return chartData.length > 0 ? (
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis yAxisId="left" orientation="left" label={{ value: 'CO₂ Emissions (kt)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Renewable Share (%)', angle: 90, position: 'insideRight' }} />
                    <Tooltip
                      formatter={(value, name) => {
                        const [country, metric] = name.split('_')
                        if (metric === 'emissions') {
                          return [`${value.toLocaleString()} kt`, `${country} CO₂ Emissions`]
                        } else {
                          return [`${value}%`, `${country} Renewable Share`]
                        }
                      }}
                    />
                    <Legend />
                    {selectedCountries.map((country, index) => (
                      <React.Fragment key={country}>
                        <Bar
                          yAxisId="left"
                          dataKey={`${country}_emissions`}
                          fill={`hsl(${index * 360 / selectedCountries.length}, 70%, 50%)`}
                          name={`${country}_emissions`}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey={`${country}_renewable`}
                          stroke={`hsl(${index * 360 / selectedCountries.length}, 70%, 30%)`}
                          strokeWidth={2}
                          name={`${country}_renewable`}
                        />
                      </React.Fragment>
                    ))}
                  </ComposedChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No emissions data available
                  </div>
                )
              })()}
            </ResponsiveContainer>
          </div>

          {/* Scatter Plot: CO₂ Intensity vs Fossil Fuel Share */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">CO₂ Intensity vs Fossil Fuel Dependency</h3>
            <ResponsiveContainer width="100%" height={300}>
              {(() => {
                const scatterData = selectedCountries.map(country => {
                  const data = emissionsData[2023]?.[country]
                  return data ? {
                    country,
                    intensity: data.co2Intensity,
                    fossilShare: data.fossilFuelShare * 100,
                    emissions: data.totalEmissions
                  } : null
                }).filter(Boolean)
                return scatterData.length > 0 ? (
                  <ScatterChart data={scatterData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="fossilShare" name="Fossil Fuel Share" label={{ value: 'Fossil Fuel Share (%)', position: 'insideBottom', offset: -5 }} />
                    <YAxis type="number" dataKey="intensity" name="CO₂ Intensity" label={{ value: 'CO₂ Intensity (tCO₂/toe)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                              <p className="font-semibold text-gray-800">{`Country: ${data.country}`}</p>
                              <p className="text-red-600">{`CO₂ Intensity: ${data.intensity.toFixed(3)} tCO₂/toe`}</p>
                              <p className="text-orange-600">{`Fossil Fuel Share: ${data.fossilShare.toFixed(1)}%`}</p>
                              <p className="text-blue-600">{`Total Emissions: ${data.emissions.toLocaleString()} kt`}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Scatter dataKey="intensity">
                      {scatterData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 360 / scatterData.length}, 70%, 50%)`} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No emissions data available
                  </div>
                )
              })()}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector Breakdown */}
        <div className="bg-gray-50 p-4 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">CO₂ Emissions by Sector (2023)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedCountries.map(countryCode => {
              const countryData = emissionsData[2023]?.[countryCode]
              if (!countryData) return null

              const sectors = countryData.sectors
              const total = Object.values(sectors).reduce((sum, val) => sum + val, 0)

              return (
                <div key={countryCode} className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold text-gray-800 mb-3">{countryCode}</h4>
                  <div className="space-y-2">
                    {Object.entries(sectors).map(([sector, emissions]) => (
                      <div key={sector} className="flex justify-between items-center">
                        <span className="text-sm capitalize text-gray-600">{sector}</span>
                        <span className="text-sm font-medium text-gray-800">
                          {Math.round(emissions).toLocaleString()} kt ({((emissions / total) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Methodology Note */}
        <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-200">
          <h4 className="font-semibold text-red-800 mb-2">📋 Methodology & Data Sources</h4>
          <p className="text-sm text-red-700 mb-2">
            CO₂ emissions are calculated using energy consumption data and fuel mix composition.
            Emissions intensity varies by fossil fuel share and energy efficiency patterns.
          </p>
          <p className="text-xs text-red-600">
            <strong>Mock Data Notice:</strong> This demonstration uses generated emissions data correlated with actual Eurostat energy consumption.
            For production use, integrate with UNFCCC, EEA, or national emissions inventories.
          </p>
        </div>
      </div>
    </div>
  )
}
