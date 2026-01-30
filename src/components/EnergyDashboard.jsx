import { motion } from 'framer-motion'

export function EnergyDashboard({ selectedCountries, selectedYear, data, isLoading }) {
  const categories = [
    {
      id: 'production',
      label: 'Energy Production',
      icon: '⚡',
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      id: 'imports',
      label: 'Energy Imports',
      icon: '📥',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      id: 'exports',
      label: 'Energy Exports',
      icon: '📤',
      color: 'from-emerald-500 to-green-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      id: 'consumption',
      label: 'Final Consumption',
      icon: '🏭',
      color: 'from-red-500 to-rose-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
    {
      id: 'dependence',
      label: 'Energy Dependence',
      icon: '📊',
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      id: 'available',
      label: 'Available Energy',
      icon: '💡',
      color: 'from-indigo-500 to-blue-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
    }
  ]

  if (selectedCountries.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100"
      >
        <div className="text-7xl mb-6">📊</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Ready to Explore?</h3>
        <p className="text-gray-500 text-lg max-w-md mx-auto">Select countries from the panel above to generate detailed energy insights.</p>
      </motion.div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
        <p className="text-gray-500 text-lg font-medium">Crunching Eurostat data...</p>
      </div>
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
    >
      {categories.map(category => (
        <motion.div
          key={category.id}
          variants={item}
          className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/30 overflow-hidden group hover:-translate-y-2 hover:scale-[1.02]"
        >
          <div className={`h-3 bg-gradient-to-r ${category.color} shadow-inner`} />
          <div className="p-8">
            <div className="flex items-center gap-6 mb-8">
              <div className={`p-4 rounded-3xl ${category.bgColor} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
                <span className="text-3xl filter drop-shadow-sm">{category.icon}</span>
              </div>
              <h3 className={`text-xl font-bold ${category.textColor} group-hover:text-opacity-80 transition-opacity`}>
                {category.label}
              </h3>
            </div>

            <div className="space-y-3">
              {selectedCountries.map(countryCode => (
                <motion.div
                  key={countryCode}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * selectedCountries.indexOf(countryCode) }}
                  className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-300 shadow-sm hover:shadow-md border border-gray-200/50"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex items-center justify-center w-10 h-10 bg-white border-2 border-gray-300 text-gray-800 font-bold rounded-full text-sm shadow-md group-hover:shadow-lg transition-shadow">
                      {countryCode}
                    </span>
                    <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      {countryCode}
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 tabular-nums drop-shadow-sm">
                      {data[countryCode]?.[category.id] || '—'}
                    </p>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                      {category.id === 'dependence' ? 'Dependency' : 'KTOE'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
