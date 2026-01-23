import { useUrlPersistence } from './hooks/useUrlPersistence'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CountrySelector } from './components/CountrySelector'
import { YearSelector } from './components/YearSelector'
import { EnergyDashboard } from './components/EnergyDashboard'
import { EnergyComparisonChart } from './components/EnergyComparisonChart'
import { FuelDecomposition } from './components/FuelDecomposition'
import { FuelMixChart } from './components/FuelMixChart'
import { SectorConsumptionChart } from './components/SectorConsumptionChart'
import { StorytellerMode } from './components/StorytellerMode'
import { ParallaxInfographics } from './components/ParallaxInfographics'
import { useEurostatData } from './hooks/useEurostatData'

function App() {
  // Use URL persistence for state
  const { 
    selectedCountries, 
    setSelectedCountries, 
    selectedYear, 
    setSelectedYear 
  } = useUrlPersistence([], 2023)
  
  const [viewMode, setViewMode] = useState('dashboard') // 'dashboard', 'storyteller', 'infographics'

  const { data, fuelMix, sectors, years, availableCountries, isLoading } = useEurostatData(selectedCountries, selectedYear)


  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-blue-600 text-white p-2 rounded-xl">
               <span className="text-2xl">⚡</span>
             </div>
             <div>
               <h1 className="text-xl font-bold tracking-tight text-gray-900">Energy Universe</h1>
               <p className="text-xs text-gray-500 font-medium">Eurostat nrg_bal_c Explorer</p>
             </div>
          </div>
          
          <nav className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-xl border border-gray-200/50">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'storyteller', label: 'Story Mode', icon: '📖' },
              { id: 'infographics', label: 'Immersive', icon: '🎨' },
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                  viewMode === mode.id
                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <span>{mode.icon}</span>
                {mode.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="pt-28 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Main Controls - Always visible except in immersive maybe? No, let's keep it accessible */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-12"
          >
            <div className="flex flex-col md:flex-row gap-8 items-end">
               <div className="flex-1 w-full">
                 <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Select Countries (Max 3)</label>
                 <CountrySelector
                    selectedCountries={selectedCountries}
                    onCountriesChange={setSelectedCountries}
                    availableCountries={availableCountries}
                  />
               </div>
               <div className="w-full md:w-48">
                 <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Year</label>
                 <YearSelector
                    availableYears={years}
                    selectedYear={selectedYear}
                    onYearChange={setSelectedYear}
                    isLoading={isLoading}
                 />
               </div>
               
               <div className="hidden md:block h-14 w-px bg-gray-100" />
               
               <div className="w-full md:w-auto flex flex-col items-end min-w-[120px]">
                  <span className="text-sm font-medium text-gray-400 mb-1">Status</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
                    <span className="text-sm font-bold text-gray-700">
                      {isLoading ? 'Loading...' : 'Ready'}
                    </span>
                  </div>
               </div>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {viewMode === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-10">
                   <h2 className="text-3xl font-bold text-gray-900 mb-2">
                     {selectedCountries.length > 0 ? 'Energy Metrics Overview' : 'Getting Started'}
                   </h2>
                   <p className="text-gray-500">
                     {selectedCountries.length === 0 
                       ? 'Please select at least one country to view comparative data.' 
                       : `Comparing energy indicators for ${selectedYear}`}
                   </p>
                </div>

                <div className="mb-12">
                   <EnergyDashboard
                      selectedCountries={selectedCountries}
                      selectedYear={selectedYear}
                      data={data}
                      fuelMix={fuelMix}
                      isLoading={isLoading}
                    />
                </div>

                {selectedCountries.length > 0 && (
                  <div className="space-y-8">
                    {/* Fuel Mix Chart */}
                    <FuelMixChart data={fuelMix} selectedCountries={selectedCountries} />
                    
                    {/* Sector Consumption */}
                    <SectorConsumptionChart data={sectors} selectedCountries={selectedCountries} />

                    <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                       <h3 className="text-xl font-bold text-gray-900 mb-8">Fuel Mix Decomposition</h3>
                       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          {selectedCountries.map(country => (
                             <FuelDecomposition key={country} countryCode={country} year={selectedYear} />
                          ))}
                       </div>
                    </section>

                    <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-8">Trend Analysis</h3>
                      <EnergyComparisonChart
                        countries={selectedCountries}
                        year={selectedYear}
                        data={data}
                      />
                    </section>
                  </div>
                )}
              </motion.div>
            )}

            {viewMode === 'storyteller' && (
              <motion.div
                key="storyteller"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <StorytellerMode
                  data={data}
                  fuelMix={fuelMix}
                  sectors={sectors}
                  selectedCountries={selectedCountries}
                  selectedYear={selectedYear}
                />
              </motion.div>
            )}

            {viewMode === 'infographics' && (
              <motion.div
                key="infographics"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ParallaxInfographics
                  data={data}
                  fuelMix={fuelMix}
                  sectors={sectors}
                  selectedCountries={selectedCountries}
                  selectedYear={selectedYear}
                />
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>
      
      {viewMode !== 'infographics' && (
        <footer className="bg-white border-t border-gray-200 py-12 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-500 text-sm mb-4">Energy Universe Dashboard</p>
            <p className="text-gray-400 text-xs">
              Data sourced from Eurostat API (nrg_bal_c). Not an official EU product.
            </p>
          </div>
        </footer>
      )}
    </div>
  )
}

export default App
