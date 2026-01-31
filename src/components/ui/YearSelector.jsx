import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function YearSelector({ availableYears, selectedYear, onYearChange, isLoading }) {
  const [isOpen, setIsOpen] = useState(false)

  // Sort years descending
  const years = [...availableYears].sort((a, b) => b - a)

  return (
    <div className="relative w-full">
      <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">
        Select Year
      </label>
      
      <div className="relative">
        <button
          onClick={() => !isLoading && setIsOpen(!isOpen)}
          disabled={isLoading}
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-left flex items-center justify-between shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="font-bold text-gray-800 text-lg">
            {isLoading ? 'Loading...' : selectedYear || 'Year'}
          </span>
          <span className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto z-50 p-2"
              >
                {years.map(year => (
                  <button
                    key={year}
                    onClick={() => {
                      onYearChange(year)
                      setIsOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedYear === year 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </motion.div>
              
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsOpen(false)} 
              />
            </>
          )}
        </AnimatePresence>
      </div>

    </div>
  )
}
