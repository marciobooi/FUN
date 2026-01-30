import { useState, useEffect } from 'react'
import { fuelFamilies } from '../data/siecCodes'
import { fetchFuelMixDataForCodes, fetchEnergyData } from '../services/eurostat'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export function EnergyDashboard({ selectedCountries, selectedYear, data, fuelMix, isLoading }) {
  const [selectedFamily, setSelectedFamily] = useState(null)
  const [familyFuelData, setFamilyFuelData] = useState({})
  const [isLoadingFamilyData, setIsLoadingFamilyData] = useState(false)

  // Energy Dependency Indicator data
  const [dependencyData, setDependencyData] = useState({})
  const [isLoadingDependency, setIsLoadingDependency] = useState(false)

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
    </div>
  )
}

