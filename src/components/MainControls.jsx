import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { CountrySelector } from './CountrySelector'
import { YearSelector } from './ui/YearSelector'
import { showToast } from './ui/Toast'

export function MainControls({
  selectedCountries,
  setSelectedCountries,
  availableCountries,
  selectedYear,
  setSelectedYear,
  years,
  isLoading
}) {
  useEffect(() => {
    if (isLoading) {
      showToast('Loading data...', 'alert', 10000)
    } else {
      showToast('Ready', 'success', 3000)
    }
  }, [isLoading])
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-sm border border-gray-200/50 p-6 mb-10"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">Countries</label>
          <CountrySelector
            selectedCountries={selectedCountries}
            onCountriesChange={setSelectedCountries}
            availableCountries={availableCountries}
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">Year</label>
          <YearSelector
            availableYears={years}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            isLoading={isLoading}
          />
        </div>
      </div>
    </motion.div>
  )
}
