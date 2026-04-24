import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { RotateCcw, CalendarDays } from 'lucide-react'
import { CountrySelector } from './CountrySelector'
import { YearSelector } from './ui/YearSelector'
import { showToast } from './ui/Toast'
import { Button } from '@/components/ui/button'

export function MainControls({
  selectedCountries,
  setSelectedCountries,
  availableCountries,
  selectedYear,
  setSelectedYear,
  years,
  isLoading
}) {
  const latestYear = years.length ? Math.max(...years) : selectedYear

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
      className="bg-gradient-to-r from-white via-white to-blue-50/60 rounded-2xl shadow-sm border border-blue-100/80 p-6 mb-10"
    >
      <div className="mb-5 flex flex-wrap items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedCountries([])}
          className="border-blue-200 text-blue-900 hover:bg-blue-50"
        >
          <RotateCcw className="size-3.5" />
          Clear countries
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setSelectedYear(latestYear)}
          className="bg-amber-100 text-amber-900 hover:bg-amber-200"
        >
          <CalendarDays className="size-3.5" />
          Latest year
        </Button>
      </div>

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
