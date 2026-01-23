const CATEGORIES = [
  {
    id: 'production',
    label: 'Energy Production',
    icon: '⚡',
    color: 'border-eurostat-orange'
  },
  {
    id: 'imports',
    label: 'Energy Imports',
    icon: '📥',
    color: 'border-eurostat-lightBlue'
  },
  {
    id: 'exports',
    label: 'Energy Exports',
    icon: '📤',
    color: 'border-eurostat-green'
  },
  {
    id: 'transformation',
    label: 'Transformation & Conversion',
    icon: '🔄',
    color: 'border-yellow-500'
  },
  {
    id: 'consumption',
    label: 'Final Consumption',
    icon: '🏭',
    color: 'border-red-500'
  },
  {
    id: 'dependence',
    label: 'Energy Dependence',
    icon: '📊',
    color: 'border-purple-500'
  },
  {
    id: 'available',
    label: 'Gross Available Energy',
    icon: '💡',
    color: 'border-eurostat-darkBlue'
  }
]

export function ComparisonGrid({ selectedCountries, selectedYear, data, isLoading }) {
  if (selectedCountries.length === 0) {
    return (
      <div className="bg-eurostat-lightGray rounded-lg p-8 text-center">
        <p className="text-gray-600">Select at least one country to view the comparison grid</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-eurostat-lightGray rounded-lg p-8 text-center">
        <p className="text-gray-600">Loading energy data...</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {CATEGORIES.map(category => (
        <div
          key={category.id}
          className={`border-l-4 ${category.color} bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow`}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{category.icon}</span>
            <h3 className="text-lg font-semibold text-eurostat-darkBlue">{category.label}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedCountries.map(countryCode => (
              <div key={countryCode} className="bg-gray-50 rounded p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{countryCode}</p>
                <p className="text-2xl font-bold text-eurostat-darkBlue">
                  {data[countryCode]?.[category.id] || 'N/A'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Data for {selectedYear}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
