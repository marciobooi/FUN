import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
]

const COUNTRY_NAMES = {
  'AT': 'Austria',
  'BE': 'Belgium',
  'BG': 'Bulgaria',
  'HR': 'Croatia',
  'CY': 'Cyprus',
  'CZ': 'Czech Republic',
  'DK': 'Denmark',
  'EE': 'Estonia',
  'FI': 'Finland',
  'FR': 'France',
  'DE': 'Germany',
  'GR': 'Greece',
  'HU': 'Hungary',
  'IE': 'Ireland',
  'IT': 'Italy',
  'LV': 'Latvia',
  'LT': 'Lithuania',
  'LU': 'Luxembourg',
  'MT': 'Malta',
  'NL': 'Netherlands',
  'PL': 'Poland',
  'PT': 'Portugal',
  'RO': 'Romania',
  'SK': 'Slovakia',
  'SI': 'Slovenia',
  'ES': 'Spain',
  'SE': 'Sweden',
}

export function CountrySelector({ selectedCountries, onCountriesChange, availableCountries = [] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef(null)

  // Use API countries if available, else fallback to hardcoded
  const countries = availableCountries.length > 0 
    ? availableCountries 
    : EU_COUNTRIES.map(code => ({ code, name: COUNTRY_NAMES[code] || code }))

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCountryToggle = (code) => {
    if (selectedCountries.includes(code)) {
      onCountriesChange(selectedCountries.filter(c => c !== code))
    } else if (selectedCountries.length < 3) {
      onCountriesChange([...selectedCountries, code])
    }
  }

  const handleRemoveCountry = (code, e) => {
    e.stopPropagation()
    onCountriesChange(selectedCountries.filter(c => c !== code))
  }

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">
        Select Countries <span className="text-gray-400 font-normal ml-1">({selectedCountries.length}/3)</span>
      </label>
      
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white border rounded-xl px-4 py-3 min-h-[56px] flex flex-wrap gap-2 items-center cursor-pointer shadow-sm transition-all ${
          isOpen ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        {selectedCountries.length === 0 && (
          <span className="text-gray-400 font-medium">Search or select countries...</span>
        )}

        {selectedCountries.map(code => (
          <span
            key={code}
            className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold border border-blue-100 hover:bg-blue-100 transition-colors"
            onClick={(e) => e.stopPropagation()} // Prevent opening dropdown when clicking tag
          >
            {code}
            <button
              onClick={(e) => handleRemoveCountry(code, e)}
              className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-blue-200 text-blue-500 transition-colors"
            >
              ×
            </button>
          </span>
        ))}

        <div className="ml-auto flex items-center pl-2 border-l border-gray-100">
          <span className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
          >
            {/* Search Input */}
            <div className="p-3 border-b border-gray-100 bg-gray-50/50">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input
                  type="text"
                  placeholder="Type to filter..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            
            {/* Options List */}
            <div className="max-h-64 overflow-y-auto p-1 custom-scrollbar">
              {filteredCountries.length > 0 ? (
                filteredCountries.map(c => {
                  const isSelected = selectedCountries.includes(c.code)
                  const isDisabled = !isSelected && selectedCountries.length >= 3
                  
                  return (
                    <div
                      key={c.code}
                      onClick={() => !isDisabled && handleCountryToggle(c.code)}
                      className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-colors mb-1 last:mb-0 ${
                        isSelected
                          ? 'bg-blue-50 text-blue-700'
                          : isDisabled
                            ? 'opacity-50 cursor-not-allowed bg-gray-50 grayscale'
                            : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${
                        isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
                      }`}>
                        {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                           <span className="font-semibold">{c.name}</span>
                           <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{c.code}</span>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="px-4 py-8 text-center text-gray-500">
                  <p className="font-medium">No countries found</p>
                  <p className="text-xs mt-1">Try a different search term</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-100 px-4 py-3 text-xs text-gray-500 flex justify-between">
              <span>{Math.max(0, 3 - selectedCountries.length)} selections remaining</span>
              <button 
                onClick={(e) => { e.stopPropagation(); onCountriesChange([]) }}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                Clear all
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
