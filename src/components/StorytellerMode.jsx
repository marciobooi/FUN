import { useState, useEffect } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadialBarChart, RadialBar } from 'recharts'
import { ChartContainer } from './ChartContainer'
import { motion, AnimatePresence } from 'framer-motion'

const FUEL_COLORS = {
  solidFossil: '#374151',
  oil: '#3B82F6',
  gas: '#F59E0B',
  nuclear: '#8B5CF6',
  renewables: '#10B981',
  electricity: '#EF4444',
  heat: '#F97316'
}

const FUEL_LABELS = {
  solidFossil: 'Solid Fossil',
  oil: 'Oil & Petroleum',
  gas: 'Natural Gas',
  nuclear: 'Nuclear',
  renewables: 'Renewables',
  electricity: 'Electricity',
  heat: 'Heat'
}

const SECTOR_COLORS = {
  industry: '#3B82F6',
  transport: '#F59E0B',
  households: '#10B981',
  commercial: '#8B5CF6'
}

const SECTOR_LABELS = {
  industry: 'Industry',
  transport: 'Transport',
  households: 'Households',
  commercial: 'Commercial'
}

export function StorytellerMode({ data, fuelMix, sectors, selectedCountries, selectedYear }) {
  const [currentStory, setCurrentStory] = useState(0)
  const [isAnimating, setIsAnimating] = useState(true)

  // Helper
  const parseValue = (val) => {
    if (typeof val === 'number') return val
    if (typeof val === 'string') return parseFloat(val.replace(/[^\d.-]/g, '')) || 0
    return 0
  }

  // Calculate aggregated stats
  const countryData = selectedCountries.map(c => ({
    country: c,
    production: parseValue(data[c]?.production),
    imports: parseValue(data[c]?.imports),
    exports: parseValue(data[c]?.exports),
    consumption: parseValue(data[c]?.consumption),
    dependence: parseFloat((data[c]?.dependence || '0').replace('%', ''))
  }))

  // Fuel mix for first country (for demo) or aggregate
  const fuelData = fuelMix[selectedCountries[0]] || {}
  const totalFuel = Object.values(fuelData).reduce((a, b) => a + b, 0)
  const renewableShare = totalFuel > 0 ? ((fuelData.renewables || 0) / totalFuel * 100).toFixed(1) : 0

  // Sector data
  const sectorData = sectors[selectedCountries[0]] || {}
  const totalSector = Object.values(sectorData).reduce((a, b) => a + b, 0)
  const transportShare = totalSector > 0 ? ((sectorData.transport || 0) / totalSector * 100).toFixed(1) : 0

  const stories = [
    {
      id: 'intro',
      title: '🌍 Shedding Light on Energy',
      subtitle: `Energy in ${selectedYear}`,
      description: 'Lighting, heating, moving, producing: energy is vital for our day-to-day life. Let\'s explore how selected countries power their economies.',
      icon: '⚡',
      color: 'from-blue-600 to-indigo-700'
    },
    {
      id: 'mix',
      title: '🛢️ The Energy Mix',
      subtitle: 'Where Does Energy Come From?',
      description: 'The energy available comes from domestic production and imports. Different countries rely on different sources.',
      icon: '⛽',
      color: 'from-amber-500 to-orange-600',
      chart: 'mix'
    },
    {
      id: 'renewables',
      title: '🌱 Renewable Revolution',
      subtitle: 'Clean Energy Share',
      description: `Renewables account for ${renewableShare}% of the energy supply. The transition to green energy is underway.`,
      icon: '♻️',
      color: 'from-green-500 to-emerald-600',
      chart: 'renewables'
    },
    {
      id: 'production',
      title: '⚡ Energy Production',
      subtitle: 'Domestic Supply',
      description: 'Some countries produce most of their energy locally, while others rely heavily on imports.',
      icon: '🏭',
      color: 'from-orange-500 to-red-500',
      chart: 'production'
    },
    {
      id: 'dependency',
      title: '📥 Import Dependency',
      subtitle: 'How Much Is Imported?',
      description: 'Energy security depends on the balance between domestic production and imports.',
      icon: '🚢',
      color: 'from-cyan-500 to-blue-600',
      chart: 'dependency'
    },
    {
      id: 'sectors',
      title: '🏠 Where Energy Goes',
      subtitle: 'Consumption by Sector',
      description: `Transport uses ${transportShare}% of final energy. Industry, households, and commercial sectors share the rest.`,
      icon: '🚗',
      color: 'from-violet-500 to-purple-600',
      chart: 'sectors'
    },
    {
      id: 'insights',
      title: '💡 Key Insights',
      subtitle: 'What We\'ve Learned',
      description: 'Energy tells a story of sustainability, dependency, and economic activity.',
      icon: '🎯',
      color: 'from-emerald-500 to-teal-600',
      chart: 'insights'
    }
  ]

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        if (currentStory < stories.length - 1) setCurrentStory(currentStory + 1)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [currentStory, isAnimating, stories.length])

  const story = stories[currentStory]

  // Prepare chart data
  const fuelChartData = Object.entries(fuelData).map(([key, value]) => ({
    name: FUEL_LABELS[key] || key,
    value,
    fill: FUEL_COLORS[key] || '#666'
  })).filter(d => d.value > 0)

  const sectorChartData = Object.entries(sectorData).map(([key, value]) => ({
    name: SECTOR_LABELS[key] || key,
    value,
    fill: SECTOR_COLORS[key] || '#666'
  })).filter(d => d.value > 0)

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl overflow-hidden">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <motion.div 
          key={story.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`bg-gradient-to-r ${story.color} text-white px-8 py-16 text-center relative overflow-hidden`}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-white rounded-full -ml-36 -mb-36" />
          </div>
          <div className="relative z-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-8xl mb-6"
            >
              {story.icon}
            </motion.div>
            <h1 className="text-5xl font-bold mb-4">{story.title}</h1>
            <p className="text-2xl opacity-90 mb-2">{story.subtitle}</p>
            <p className="text-lg opacity-70 max-w-2xl mx-auto">{story.description}</p>
          </div>
        </motion.div>

        {/* Content */}
        <div className="flex-1 px-8 py-12 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={story.chart || 'empty'}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="w-full max-w-5xl"
            >
              {story.chart === 'mix' && fuelChartData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <ChartContainer className="bg-slate-800/50 rounded-2xl p-6" style={{ height: '400px' }}>
                      <PieChart>
                        <Pie data={fuelChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                          {fuelChartData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                        <Legend />
                      </PieChart>
                    </ChartContainer>
                  <div className="text-white space-y-4">
                    <h3 className="text-3xl font-bold">Energy Sources</h3>
                    <p className="text-gray-300 text-lg">The chart shows how different energy sources contribute to the total available energy for {selectedCountries[0]}.</p>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      {fuelChartData.slice(0, 4).map(d => (
                        <div key={d.name} className="bg-slate-700/50 p-4 rounded-xl">
                          <div className="text-2xl font-bold text-white">{d.value.toLocaleString()}</div>
                          <div className="text-sm text-gray-400">{d.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {story.chart === 'renewables' && (
                <div className="text-center text-white">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-9xl font-bold text-emerald-400 mb-6"
                  >
                    {renewableShare}%
                  </motion.div>
                  <p className="text-2xl text-gray-300">of energy supply comes from renewable sources</p>
                  <div className="mt-8 flex justify-center gap-8">
                    <div className="bg-emerald-900/30 p-6 rounded-2xl">
                      <div className="text-4xl font-bold text-emerald-400">{(fuelData.renewables || 0).toLocaleString()}</div>
                      <div className="text-gray-400">KTOE Renewables</div>
                    </div>
                    <div className="bg-slate-700/50 p-6 rounded-2xl">
                      <div className="text-4xl font-bold text-white">{totalFuel.toLocaleString()}</div>
                      <div className="text-gray-400">KTOE Total</div>
                    </div>
                  </div>
                </div>
              )}

              {story.chart === 'production' && countryData.length > 0 && (
                <ChartContainer className="bg-slate-800/50 rounded-2xl p-6" style={{ height: '400px' }}>
                    <BarChart data={countryData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis type="number" stroke="#888" />
                      <YAxis dataKey="country" type="category" stroke="#888" width={50} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                      <Bar dataKey="production" fill="#f97316" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ChartContainer>
              )}

              {story.chart === 'dependency' && countryData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {countryData.map(d => (
                    <motion.div
                      key={d.country}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-800/50 p-8 rounded-2xl text-center"
                    >
                      <div className="text-5xl font-bold mb-2" style={{ color: d.dependence > 50 ? '#ef4444' : '#22c55e' }}>
                        {d.dependence.toFixed(1)}%
                      </div>
                      <div className="text-gray-400 text-lg mb-4">Import Dependency</div>
                      <div className="text-3xl font-bold text-white">{d.country}</div>
                      <div className="mt-4 text-sm text-gray-500">
                        Imports: {d.imports.toLocaleString()} KTOE
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {story.chart === 'sectors' && sectorChartData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <ChartContainer className="bg-slate-800/50 rounded-2xl p-6" style={{ height: '400px' }}>
                      <BarChart data={sectorChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="name" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {sectorChartData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  <div className="text-white space-y-4">
                    <h3 className="text-3xl font-bold">Energy Consumption</h3>
                    <p className="text-gray-300 text-lg">Final energy consumption by sector shows where energy is actually used in the economy.</p>
                  </div>
                </div>
              )}

              {story.chart === 'insights' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 p-6 rounded-2xl text-white text-center">
                    <div className="text-4xl mb-2">⚡</div>
                    <div className="text-3xl font-bold">{countryData.reduce((a, b) => a + b.production, 0).toLocaleString()}</div>
                    <div className="text-sm opacity-80">Total Production KTOE</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-6 rounded-2xl text-white text-center">
                    <div className="text-4xl mb-2">📥</div>
                    <div className="text-3xl font-bold">{countryData.reduce((a, b) => a + b.imports, 0).toLocaleString()}</div>
                    <div className="text-sm opacity-80">Total Imports KTOE</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-6 rounded-2xl text-white text-center">
                    <div className="text-4xl mb-2">🌱</div>
                    <div className="text-3xl font-bold">{renewableShare}%</div>
                    <div className="text-sm opacity-80">Renewable Share</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-violet-500 p-6 rounded-2xl text-white text-center">
                    <div className="text-4xl mb-2">🚗</div>
                    <div className="text-3xl font-bold">{transportShare}%</div>
                    <div className="text-sm opacity-80">Transport Share</div>
                  </div>
                </div>
              )}

              {!story.chart && (
                <div className="text-center py-12">
                  <div className="text-7xl mb-6">📊</div>
                  <p className="text-gray-300 text-xl">Select countries to see the data story unfold</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="border-t border-gray-700 px-8 py-6 bg-slate-800/50 flex items-center justify-between">
          <button
            onClick={() => { setCurrentStory(Math.max(0, currentStory - 1)); setIsAnimating(false) }}
            disabled={currentStory === 0}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
          >
            ← Previous
          </button>

          <div className="flex-1 mx-8">
            <div className="flex gap-2">
              {stories.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => { setCurrentStory(idx); setIsAnimating(false) }}
                  className={`h-2 flex-1 rounded-full transition-all ${idx === currentStory ? 'bg-gradient-to-r from-blue-400 to-purple-600 h-3' : idx < currentStory ? 'bg-gray-500' : 'bg-gray-700'}`}
                />
              ))}
            </div>
            <div className="text-center mt-3 text-gray-300 text-sm">Chapter {currentStory + 1} of {stories.length}</div>
          </div>

          <button
            onClick={() => { setCurrentStory(Math.min(stories.length - 1, currentStory + 1)); setIsAnimating(false) }}
            disabled={currentStory === stories.length - 1}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
          >
            Next →
          </button>
        </div>

        <div className="px-8 py-3 bg-slate-900 border-t border-gray-700 flex justify-center">
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${isAnimating ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}
          >
            {isAnimating ? '⏸ Pause' : '▶ Play'} Auto-play
          </button>
        </div>
      </div>
    </div>
  )
}
