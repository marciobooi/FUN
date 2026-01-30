import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, RadialBarChart, RadialBar } from 'recharts'
import { ChartContainer } from '../components/ui/ChartContainer'

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
  solidFossil: 'Coal & Fossil',
  oil: 'Oil',
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

export function ParallaxInfographics({ data, fuelMix, sectors, selectedCountries, selectedYear }) {
  const containerRef = useRef(null)
  
  if (!data || Object.keys(data).length === 0 || selectedCountries.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-10 bg-white rounded-3xl shadow-xl max-w-lg">
          <div className="text-6xl mb-6">🌌</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Awaiting Data</h2>
          <p className="text-gray-500 text-lg">Select countries in the dashboard to begin the immersive journey.</p>
        </div>
      </div>
    )
  }

  const parseValue = (val) => {
    if (typeof val === 'number') return val
    if (typeof val === 'string') return parseFloat(val.replace(/[^\d.-]/g, '')) || 0
    return 0
  }

  const countryData = selectedCountries.map(c => ({
    country: c,
    production: parseValue(data[c]?.production),
    imports: parseValue(data[c]?.imports),
    exports: parseValue(data[c]?.exports),
    consumption: parseValue(data[c]?.consumption),
    dependence: parseFloat((data[c]?.dependence || '0').replace('%', ''))
  }))

  const totalProduction = countryData.reduce((a, b) => a + b.production, 0)
  const totalImports = countryData.reduce((a, b) => a + b.imports, 0)

  // Fuel mix data
  const fuelData = fuelMix[selectedCountries[0]] || {}
  const totalFuel = Object.values(fuelData).reduce((a, b) => a + b, 0)
  const renewableShare = totalFuel > 0 ? ((fuelData.renewables || 0) / totalFuel * 100).toFixed(1) : 0

  const fuelChartData = Object.entries(fuelData).map(([key, value]) => ({
    name: FUEL_LABELS[key] || key,
    value,
    fill: FUEL_COLORS[key] || '#666'
  })).filter(d => d.value > 0)

  // Sector data
  const sectorData = sectors[selectedCountries[0]] || {}
  const sectorChartData = Object.entries(sectorData).map(([key, value]) => ({
    name: SECTOR_LABELS[key] || key,
    value,
    fill: SECTOR_COLORS[key] || '#666'
  })).filter(d => d.value > 0)

  return (
    <div ref={containerRef} className="bg-gray-50 min-h-screen font-sans">
      <HeroSection year={selectedYear} />
      
      <Section title="Energy Sources" subtitle="Where does energy come from?" color="amber">
        <EnergyMixContent data={fuelChartData} country={selectedCountries[0]} />
      </Section>

      <Section title="Renewable Energy" subtitle="The green transition" color="emerald" alternate>
        <RenewableContent share={renewableShare} total={totalFuel} renewables={fuelData.renewables || 0} />
      </Section>

      <Section title="Production & Trade" subtitle="Domestic supply vs imports" color="orange">
        <ProductionContent data={countryData} total={totalProduction} totalImports={totalImports} />
      </Section>

      <Section title="Import Dependency" subtitle="How reliant are countries on imports?" color="blue" alternate>
        <DependencyContent data={countryData} />
      </Section>

      <Section title="Energy Consumption" subtitle="Where is energy used?" color="violet">
        <ConsumptionContent data={sectorChartData} country={selectedCountries[0]} />
      </Section>

      <Section title="Key Statistics" subtitle="Summary of findings" color="slate" alternate>
        <InsightsContent 
          production={totalProduction} 
          imports={totalImports} 
          renewableShare={renewableShare}
          countries={selectedCountries}
        />
      </Section>

      <FooterSection />
    </div>
  )
}

function HeroSection({ year }) {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 200])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
      <motion.div style={{ y, opacity }} className="z-10 text-center px-4">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-9xl mb-8"
        >
          ⚡
        </motion.div>
        <h1 className="text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-white">
          Energy {year}
        </h1>
        <p className="text-2xl text-blue-200 max-w-2xl mx-auto">
          An immersive journey through European energy statistics
        </p>
      </motion.div>

      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div 
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <span className="text-sm uppercase tracking-widest opacity-50">Scroll to Explore</span>
      </motion.div>
    </div>
  )
}

function Section({ children, title, subtitle, color, alternate }) {
  return (
    <div className={`py-32 px-4 ${alternate ? 'bg-white' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className={`text-5xl font-bold mb-4 text-${color}-600`}>{title}</h2>
          <p className="text-xl text-gray-500">{subtitle}</p>
          <div className={`h-1 w-24 bg-${color}-500 rounded-full mx-auto mt-6`} />
        </motion.div>
        {children}
      </div>
    </div>
  )
}

function EnergyMixContent({ data, country }) {
  // Guard against empty data
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>Loading fuel mix data...</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
      >
        <h3 className="text-3xl font-bold text-gray-900 mb-6">Energy Mix for {country}</h3>
        <p className="text-xl text-gray-600 mb-8">
          The chart shows the composition of available energy by source. Different countries rely on different mixes based on natural resources and policy choices.
        </p>
        <div className="grid grid-cols-2 gap-4">
          {data.slice(0, 4).map(d => (
            <div key={d.name} className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.fill }} />
                <span className="text-sm font-medium text-gray-600">{d.name}</span>
              </div>
              <div className="text-2xl font-bold text-gray-800">{d.value.toLocaleString()}</div>
              <div className="text-xs text-gray-400">KTOE</div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
      >
        {/* Infographic Image Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <img src="/images/energy_sources.png" alt="" className="w-full h-full object-contain" />
        </div>

        <ChartContainer className="relative bg-white/90 p-8 rounded-3xl shadow-xl backdrop-blur-sm border border-gray-100" style={{ height: '500px' }}>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={150} label>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
            </PieChart>
          </ChartContainer>
      </motion.div>
    </div>
  )
}

function RenewableContent({ share, total, renewables }) {
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        className="mb-12 relative"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 opacity-10">
           <img src="/images/renewable_energy.png" alt="" className="w-full h-full object-contain animate-spin-slow" />
        </div>
        <div className="relative z-10">
          <div className="text-[200px] font-bold text-emerald-500 leading-none">{share}%</div>
          <div className="text-3xl text-gray-600 mt-4">of energy supply from renewables</div>
        </div>
      </motion.div>

      <div className="flex justify-center gap-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-emerald-50 p-8 rounded-3xl"
        >
          <div className="text-5xl font-bold text-emerald-600">{renewables.toLocaleString()}</div>
          <div className="text-gray-500 mt-2">KTOE from Renewables</div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-gray-100 p-8 rounded-3xl"
        >
          <div className="text-5xl font-bold text-gray-700">{total.toLocaleString()}</div>
          <div className="text-gray-500 mt-2">KTOE Total Supply</div>
        </motion.div>
      </div>
    </div>
  )
}

function ProductionContent({ data, total, totalImports }) {
  if (!data || data.length === 0) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
      >
        <p className="text-2xl text-gray-600 mb-8">
          Combined production: <span className="font-bold text-orange-600">{total.toLocaleString()} KTOE</span>
          <br />
          Combined imports: <span className="font-bold text-blue-600">{totalImports.toLocaleString()} KTOE</span>
        </p>
        <div className="space-y-4">
          {data.map(d => (
            <div key={d.country} className="p-4 bg-white rounded-xl shadow-sm flex justify-between items-center">
              <span className="text-xl font-bold text-gray-800">{d.country}</span>
              <div className="text-right">
                <div className="text-lg font-semibold text-orange-600">↑ {d.production.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Production</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <ChartContainer className="bg-white p-8 rounded-3xl shadow-xl" style={{ height: '500px' }}>
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" />
              <YAxis dataKey="country" type="category" width={50} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
              <Bar dataKey="production" fill="#f97316" name="Production" radius={[0, 8, 8, 0]} />
              <Bar dataKey="imports" fill="#3b82f6" name="Imports" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ChartContainer>
      </motion.div>
    </div>
  )
}

function DependencyContent({ data }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {data.map((d, i) => (
        <motion.div
          key={d.country}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="bg-white p-8 rounded-3xl shadow-xl text-center"
        >
          <div className="text-6xl font-bold mb-4" style={{ color: d.dependence > 50 ? '#ef4444' : '#22c55e' }}>
            {d.dependence.toFixed(1)}%
          </div>
          <div className="text-gray-500 text-lg mb-4">Import Dependency</div>
          <div className="text-3xl font-bold text-gray-800">{d.country}</div>
          <div className="mt-6 pt-6 border-t border-gray-100 text-sm text-gray-400">
            <div>Imports: {d.imports.toLocaleString()} KTOE</div>
            <div>Exports: {d.exports.toLocaleString()} KTOE</div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function ConsumptionContent({ data, country }) {
  if (!data || data.length === 0) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <ChartContainer className="bg-white p-8 rounded-3xl shadow-xl" style={{ height: '400px' }}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
      >
        <h3 className="text-3xl font-bold text-gray-900 mb-6">Consumption by Sector</h3>
        <p className="text-xl text-gray-600 mb-8">
          Final energy consumption shows where energy is actually used in {country}'s economy.
        </p>
        <div className="space-y-4">
          {data.map(d => (
            <div key={d.name} className="flex items-center gap-4">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: d.fill }} />
              <span className="flex-1 text-gray-700 font-medium">{d.name}</span>
              <span className="text-gray-900 font-bold">{d.value.toLocaleString()} KTOE</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

function InsightsContent({ production, imports, renewableShare, countries }) {
  const stats = [
    { icon: '⚡', value: production.toLocaleString(), label: 'Total Production', unit: 'KTOE', color: 'orange' },
    { icon: '📥', value: imports.toLocaleString(), label: 'Total Imports', unit: 'KTOE', color: 'blue' },
    { icon: '🌱', value: renewableShare + '%', label: 'Renewable Share', unit: '', color: 'emerald' },
    { icon: '🌍', value: countries.length, label: 'Countries Analyzed', unit: '', color: 'purple' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className={`bg-gradient-to-br from-${s.color}-500 to-${s.color}-600 p-8 rounded-3xl text-white text-center shadow-xl`}
        >
          <div className="text-5xl mb-4">{s.icon}</div>
          <div className="text-4xl font-bold mb-2">{s.value}</div>
          <div className="text-sm opacity-80">{s.label}</div>
          {s.unit && <div className="text-xs opacity-60 mt-1">{s.unit}</div>}
        </motion.div>
      ))}
    </div>
  )
}

function FooterSection() {
  return (
    <div className="py-24 bg-slate-900 text-center text-white">
      <h2 className="text-4xl font-bold mb-4">Data Source: Eurostat</h2>
      <p className="text-gray-400 mb-8">nrg_bal_c - Energy balances</p>
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="px-8 py-4 bg-white text-slate-900 font-bold rounded-full hover:scale-105 transition-transform"
      >
        Back to Top
      </button>
    </div>
  )
}
