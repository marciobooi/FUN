export function DashboardHeader({ selectedCountries, selectedYear }) {
  return (
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
  )
}
