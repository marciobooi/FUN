import { useUrlPersistence } from './hooks/useUrlPersistence'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from './components/Header'
import { MainControls } from './components/MainControls'
import { Footer } from './components/Footer'
import { EnergyDashboard } from './pages/EnergyDashboard'
import { StorytellerMode } from './pages/StorytellerMode'
import { ParallaxInfographics } from './pages/ParallaxInfographics'
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
      <Header viewMode={viewMode} setViewMode={setViewMode} />

      <main className="pt-28 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Main Controls */}
          <MainControls
            selectedCountries={selectedCountries}
            setSelectedCountries={setSelectedCountries}
            availableCountries={availableCountries}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            years={years}
            isLoading={isLoading}
          />

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
      
      {/* Footer */}
      <Footer viewMode={viewMode} />
    </div>
  )
}

export default App
