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
      className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-sm border border-gray-200/50 p-6 mb-10"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <div>
           <CountrySelector
            selectedCountries={selectedCountries}
            onCountriesChange={setSelectedCountries}
            availableCountries={availableCountries}
          />
        </div>
        
        <div>
            <YearSelector
            availableYears={years}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            isLoading={isLoading}
          />
        </div>

        <div className="flex items-center justify-start md:justify-end">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100/50 border border-gray-200/50">
            <span className={`w-2 h-2 rounded-full transition-colors ${isLoading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-sm font-medium text-gray-700">
              {isLoading ? 'Loading data...' : 'Ready'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
