import React, { useState, useEffect } from 'react'
import { fuelFamilies } from '../data/siecCodes'
import { fetchEnergyData, fetchPopulationData, fetchGDPData } from '../services/eurostat'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ScatterChart, Scatter, ComposedChart, Legend } from 'recharts'

export function EnergyDashboard({ selectedCountries, selectedYear, data, fuelMix, isLoading }) {
  const [selectedFamily, setSelectedFamily] = useState(null)
  const [familyFuelData, setFamilyFuelData] = useState({})
  const [isLoadingFamilyData, setIsLoadingFamilyData] = useState(false)

  // Energy Dependency Indicator data
  const [dependencyData, setDependencyData] = useState({})
  const [isLoadingDependency, setIsLoadingDependency] = useState(false)

  // CO₂ Emissions Linkage data
  const [emissionsData, setEmissionsData] = useState({})
  const [isLoadingEmissions, setIsLoadingEmissions] = useState(false)

  // Energy Intensity Metrics data
  const [intensityData, setIntensityData] = useState({})
  const [isLoadingIntensity, setIsLoadingIntensity] = useState(false)

  // Fetch fuel data for selected family
  useEffect(() => {
    const fetchFamilyFuelData = async () => {
      if (!selectedFamily || selectedCountries.length === 0) {
        setFamilyFuelData({})
        return
      }

      setIsLoadingFamilyData(true)
      try {
        // Get all leaf node codes for the selected family
        const leafNodes = collectLeafNodes(selectedFamily)
        const siecCodes = leafNodes.map(node => node.id)
        
        const familyData = await fetchFuelMixDataForCodes(selectedCountries, selectedYear, siecCodes)
        setFamilyFuelData(familyData)
      } catch (error) {
        console.error('Error fetching family fuel data:', error)
        setFamilyFuelData({})
      } finally {
        setIsLoadingFamilyData(false)
      }
    }

    fetchFamilyFuelData()
  }, [selectedFamily, selectedCountries, selectedYear])

  // Fetch historical energy dependency data
  useEffect(() => {
    const fetchDependencyData = async () => {
      if (selectedCountries.length === 0) {
        setDependencyData({})
        return
      }

      setIsLoadingDependency(true)
      try {
        // Fetch data for last 5 years
        const years = [2023, 2022, 2021, 2020, 2019]
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
  }, [selectedCountries])

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

  // Generate energy intensity metrics data
  useEffect(() => {
    const generateIntensityData = async () => {
      if (selectedCountries.length === 0) {
        setIntensityData({})
        return
      }

      setIsLoadingIntensity(true)
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 600))

        const years = [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2010, 2005, 2000, 1995, 1990]
        const intensityData = {}

        for (const year of years) {
          const yearData = {}

          // Fetch data for all selected countries at once
          const energyDataAll = await fetchEnergyData(selectedCountries, year)
          const populationDataAll = await fetchPopulationData(selectedCountries, year)
          const gdpDataAll = await fetchGDPData(selectedCountries, year)

          for (const country of selectedCountries) {
            // Get GIC (Gross Inland Consumption) data
            const gic = energyDataAll[country]?.consumptionRaw || 0

            if (gic === 0) continue

            // Get population data
            const populationThousands = populationDataAll[country] || 0

            // Get GDP data
            const gdpMillionEur = gdpDataAll[country] || 0

            if (populationThousands === 0 || gdpMillionEur === 0) continue

            // Calculate intensity metrics
            const energyPerCapita = (gic / populationThousands) * 1000 // toe per capita (convert from thousands to actual population)
            const energyIntensity = gic / gdpMillionEur // toe per million EUR

            yearData[country] = {
              gic: Math.round(gic),
              population: Math.round(populationThousands * 1000), // Convert to actual population
              gdp: Math.round(gdpMillionEur),
              energyPerCapita: Math.round(energyPerCapita * 100) / 100,
              energyIntensity: Math.round(energyIntensity * 10000) / 10000, // Round to 4 decimals
              year
            }
          }

          intensityData[year] = yearData
        }

        setIntensityData(intensityData)
      } catch (error) {
        console.error('Error generating intensity data:', error)
        setIntensityData({})
      } finally {
        setIsLoadingIntensity(false)
      }
    }

    generateIntensityData()
  }, [selectedCountries])

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

  // Calculate fossil fuel share from fuel mix data
  const calculateFossilShare = (fuelMix) => {
    const fossilFuels = ['solidFossil', 'oil', 'gas']
    const totalConsumption = Object.values(fuelMix).reduce((sum, value) => sum + (value || 0), 0)

    if (totalConsumption === 0) return 0

    const fossilConsumption = fossilFuels.reduce((sum, fuel) => sum + (fuelMix[fuel] || 0), 0)
    return fossilConsumption / totalConsumption
  }

  // Mapping from siec codes to fuelMix keys
  const fuelKeyMap = {
    'C0000X0350-0370': 'solidFossil',
    'O4000XBIO': 'oil',
    'G3000': 'gas',
    'RA000': 'renewables',
    'N900H': 'nuclear',
    'E7000': 'electricity',
    'W6100_6220': 'waste',
    'H8000': 'heat',
    // Detailed solid fossil fuels
    'C0100': 'hardCoal',
    'C0110': 'anthracite',
    'C0121': 'cokingCoal',
    'C0129': 'otherBituminousCoal',
    'C0200': 'brownCoal',
    'C0210': 'subBituminousCoal',
    'C0220': 'lignite',
    'C0300': 'derivedCoal',
    'C0311': 'cokeOvenCoke',
    'C0312': 'gasCoke',
    'C0320': 'patentFuel',
    'C0330': 'brownCoalBriquettes',
    'C0340': 'coalTar',
    'C0350-0370': 'manufacturedGases',
    'C0350': 'cokeOvenGas',
    'C0360': 'gasWorksGas',
    'C0371': 'blastFurnaceGas',
    'C0379': 'otherRecoveredGases',
    // Other detailed fuels
    'O4100_TOT': 'crudeOil',
    'O4650': 'gasoline',
    'O4660': 'kerosene',
    'O4671XR5220B': 'diesel',
    'O4680': 'fuelOil',
    'RA100': 'hydro',
    'RA300': 'wind',
    'RA400': 'solar',
    'R5000': 'biofuels',
    'W6100': 'industrialWaste',
    'W6210': 'renewableMunicipalWaste',
    'W6220': 'nonRenewableMunicipalWaste'
  };

  const categories = [
    {
      id: 'production',
      label: 'Energy Production',
      icon: '⚡',
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      id: 'imports',
      label: 'Energy Imports',
      icon: '📥',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      id: 'exports',
      label: 'Energy Exports',
      icon: '📤',
      color: 'from-emerald-500 to-green-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      id: 'consumption',
      label: 'Final Consumption',
      icon: '🏭',
      color: 'from-red-500 to-rose-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
    {
      id: 'available',
      label: 'Available Energy',
      icon: '💡',
      color: 'from-indigo-500 to-blue-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
    },
    {
      id: 'dependence',
      label: 'Energy Dependence',
      icon: '📊',
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      id: 'net_imports',
      label: 'Net Energy Trade',
      icon: '⚖️',
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600',
      calculate: (data, countryCode) => {
        const imp = data?.importsRaw || 0;
        const exp = data?.exportsRaw || 0;
        const balance = imp - exp;
        return balance.toLocaleString();
      }
    },
    {
      id: 'self_sufficiency',
      label: 'Energy Self-Sufficiency',
      icon: '🔄',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      calculate: (data, countryCode) => {
        const production = data?.productionRaw || 0;
        const consumption = data?.consumptionRaw || 0;
        return consumption > 0 ? ((production / consumption) * 100).toFixed(1) + '%' : '—';
      }
    },
    {
      id: 'efficiency',
      label: 'Energy Efficiency',
      icon: '⚡',
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      calculate: (data, countryCode) => {
        const available = data?.availableRaw || 0;
        const consumption = data?.consumptionRaw || 0;
        return available > 0 ? ((consumption / available) * 100).toFixed(1) + '%' : '—';
      }
    },
    {
      id: 'trade_balance',
      label: 'Trade Balance',
      icon: '📈',
      color: 'from-slate-500 to-gray-500',
      bgColor: 'bg-slate-50',
      textColor: 'text-slate-600',
      calculate: (data, countryCode) => {
        const imports = data?.importsRaw || 0;
        const exports = data?.exportsRaw || 0;
        const balance = imports - exports;
        return balance >= 0 ? '+' + balance.toLocaleString() : balance.toLocaleString();
      }
    }
  ]

  // Helper function to recursively collect all leaf nodes (fuels with no children)
  const collectLeafNodes = (node) => {
    if (!node.children || node.children.length === 0) {
      return [node];
    }
    return node.children.flatMap(collectLeafNodes);
  };

  // Generate fuel-specific categories when a family is selected
  const getFuelCategories = (family) => {
    if (!family) return categories;

    // Collect all leaf nodes (detailed fuel types) from the family hierarchy
    const leafNodes = collectLeafNodes(family);
    
    // Return ONLY fuel-specific categories when a family is selected
    return leafNodes.map(leaf => ({
      id: leaf.id,
      label: leaf.name,
      icon: '🔥',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',

      calculate: (countryData, countryCode) => {
        const fuelKey = fuelKeyMap[leaf.id];
        
        // Show loading indicator if data is being fetched
        if (isLoadingFamilyData) {
          return '...';
        }
        
        // Check if we have fuel data for this country and fuel type
        if (fuelKey && familyFuelData && familyFuelData[countryCode] && familyFuelData[countryCode][fuelKey] !== null && familyFuelData[countryCode][fuelKey] !== undefined && !isNaN(familyFuelData[countryCode][fuelKey]) && familyFuelData[countryCode][fuelKey] !== 0) {
          const value = familyFuelData[countryCode][fuelKey];
          return Number(value).toLocaleString();
        }
        
        // No data available
        return '—';
      }
    }));
  };

  const displayCategories = selectedFamily ? getFuelCategories(selectedFamily) : categories;

  if (selectedCountries.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
        <div className="text-7xl mb-6">📊</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Ready to Explore?</h3>
        <p className="text-gray-500 text-lg max-w-md mx-auto">Select countries from the panel above to generate detailed energy insights.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
        <p className="text-gray-500 text-lg font-medium">Crunching Eurostat data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Fuel Family Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => setSelectedFamily(null)}
          className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
            selectedFamily === null
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:shadow-md'
          }`}
        >
          All Metrics
        </button>
        {fuelFamilies.map(family => (
          <button
            key={family.id}
            onClick={() => setSelectedFamily(family)}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
              selectedFamily?.id === family.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:shadow-md'
            }`}
          >
            {family.name}
          </button>
        ))}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {displayCategories.map(category => (
          <div
            key={category.id}
            className={`relative bg-white/90 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 border border-white/30 overflow-hidden group hover:-translate-y-1 hover:scale-[1.01] ${isLoadingFamilyData ? 'opacity-75' : ''}`}
          >
            {isLoadingFamilyData && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="text-xs text-gray-600 font-medium">Loading data...</span>
                </div>
              </div>
            )}
            <div className={`h-2 bg-gradient-to-r ${category.color} shadow-inner`} />
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-xl ${category.bgColor} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md group-hover:shadow-lg`}>
                  <span className="text-xl filter drop-shadow-sm">{category.icon}</span>
                </div>
                <h3 className={`text-sm font-bold ${category.textColor} group-hover:text-opacity-80 transition-opacity leading-tight`}>
                  {category.label}
                </h3>
              </div>

              <div className="space-y-2">
                {selectedCountries.map(countryCode => (
                  <div
                    key={countryCode}
                    className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-300 shadow-sm hover:shadow-md border border-gray-200/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 bg-white border border-gray-300 text-gray-800 font-bold rounded-full text-xs shadow-sm group-hover:shadow-md transition-shadow">
                        {countryCode}
                      </span>
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                        {countryCode}
                      </span>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 tabular-nums drop-shadow-sm">
                        {category.calculate 
                          ? category.calculate.length === 2 
                            ? category.calculate(data[countryCode], countryCode) 
                            : category.calculate(data[countryCode])
                          : (data[countryCode]?.[category.id] && data[countryCode][category.id] !== '—' ? data[countryCode][category.id] : '—')
                        }
                      </p>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        {category.id === 'dependence' ? 'Dependency' : 
                         category.id.includes('sufficiency') || category.id.includes('efficiency') ? 'Ratio' :
                         category.id.includes('balance') || category.id.includes('trade') ? 'KTOE' : 'KTOE'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Energy Dependency Indicator Section */}
      {selectedCountries.length > 0 && !selectedFamily && (
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
              <h3 className="text-xl font-bold text-gray-800 mb-4">Dependency Trend (2019-2023)</h3>
              <div className="bg-gray-50 rounded-2xl p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={(() => {
                    const years = [2019, 2020, 2021, 2022, 2023]
                    return years.map(year => {
                      const dataPoint = { year: year.toString() }
                      selectedCountries.forEach(countryCode => {
                        const dependency = calculateDependency(dependencyData[year], countryCode)
                        dataPoint[countryCode] = dependency
                      })
                      return dataPoint
                    })
                  })()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="year" 
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
                      formatter={(value, name) => [`${value}%`, name]}
                    />
                    {selectedCountries.map((countryCode, index) => (
                      <Line
                        key={countryCode}
                        type="monotone"
                        dataKey={countryCode}
                        stroke={`hsl(${(index * 137) % 360}, 70%, 50%)`}
                        strokeWidth={3}
                        dot={{ fill: `hsl(${(index * 137) % 360}, 70%, 50%)`, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: `hsl(${(index * 137) % 360}, 70%, 50%)`, strokeWidth: 2 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Country Comparison Chart */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Country Comparison ({selectedYear})</h3>
              <div className="bg-gray-50 rounded-2xl p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={selectedCountries.map(countryCode => {
                    const dependency = calculateDependency(data, countryCode)
                    return {
                      country: countryCode,
                      dependency: dependency,
                      fill: dependency > 50 ? '#ef4444' : dependency > 25 ? '#f97316' : '#22c55e'
                    }
                  })}>
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
                      {selectedCountries.map((countryCode, index) => {
                        const dependency = calculateDependency(data, countryCode)
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={dependency > 50 ? '#ef4444' : dependency > 25 ? '#f97316' : '#22c55e'} 
                          />
                        )
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
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
      )}

      {/* CO₂ Emissions Linkage Section */}
      {selectedCountries.length > 0 && (
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
      )}

      {/* Energy Intensity Metrics Section */}
      {selectedCountries.length > 0 && (
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
                const currentYearData = intensityData[2023]?.[countryCode]
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
                      const data = intensityData[2023]?.[country]
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
      )}
    </div>
  )
}

