import { motion } from 'framer-motion'
import { CountrySelector } from './CountrySelector'
import { YearSelector } from './ui/YearSelector'

export function MainControls({
  selectedCountries,
  setSelectedCountries,
  availableCountries,
  selectedYear,
  setSelectedYear,
  years,
  isLoading
}) {
  return (
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
  )
}
