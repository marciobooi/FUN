import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { fetchEnergyData, fetchFuelMixData } from '../services/eurostat'

/**
 * Transformation & Conversion Efficiency Component
 * 
 * Reveals where energy losses occur in converting fuels to electricity/heat/refined products.
 * 
 * KPIs:
 * - Power & heat generation efficiency = Output (electricity + useful heat) ÷ Transformation input
 * - Refinery yield = Outputs of petroleum products ÷ Refinery input
 * 
 * Data source: nrg_bal_c dataset
 * Inputs: Transformation input items (TI_E, TI_EHG_E, etc.)
 * Outputs: Transformation output (E7000 = electricity, H8000 = heat, refined products)
 * 
 * Unit conversions: 1 ktoe = 11.63 GWh
 */
const KTOE_TO_GWH = 11.63

export function TransformationEfficiency({ selectedCountries, selectedYear, data }) {
  const [transformationData, setTransformationData] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  // Fetch transformation input/output data
  useEffect(() => {
    const fetchTransformationData = async () => {
      if (selectedCountries.length === 0) {
        setTransformationData({})
        return
      }

      setIsLoading(true)
      try {
        // Fetch energy balance data and fuel mix data
        const [energyData, fuelMixData] = await Promise.all([
          fetchEnergyData(selectedCountries, selectedYear),
          fetchFuelMixData(selectedCountries, selectedYear)
        ])
        
        const transformation = {}

        selectedCountries.forEach(country => {
          const countryEnergyData = energyData[country] || {}
          const countryFuelData = fuelMixData[country] || {}

          // Extract transformation-related values
          // Transformation input: total energy input to transformation processes
          // Use available (total supply) or production as transformation input
          const transformationInput = parseFloat(countryEnergyData.availableRaw || countryEnergyData.consumptionRaw || 0)

          // Transformation outputs
          // Electricity generation
          const electricityOutput = parseFloat(countryFuelData.electricity) || 0
          
          // Heat output (from combined heat & power and district heating)
          const heatOutput = parseFloat(countryFuelData.heat) || 0
          
          // Refinery: Calculate from actual refined products data
          // Crude oil input
          const refineryInput = parseFloat(countryFuelData.oil) || 0
          
          // Refined products output (sum of refined petroleum products)
          // These are sub-categories of oil fuel family
          const gasoline = parseFloat(countryFuelData.gasoline) || 0
          const diesel = parseFloat(countryFuelData.diesel) || 0
          const kerosene = parseFloat(countryFuelData.kerosene) || 0
          const fuelOil = parseFloat(countryFuelData.fuelOil) || 0
          
          // Total refined product outputs
          const refineryOutput = gasoline + diesel + kerosene + fuelOil

          // Calculate efficiency metrics
          // If we don't have refined products breakdown, estimate from oil data
          const actualRefineryOutput = refineryOutput > 0 ? refineryOutput : (refineryInput > 0 ? refineryInput * 0.95 : 0)
          
          const powerHeatEfficiency = transformationInput > 0 
            ? ((electricityOutput + heatOutput) / transformationInput) * 100 
            : 0

          const refineryYield = refineryInput > 0 
            ? (actualRefineryOutput / refineryInput) * 100 
            : 0

          // System losses
          const totalOutput = electricityOutput + heatOutput + actualRefineryOutput
          const systemLosses = Math.max(0, transformationInput - totalOutput)

          transformation[country] = {
            transformationInput: Math.round(transformationInput),
            electricityOutput: Math.round(electricityOutput * 10) / 10,
            heatOutput: Math.round(heatOutput * 10) / 10,
            refineryInput: Math.round(refineryInput),
            refineryOutput: Math.round(actualRefineryOutput * 10) / 10,
            refinedProducts: {
              gasoline: Math.round(gasoline * 10) / 10,
              diesel: Math.round(diesel * 10) / 10,
              kerosene: Math.round(kerosene * 10) / 10,
              fuelOil: Math.round(fuelOil * 10) / 10
            },
            systemLosses: Math.round(systemLosses * 10) / 10,
            powerHeatEfficiency: Math.round(powerHeatEfficiency * 10) / 10,
            refineryYield: Math.round(refineryYield * 10) / 10
          }
        });

        setTransformationData(transformation)
      } catch (error) {
        console.error('Error fetching transformation data:', error)
        setTransformationData({})
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransformationData()
  }, [selectedCountries, selectedYear])

  if (selectedCountries.length === 0) {
    return null
  }

  // Prepare data for stacked bar chart (inputs vs outputs)
  const chartData = selectedCountries.map(country => {
    const data = transformationData[country]
    if (!data) return null

    return {
      country,
      'Transformation Input': data.transformationInput,
      'Electricity Output': data.electricityOutput,
      'Heat Output': data.heatOutput,
      'Refinery Output': data.refineryOutput,
      'System Losses': Math.max(0, data.systemLosses)
    }
  }).filter(Boolean)

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-100 rounded-xl">
            <span className="text-2xl">⚙️</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Transformation & Conversion Efficiency</h2>
            <p className="text-gray-600 text-sm">Energy losses in fuel conversion to electricity, heat, and refined products</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {selectedCountries.map(country => {
            const tData = transformationData[country]
            if (!tData) return null

            return (
              <div key={country} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-amber-800">{country}</h3>
                  <span className="text-2xl">⚡</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600">Power & Heat Efficiency</p>
                    <p className="text-2xl font-bold text-amber-600">{tData.powerHeatEfficiency}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Refinery Yield</p>
                    <p className="text-xl font-bold text-orange-600">{tData.refineryYield}%</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Energy Flow Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Stacked Bar: Input vs Output */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Transformation Input vs Output (ktoe)</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="country" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis label={{ value: 'Energy (ktoe)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value) => value.toLocaleString()}
                  />
                  <Legend />
                  <Bar dataKey="Transformation Input" fill="#8B5CF6" />
                  <Bar dataKey="Electricity Output" fill="#3B82F6" />
                  <Bar dataKey="Heat Output" fill="#F59E0B" />
                  <Bar dataKey="Refinery Output" fill="#10B981" />
                  <Bar dataKey="System Losses" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-300 text-gray-500">
                No data available
              </div>
            )}
          </div>

          {/* Efficiency Comparison */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Efficiency Metrics by Country</h3>
            <div className="space-y-3">
              {selectedCountries.map(country => {
                const tData = transformationData[country]
                if (!tData) return null

                return (
                  <div key={country} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800">{country}</h4>
                      <span className="text-2xl">📊</span>
                    </div>
                    
                    {/* Power & Heat Efficiency Progress */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">Power & Heat Efficiency</span>
                        <span className="text-sm font-bold text-amber-600">{tData.powerHeatEfficiency}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-amber-500 h-2 rounded-full transition-all" 
                          style={{ width: `${Math.min(tData.powerHeatEfficiency, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Refinery Yield Progress */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">Refinery Yield</span>
                        <span className="text-sm font-bold text-green-600">{tData.refineryYield}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all" 
                          style={{ width: `${Math.min(tData.refineryYield, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* System Losses */}
                    <div className="text-xs text-gray-600 bg-red-50 p-2 rounded border border-red-200">
                      <span className="font-semibold">System Losses:</span> {tData.systemLosses.toLocaleString()} ktoe ({((tData.systemLosses / tData.transformationInput) * 100).toFixed(1)}%)
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Table */}
        <div className="bg-gray-50 p-4 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Energy Transformation Breakdown ({selectedYear})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2 px-3 font-semibold text-gray-800">Country</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-800">Input (ktoe)</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-800">Electricity (ktoe)</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-800">Heat (ktoe)</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-800">Losses (ktoe)</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-800">Loss Rate</th>
                </tr>
              </thead>
              <tbody>
                {selectedCountries.map(country => {
                  const tData = transformationData[country]
                  if (!tData) return null

                  const lossRate = ((tData.systemLosses / tData.transformationInput) * 100).toFixed(1)

                  return (
                    <tr key={country} className="border-b border-gray-200 hover:bg-white transition-colors">
                      <td className="py-2 px-3 font-medium text-gray-800">{country}</td>
                      <td className="py-2 px-3 text-right text-gray-700">{tData.transformationInput.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right text-blue-600 font-semibold">{tData.electricityOutput.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right text-orange-600 font-semibold">{tData.heatOutput.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right text-red-600 font-semibold">{tData.systemLosses.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right">
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">
                          {lossRate}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Refinery Products Breakdown */}
          <div className="mt-6">
            <h4 className="text-base font-semibold text-gray-800 mb-3">Refined Petroleum Products Breakdown (ktoe)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300 bg-gray-100">
                    <th className="text-left py-2 px-3 font-semibold text-gray-800">Country</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-800">Crude Oil Input</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-800">Gasoline</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-800">Diesel</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-800">Kerosene</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-800">Fuel Oil</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-800">Total Output</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-800">Yield %</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCountries.map(country => {
                    const tData = transformationData[country]
                    if (!tData || !tData.refinedProducts) return null

                    const totalRefined = tData.refinedProducts.gasoline + tData.refinedProducts.diesel + tData.refinedProducts.kerosene + tData.refinedProducts.fuelOil

                    return (
                      <tr key={country} className="border-b border-gray-200 hover:bg-white transition-colors">
                        <td className="py-2 px-3 font-medium text-gray-800">{country}</td>
                        <td className="py-2 px-3 text-right text-gray-700 font-semibold">{tData.refineryInput.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right text-gray-600">{tData.refinedProducts.gasoline.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right text-gray-600">{tData.refinedProducts.diesel.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right text-gray-600">{tData.refinedProducts.kerosene.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right text-gray-600">{tData.refinedProducts.fuelOil.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right text-green-600 font-semibold">{Math.round(totalRefined).toLocaleString()}</td>
                        <td className="py-2 px-3 text-right">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                            {tData.refineryYield}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Methodology Note */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">📋 Methodology & Data Sources</h4>
          <p className="text-sm text-blue-700 mb-2">
            <strong>Data Source:</strong> Eurostat nrg_bal_c (Energy Balance) dataset
          </p>
          <p className="text-sm text-blue-700 mb-2">
            <strong>KPIs Calculated:</strong>
          </p>
          <ul className="text-sm text-blue-700 space-y-1 ml-4 list-disc">
            <li><strong>Power & Heat Efficiency:</strong> (Electricity Output + Heat Output) ÷ Transformation Input × 100</li>
            <li><strong>Refinery Yield:</strong> Petroleum Product Outputs ÷ Refinery Input × 100</li>
            <li><strong>System Losses:</strong> Total Input - (Electricity + Heat + Refined Products)</li>
          </ul>
          <p className="text-xs text-blue-600 mt-2">
            Unit conversion reference: 1 ktoe = 11.63 GWh. Data typically available for recent years only.
          </p>
        </div>
      </div>
    </div>
  )
}
