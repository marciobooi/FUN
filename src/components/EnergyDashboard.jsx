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
      id: 'available',
      label: 'Available Energy',
      icon: '💡',
      color: 'from-indigo-500 to-blue-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
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
      id: 'net_imports',
      label: 'Net Energy Trade',
      icon: '⚖️',
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600',
      calculate: (data) => (data?.imports || 0) - (data?.exports || 0)
    },
    {
      id: 'self_sufficiency',
      label: 'Energy Self-Sufficiency',
      icon: '🔄',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      calculate: (data) => {
        const production = data?.production || 0;
        const consumption = data?.consumption || 0;
        return consumption > 0 ? ((production / consumption) * 100).toFixed(1) + '%' : '—';
      }
    },
    {
      id: 'efficiency',
      label: 'Energy Efficiency',
      icon: '⚡',
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      calculate: (data) => {
        const available = data?.available || 0;
        const consumption = data?.consumption || 0;
        return available > 0 ? ((consumption / available) * 100).toFixed(1) + '%' : '—';
      }
    },
    {
      id: 'trade_balance',
      label: 'Trade Balance',
      icon: '📈',
      color: 'from-slate-500 to-gray-500',
      bgColor: 'bg-slate-50',
      textColor: 'text-slate-600',
      calculate: (data) => {
        const imports = data?.imports || 0;
        const exports = data?.exports || 0;
        const balance = imports - exports;
        return balance >= 0 ? '+' + balance.toLocaleString() : balance.toLocaleString();
      }
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
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
    >
      {categories.map(category => (
        <motion.div
          key={category.id}
          variants={item}
          className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 border border-white/30 overflow-hidden group hover:-translate-y-1 hover:scale-[1.01]"
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
                <motion.div
                  key={countryCode}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * selectedCountries.indexOf(countryCode) }}
                  className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-300 shadow-sm hover:shadow-md border border-gray-200/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 bg-white border border-gray-300 text-gray-800 font-bold rounded-full text-xs shadow-sm group-hover:shadow-md transition-shadow">
                      {countryCode}
                    </span>
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      {countryCode}
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 tabular-nums drop-shadow-sm">
                      {category.calculate 
                        ? category.calculate(data[countryCode]) 
                        : (data[countryCode]?.[category.id] || '—')
                      }
                    </p>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                      {category.id === 'dependence' ? 'Dependency' : 
                       category.id.includes('sufficiency') || category.id.includes('efficiency') ? 'Ratio' :
                       category.id.includes('balance') || category.id.includes('trade') ? 'KTOE' : 'KTOE'}
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
