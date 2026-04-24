import React from 'react'
import { motion } from 'framer-motion'
import { getCountryName } from '../../data/countryNames'

export function MetricsGrid({
  displayCategories,
  selectedCountries,
  data,
  isLoadingFamilyData
}) {
  if (isLoadingFamilyData) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: Math.max(6, Math.min(displayCategories.length, 10)) }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="relative rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm animate-pulse"
          >
            <div className="h-2 w-full rounded-full bg-gray-200 mb-4" />
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-xl bg-gray-200" />
              <div className="h-4 w-24 rounded bg-gray-200" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: Math.min(selectedCountries.length || 2, 3) }).map((_, rowIdx) => (
                <div key={`row-${rowIdx}`} className="h-9 rounded-lg bg-gray-100" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {displayCategories.map(category => (
        <div
          key={category.id}
          className={`relative bg-white/90 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 border border-white/30 overflow-hidden group hover:-translate-y-1 hover:scale-[1.01] ${isLoadingFamilyData ? 'opacity-75' : ''}`}
        >
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
                      {getCountryName(countryCode)}
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
  )
}