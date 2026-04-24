import React, { useState, useEffect, useMemo, useRef } from 'react'
import { fuelFamilies, fuelKeyMap, categories } from '../data/siecCodes'
import { fetchEnergyData, fetchEnergyDataForYears, fetchPopulationDataForYears, fetchGDPDataForYears, fetchFuelMixDataForCodes } from '../services/eurostat'
import { getAvailableYears } from '../utils/yearUtils'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ScatterChart, Scatter, ComposedChart, Legend } from 'recharts'
import { EnergyMetricsOverview } from '../components/EnergyMetricsOverview'
import { DashboardHeader } from '../components/DashboardHeader'
import { DashboardCharts } from '../components/DashboardCharts'
import { FuelMixDecomposition } from '../components/FuelMixDecomposition'
import { TrendAnalysis } from '../components/TrendAnalysis'
import { EnergyDependencyIndicator } from '../components/EnergyDependencyIndicator'
import { CO2EmissionsLinkage } from '../components/CO2EmissionsLinkage'
import { EnergyIntensityMetrics } from '../components/EnergyIntensityMetrics'
import { TransformationEfficiency } from '../components/TransformationEfficiency'
import { PeakSeasonalDemand } from '../components/PeakSeasonalDemand'
import { SelfSufficiencyRatio } from '../components/SelfSufficiencyRatio'
import { ComparisonTools } from '../components/ComparisonTools'
import { ElectricityGenerationBreakdown } from '../components/ElectricityGenerationBreakdown'
import { SecurityOfSupplyIndicators } from '../components/SecurityOfSupplyIndicators'
import { RenewablesNonRenewables } from '../components/RenewablesNonRenewables'
import { StrategicTransitionSignals } from '../components/StrategicTransitionSignals'
import { PracticalFieldMapping } from '../components/PracticalFieldMapping'
import { SectionCards } from '../components/section-cards'
import { ChartAreaInteractive } from '../components/chart-area-interactive'

export function EnergyDashboard({ selectedCountries, selectedYear, data, fuelMix, isLoading }) {
  const [selectedFamily, setSelectedFamily] = useState(null)
  const [familyFuelData, setFamilyFuelData] = useState({})
  const [isLoadingFamilyData, setIsLoadingFamilyData] = useState(false)
  const [isPreloadingFamilies, setIsPreloadingFamilies] = useState(false)
  const familyCacheRef = useRef(new Map())

  // Energy Intensity Metrics data
  const [intensityData, setIntensityData] = useState({})
  const [isLoadingIntensity, setIsLoadingIntensity] = useState(false)

  const countriesKey = useMemo(() => (
    selectedCountries.length ? [...selectedCountries].sort().join('|') : ''
  ), [selectedCountries])

  const buildFamilyCacheKey = (familyId) => `${countriesKey}|${selectedYear}|${familyId}`

  const extractFamilyData = (allData, family) => {
    const leafNodes = collectLeafNodes(family)
    const fuelKeys = leafNodes
      .map((node) => fuelKeyMap[node.id])
      .filter(Boolean)

    return selectedCountries.reduce((result, country) => {
      result[country] = {}
      fuelKeys.forEach((key) => {
        if (allData[country]?.[key] !== undefined) {
          result[country][key] = allData[country][key]
        }
      })
      return result
    }, {})
  }

  // Preload all families once per country set + year
  useEffect(() => {
    const preloadFamilies = async () => {
      if (!selectedCountries.length) return

      const cacheKey = buildFamilyCacheKey('all')
      if (familyCacheRef.current.has(cacheKey)) return

      setIsPreloadingFamilies(true)
      try {
        const allLeafCodes = Array.from(
          new Set(
            fuelFamilies.flatMap((family) => collectLeafNodes(family).map((node) => node.id))
          )
        )

        const allData = await fetchFuelMixDataForCodes(selectedCountries, selectedYear, allLeafCodes)
        familyCacheRef.current.set(cacheKey, allData)

        fuelFamilies.forEach((family) => {
          const familyKey = buildFamilyCacheKey(family.id)
          if (!familyCacheRef.current.has(familyKey)) {
            familyCacheRef.current.set(familyKey, extractFamilyData(allData, family))
          }
        })

        if (selectedFamily) {
          const selectedKey = buildFamilyCacheKey(selectedFamily.id)
          if (familyCacheRef.current.has(selectedKey)) {
            setFamilyFuelData(familyCacheRef.current.get(selectedKey))
            setIsLoadingFamilyData(false)
          }
        }
      } catch (error) {
        console.error('Error preloading family fuel data:', error)
      } finally {
        setIsPreloadingFamilies(false)
      }
    }

    preloadFamilies()
  }, [countriesKey, selectedYear, selectedCountries, selectedFamily])

  // Fetch fuel data for selected family
  useEffect(() => {
    const fetchFamilyFuelData = async () => {
      if (!selectedFamily || selectedCountries.length === 0) {
        setFamilyFuelData({})
        return
      }

      const cacheKey = buildFamilyCacheKey(selectedFamily.id)
      if (familyCacheRef.current.has(cacheKey)) {
        setFamilyFuelData(familyCacheRef.current.get(cacheKey))
        setIsLoadingFamilyData(false)
        return
      }

      const allKey = buildFamilyCacheKey('all')
      if (familyCacheRef.current.has(allKey)) {
        const allData = familyCacheRef.current.get(allKey)
        const extracted = extractFamilyData(allData, selectedFamily)
        familyCacheRef.current.set(cacheKey, extracted)
        setFamilyFuelData(extracted)
        setIsLoadingFamilyData(false)
        return
      }

      if (isPreloadingFamilies) {
        setIsLoadingFamilyData(true)
        return
      }

      setIsLoadingFamilyData(true)
      try {
        // Get all leaf node codes for the selected family
        const leafNodes = collectLeafNodes(selectedFamily)
        const siecCodes = leafNodes.map(node => node.id)
        
        const familyData = await fetchFuelMixDataForCodes(selectedCountries, selectedYear, siecCodes)
        familyCacheRef.current.set(cacheKey, familyData)
        setFamilyFuelData(familyData)
      } catch (error) {
        console.error('Error fetching family fuel data:', error)
        setFamilyFuelData({})
      } finally {
        setIsLoadingFamilyData(false)
      }
    }

    fetchFamilyFuelData()
  }, [selectedFamily, selectedCountries, selectedYear, countriesKey, isPreloadingFamilies])

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

        const allYears = await getAvailableYears()
        // Use all available years for historical trend analysis
        const years = allYears
        const intensityData = {}
        const [energyDataByYear, populationDataByYear, gdpDataByYear] = await Promise.all([
          fetchEnergyDataForYears(selectedCountries, years),
          fetchPopulationDataForYears(selectedCountries, years),
          fetchGDPDataForYears(selectedCountries, years),
        ])

        for (const year of years) {
          const yearData = {}

          const energyDataAll = energyDataByYear[year] || {}
          const populationDataAll = populationDataByYear[year] || {}
          const gdpDataAll = gdpDataByYear[year] || {}

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
  }, [selectedCountries, selectedYear])

  // Helper function to recursively collect all leaf nodes (fuels with no children)
  const collectLeafNodes = (node) => {
    if (!node.children || node.children.length === 0) {
      return [node];
    }
    return node.children.flatMap(collectLeafNodes);
  };

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
      {/* Dashboard Header */}
      <DashboardHeader
        selectedCountries={selectedCountries}
        selectedYear={selectedYear}
      />

      {/* Dashboard-01 style overview (no sidebar) */}
      <SectionCards
        selectedCountries={selectedCountries}
        selectedYear={selectedYear}
        data={data}
      />

      <div className="px-4 lg:px-6">
        <ChartAreaInteractive
          selectedCountries={selectedCountries}
          selectedYear={selectedYear}
          data={data}
        />
      </div>

      {/* Energy Metrics Overview Section */}
      <EnergyMetricsOverview
        selectedCountries={selectedCountries}
        selectedFamily={selectedFamily}
        setSelectedFamily={setSelectedFamily}
        data={data}
        familyFuelData={familyFuelData}
        isLoadingFamilyData={isLoadingFamilyData}
      />

      {/* Dashboard Charts Section */}
      {selectedCountries.length > 0 && (
        <DashboardCharts
          fuelMix={fuelMix}
          sectors={data}
          selectedCountries={selectedCountries}
        />
      )}

      {/* Fuel Mix Decomposition Section */}
      {selectedCountries.length > 0 && (
        <FuelMixDecomposition
          fuelMix={fuelMix}
          selectedCountries={selectedCountries}
          selectedYear={selectedYear}
        />
      )}

      {/* Trend Analysis Section */}
      {selectedCountries.length > 0 && (
        <TrendAnalysis
          countries={selectedCountries}
          year={selectedYear}
          data={data}
        />
      )}

      {/* Energy Dependency Indicator Section */}
      {selectedCountries.length > 0 && !selectedFamily && (
        <EnergyDependencyIndicator
          selectedCountries={selectedCountries}
          selectedYear={selectedYear}
          data={data}
        />
      )}

      {/* CO₂ Emissions Linkage Section */}
      {selectedCountries.length > 0 && (
        <CO2EmissionsLinkage
          selectedCountries={selectedCountries}
          selectedYear={selectedYear}
          currentData={data}
          fuelMix={fuelMix}
        />
      )}

      {/* Energy Intensity Metrics Section */}
      <EnergyIntensityMetrics 
        selectedCountries={selectedCountries} 
        selectedYear={selectedYear} 
        intensityData={intensityData} 
        isLoadingIntensity={isLoadingIntensity}
      />

      {/* Transformation & Conversion Efficiency Section */}
      {selectedCountries.length > 0 && (
        <TransformationEfficiency
          selectedCountries={selectedCountries}
          selectedYear={selectedYear}
          data={data}
          fuelMix={fuelMix}
        />
      )}

      {/* Peak & Seasonal Demand Section */}
      {selectedCountries.length > 0 && (
        <PeakSeasonalDemand
          selectedCountries={selectedCountries}
          selectedYear={selectedYear}
        />
      )}

      {/* Self-Sufficiency Ratio Section */}
      {selectedCountries.length > 0 && (
        <SelfSufficiencyRatio
          selectedCountries={selectedCountries}
          selectedYear={selectedYear}
          currentData={data}
        />
      )}

      {/* Comparison Tools Section */}
      {selectedCountries.length > 0 && (
        <ComparisonTools 
          selectedCountries={selectedCountries} 
          selectedYear={selectedYear} 
        />
      )}

      {/* Electricity Generation Breakdown Section */}
      {selectedCountries.length > 0 && (
        <ElectricityGenerationBreakdown
          selectedCountries={selectedCountries}
          selectedYear={selectedYear}
          fuelMix={fuelMix}
        />
      )}

      {/* Security of Supply Indicators Section */}
      {selectedCountries.length > 0 && (
        <SecurityOfSupplyIndicators
          selectedCountries={selectedCountries}
          selectedYear={selectedYear}
          currentData={data}
          fuelMix={fuelMix}
        />
      )}

      {/* Renewables vs Non-Renewables Section */}
      {selectedCountries.length > 0 && (
        <RenewablesNonRenewables
          selectedCountries={selectedCountries}
          selectedYear={selectedYear}
          currentData={data}
          fuelMix={fuelMix}
        />
      )}

      {/* Strategic Transition Signals Section */}
      {selectedCountries.length > 0 && (
        <StrategicTransitionSignals
          selectedCountries={selectedCountries}
          selectedYear={selectedYear}
          currentData={data}
          fuelMix={fuelMix}
        />
      )}

      {/* Practical Field Mapping Reference */}
      <PracticalFieldMapping />
    </div>
  )
}

