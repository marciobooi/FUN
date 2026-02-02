import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartContainer } from '../components/ui/ChartContainer'

// Modern Vibrant Glassmorphism Palette
const FUEL_COLORS = {
  solidFossil: '#475569', // Slate
  oil: '#0ea5e9',        // Sky Blue
  gas: '#f59e0b',        // Amber
  nuclear: '#8b5cf6',    // Violet
  renewables: '#10b981', // Emerald
  electricity: '#eab308',// Yellow
  heat: '#f97316'        // Orange
}

const FUEL_LABELS = {
  solidFossil: 'COAL & FOSSIL',
  oil: 'OIL',
  gas: 'NATURAL GAS',
  nuclear: 'NUCLEAR',
  renewables: 'RENEWABLES',
  electricity: 'ELECTRICITY',
  heat: 'HEAT'
}

const SECTOR_COLORS = {
  industry: '#3b82f6',   // Blue
  transport: '#ec4899',  // Pink
  households: '#14b8a6', // Teal
  commercial: '#a855f7'  // Purple
}

const SECTOR_LABELS = {
  industry: 'INDUSTRY',
  transport: 'TRANSPORT',
  households: 'HOUSEHOLDS',
  commercial: 'COMMERCIAL'
}

// 3D Tilt Card Component
const TiltCard = ({ children, className = "" }) => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"])

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative transition-all duration-200 ease-out ${className}`}
    >
      {children}
    </motion.div>
  )
}

export function ParallaxInfographics({ data, fuelMix, sectors, selectedCountries, selectedYear }) {
  const containerRef = useRef(null)
  
  if (!data || Object.keys(data).length === 0 || selectedCountries.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center p-12 bg-white/50 rounded-3xl border border-white/20 backdrop-blur-xl shadow-2xl max-w-lg">
          <div className="text-8xl mb-6 animate-bounce">✨</div>
          <h2 className="text-4xl font-black text-slate-800 mb-6 uppercase tracking-tighter">Awaiting Input</h2>
          <p className="text-slate-500 text-xl font-medium">
            Select countries to generate the visualization.
          </p>
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
  })).filter(d => d.value > 0).sort((a,b) => b.value - a.value)

  // Sector data
  const sectorData = sectors[selectedCountries[0]] || {}
  const sectorChartData = Object.entries(sectorData).map(([key, value]) => ({
    name: SECTOR_LABELS[key] || key,
    value,
    fill: SECTOR_COLORS[key] || '#666'
  })).filter(d => d.value > 0)

  return (
    <div ref={containerRef} className="bg-[#ecf0f3] min-h-screen font-sans text-slate-800 overflow-x-hidden selection:bg-blue-200 selection:text-blue-900">
      
      {/* Abstract Energy Shapes Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full blur-[120px] mix-blend-multiply animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-400/20 rounded-full blur-[120px] mix-blend-multiply animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-emerald-400/20 rounded-full blur-[100px] mix-blend-multiply animate-pulse" style={{ animationDelay: '4s' }} />
        
        {/* Geometric Glass Shapes */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-3xl backdrop-blur-sm border border-white/20 rotate-12" />
        <div className="absolute bottom-40 left-20 w-48 h-48 bg-white/10 rounded-full backdrop-blur-sm border border-white/20" />
      </div>
      
      <HeroSection year={selectedYear} />
      
      <Section 
        title="Energy Sources" 
        subtitle="INPUT STREAMS" 
        index="01" 
        color="blue" 
        decorations={<DataBubbles data={fuelChartData} />}
        story="Every nation describes a unique energetic fingerprint. From deep earth fossils to the capture of wind and sun, this composition defines both industrial potential and ecological responsibility."
      >
        <EnergyMixContent data={fuelChartData} country={selectedCountries[0]} />
      </Section>

      <Section 
        title="Ecology Status" 
        subtitle="RENEWABLE TRANSITION" 
        index="02" 
        align="right" 
        color="green"
        story="The planetary challenge of our century is the shift to sustainability. We track the pulse of this green transition, measuring how much of the grid has been reclaimed by renewable natural flows."
      >
        <RenewableContent share={renewableShare} total={totalFuel} renewables={fuelData.renewables || 0} />
      </Section>

      <Section 
        title="Supply Chain" 
        subtitle="PRODUCTION VS IMPORTS" 
        index="03" 
        color="orange"
        story="Energy sovereignty is a delicate balance. This metric reveals the tension between domestic resilience and global necessity, illustrating just how self-reliant—or interconnected—a nation truly stands."
      >
        <ProductionContent data={countryData} total={totalProduction} totalImports={totalImports} />
      </Section>

      <Section 
        title="Vital Signs" 
        subtitle="IMPORT DEPENDENCY" 
        index="04" 
        align="right" 
        color="red"
        story="Reliance on external partners weaves a complex web of geopolitical necessity. High dependency signals vulnerability and trade integration, while autonomy grants strategic freedom."
      >
        <DependencyContent data={countryData} />
      </Section>

      <Section 
        title="Consumer Grid" 
        subtitle="SECTOR CONSUMPTION" 
        index="05" 
        color="indigo"
        story="Power is generated to be consumed. This breakdown exposes the economic heartbeat of the nation—where the gigawatts flow, from the furnaces of heavy industry to the warmth of family homes."
      >
        <ConsumptionContent data={sectorChartData} country={selectedCountries[0]} />
      </Section>

      <Section 
        title="Data Packet" 
        subtitle="SUMMARY METRICS" 
        index="06" 
        align="right" 
        color="violet"
        story="Insight begins with aggregation. These key performance indicators distill millions of data points into actionable intelligence, providing a clear, high-level snapshot of the current energetic landscape."
      >
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

// 3D Animated Energy Core (Tsemko-inspired style)
const EnergyStructure3D = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none [perspective:1000px] overflow-hidden">
      <div className="relative w-[600px] h-[600px] [transform-style:preserve-3d]">
        
        {/* Outer Rotating Disc */}
        <motion.div
          animate={{ rotateX: [0, 360], rotateY: [0, 180], rotateZ: [0, 90] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-[1px] border-slate-300/30 bg-gradient-to-tr from-blue-100/10 to-transparent backdrop-blur-[1px]"
          style={{ transformStyle: "preserve-3d" }}
        >
           <div className="absolute inset-0 rounded-full border-4 border-l-blue-400/30 border-t-transparent border-r-transparent border-b-transparent" />
        </motion.div>

        {/* Middle Gyro Ring */}
        <motion.div
          animate={{ rotateX: [360, 0], rotateY: [180, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[15%] rounded-full border-[2px] border-indigo-200/20 shadow-[0_0_30px_rgba(99,102,241,0.1)]"
          style={{ transformStyle: "preserve-3d" }}
        >
           {/* Floating Particles on Ring */}
           <div className="absolute top-0 left-1/2 w-4 h-4 -ml-2 bg-indigo-400 rounded-full shadow-lg" />
           <div className="absolute bottom-0 left-1/2 w-3 h-3 -ml-1.5 bg-purple-400 rounded-full shadow-lg" />
        </motion.div>

        {/* Inner Turbine Blocks */}
        <motion.div
          animate={{ rotateZ: 360, rotateX: 45 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[30%] rounded-2xl border border-white/40 bg-white/5 backdrop-blur-sm"
          style={{ transformStyle: "preserve-3d" }}
        >
             <div className="absolute inset-2 border border-white/20 rounded-xl" />
        </motion.div>

        {/* Core Energy Source */}
        <motion.div
          animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-[42%] rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 blur-2xl opacity-60 mix-blend-screen"
        />
        
        {/* Orbiting Satellite */}
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
           className="absolute inset-[-10%]"
        >
           <motion.div 
             className="w-8 h-8 bg-white/80 backdrop-blur-md rounded-xl border border-white shadow-xl flex items-center justify-center text-[8px]"
             animate={{ rotate: -360 }}
             transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
           >
             ⚡
           </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

function HeroSection({ year }) {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 200])
  const opacity = useTransform(scrollY, [0, 400], [1, 0])
  const scale = useTransform(scrollY, [0, 500], [1, 0.8])

  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden">
      
      <EnergyStructure3D />

      <motion.div style={{ y, opacity, scale }} className="z-10 text-center px-4 relative">
        <TiltCard className="inline-block mb-8">
          <motion.div 
            initial={{ rotateX: 90 }}
            animate={{ rotateX: 0 }}
            transition={{ duration: 0.8, ease: "backOut" }}
            className="text-8xl md:text-9xl mb-4 font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 drop-shadow-2xl"
          >
            {year}
          </motion.div>
        </TiltCard>
        
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5 }}
           className="inline-block px-4 py-1 border border-blue-200 bg-white/40 text-blue-600 font-mono text-sm tracking-[0.3em] mb-6 backdrop-blur-md rounded-full shadow-lg"
        >
          // EUROSTAT_DATA_VISUALIZATION_MODULE
        </motion.div>

        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-slate-800 uppercase tracking-tight">
          Energy Spectrum
        </h1>
        
        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
          An immersive WebGL-inspired journey through <span className="text-blue-500 font-semibold border-b border-blue-200">European energy statistics</span>.
        </p>
      </motion.div>

      <motion.div 
        className="absolute bottom-12 left-0 right-0 flex justify-center"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="flex flex-col items-center gap-2 opacity-50">
          <span className="text-[10px] font-mono uppercase tracking-[0.5em] text-slate-400">Initialize Scroll</span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-blue-400 to-transparent"></div>
        </div>
      </motion.div>
    </div>
  )
}

function Section({ children, title, subtitle, index, align = 'left', color = 'blue', decorations = null, story = null }) {
  const isRight = align === 'right';
  
  // Dynamic color mapping for decorations
  const colorMap = {
    blue: 'from-blue-500 to-cyan-400',
    green: 'from-emerald-500 to-teal-400',
    orange: 'from-orange-500 to-amber-400',
    red: 'from-red-500 to-rose-400',
    indigo: 'from-indigo-500 to-purple-400',
    violet: 'from-violet-500 to-fuchsia-400'
  }[color] || 'from-blue-500 to-cyan-400';

  const textColor = {
    blue: 'text-blue-500',
    green: 'text-emerald-500',
    orange: 'text-orange-500',
    red: 'text-red-500',
    indigo: 'text-indigo-500',
    violet: 'text-violet-500'
  }[color] || 'text-blue-500';

  return (
    <div className="py-32 w-full relative">
      <div className="w-full px-6 md:px-16 lg:px-24 mx-auto relative">
        {/* Decorative Grid Lines */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
        
        <div className={`flex flex-col md:flex-row gap-16 ${isRight ? 'md:flex-row-reverse' : ''} relative`}>
          {decorations && <div className="absolute inset-0 z-0 pointer-events-none">{decorations}</div>}
          
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, x: isRight ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="md:w-1/3 flex flex-col justify-center sticky top-32 h-fit relative z-10"
          >
            <div className="text-8xl font-black text-slate-400 absolute -top-20 -left-10 select-none z-0 opacity-20">
              {index}
            </div>
            <div className="relative z-10">
              <span className={`${textColor} font-bold font-mono text-xs tracking-widest mb-2 block`}>// {subtitle}</span>
              <h2 className="text-5xl md:text-6xl font-black text-slate-800 mb-6 uppercase tracking-tighter leading-[0.9]">
                {title.split(' ').map((word, i) => (
                  <span key={i} className="block">{word}</span>
                ))}
              </h2>
              <div className={`w-12 h-2 bg-gradient-to-r ${colorMap} mb-6 rounded-full`} />
              
              {/* Narrative Story Block */}
              {story && (
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-slate-500 text-lg font-light leading-relaxed border-l-2 border-slate-300 pl-4 py-1"
                >
                  {story}
                </motion.p>
              )}
            </div>
          </motion.div>

          {/* Section Content */}
          <div className="md:w-2/3 relative z-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

const DataBubbles = ({ data }) => {
  const [bubbles, setBubbles] = useState([])

  useEffect(() => {
    if (data) {
       setBubbles(data.map(d => ({
         ...d,
         size: Math.floor(Math.random() * 60) + 60,
         // Spread more widely
         top: Math.floor(Math.random() * 80) + 10,
         left: Math.floor(Math.random() * 90),
         duration: 5 + Math.random() * 8,
       })))
    }
  }, [data])

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
       {bubbles.map((d, i) => (
         <motion.div
           key={d.name}
           initial={{ scale: 0, opacity: 0 }}
           whileInView={{ scale: 1, opacity: 1 }}
           viewport={{ once: true }}
           animate={{ 
             y: [0, -25, 0],
             x: [0, 15, 0],
           }}
           transition={{ 
             scale: { type: "spring", delay: i * 0.1 },
             y: { duration: d.duration, repeat: Infinity, ease: "easeInOut" },
             x: { duration: d.duration * 1.5, repeat: Infinity, ease: "easeInOut" }
           }}
           className="absolute flex flex-col items-center justify-center bg-white/40 border backdrop-blur-sm shadow-sm rounded-full text-center p-2 pointer-events-auto cursor-pointer hover:bg-white/80 hover:scale-110 hover:z-50 transition-all"
           style={{ 
             width: d.size, 
             height: d.size, 
             top: `${d.top}%`, 
             left: `${d.left}%`,
             borderColor: d.fill,
             borderWidth: '1px',
             boxShadow: `0 4px 10px -2px ${d.fill}15` 
           }}
         >
            <div className="absolute top-[20%] right-[20%] w-[15%] h-[10%] bg-white rounded-full blur-[1px] opacity-60" />
            <span className="text-[9px] font-bold text-slate-600 leading-tight block w-full truncate px-1">{d.name}</span>
            <span className="font-mono text-xs font-black text-slate-800">{d.value.toLocaleString()}</span>
         </motion.div>
       ))}
    </div>
  )
}

function EnergyMixContent({ data, country }) {
  return (
    <div className="w-full min-h-[500px] flex items-center justify-center">
       {/* Focused Chart Card */}
       <div className="relative z-10 transition-transform duration-500 hover:scale-105">
          <div className="bg-white/20 backdrop-blur-sm border border-white/50 p-8 rounded-[40px] shadow-2xl w-[350px] md:w-[450px]">
             <div className="flex justify-between items-center mb-6">
                <div>
                   <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{country}</h3>
                   <div className="text-xs font-mono text-slate-500 tracking-[0.2em] mt-1">ENERGY_MIX</div>
                </div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
             </div>
             
             <div className="h-[320px] relative">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie 
                      data={data} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={70} 
                      outerRadius={100} 
                      paddingAngle={4}
                      stroke="none"
                    >
                     {data.map((entry, i) => (
                       <Cell key={i} fill={entry.fill} className="stroke-transparent outline-none drop-shadow-md" />
                     ))}
                   </Pie>
                   <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255,255,255,0.95)', 
                        backdropFilter: 'blur(10px)', 
                        border: '1px solid rgba(255,255,255,0.5)', 
                        borderRadius: '12px',
                        color: '#1e293b',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                      }} 
                      itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                   />
                 </PieChart>
               </ResponsiveContainer>
               
               {/* Center Badge */}
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-white/40 backdrop-blur-md rounded-full w-28 h-28 flex flex-col items-center justify-center border border-white/60 shadow-inner">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Total</span>
                    <span className="text-2xl font-black text-slate-800">100%</span>
                  </div>
               </div>
             </div>
          </div>
       </div>
    </div>
  )
}

function RenewableContent({ share, total, renewables }) {
  return (
    <div className="relative">
      <TiltCard className="mb-8">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-8 md:p-12 rounded-3xl relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <motion.div 
               initial={{ scale: 0 }}
               whileInView={{ scale: 1 }}
               transition={{ type: "spring", bounce: 0.5 }}
               className="text-[80px] md:text-[140px] font-black text-transparent bg-clip-text bg-gradient-to-b from-emerald-400 to-teal-600 leading-[0.8] mb-4 drop-shadow-sm"
            >
              {share}%
            </motion.div>
            <div className="text-xl md:text-2xl text-emerald-800 font-light tracking-wide uppercase border-t border-emerald-200 pt-4 mt-4 w-full max-w-md">
              Renewable Energy Share
            </div>
          </div>
        </div>
      </TiltCard>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'RENEWABLE TOTAL', value: renewables, color: 'text-emerald-600', border: 'border-emerald-200', bg: 'bg-emerald-50/50' },
          { label: 'TOTAL SUPPLY', value: total, color: 'text-slate-600', border: 'border-white/40', bg: 'bg-white/40' }
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} backdrop-blur-md border ${stat.border} p-6 rounded-2xl text-center shadow-lg`}>
            <div className={`text-2xl md:text-3xl font-bold font-mono ${stat.color} mb-1`}>
              {stat.value.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProductionContent({ data, total, totalImports }) {
  if (!data || data.length === 0) return null

  return (
    <div className="relative group hover:scale-[1.01] transition-transform duration-500">
      <div className="bg-white/60 backdrop-blur-xl border border-white/40 p-8 rounded-3xl relative shadow-xl">
        <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-6">
          <div className="flex gap-8">
             <div>
               <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Domestic Prod.</div>
               <div className="text-2xl font-bold text-orange-500 font-mono">{total.toLocaleString()}</div>
             </div>
             <div>
               <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Imports</div>
               <div className="text-2xl font-bold text-blue-500 font-mono">{totalImports.toLocaleString()}</div>
             </div>
          </div>
          <div className="text-right hidden md:block">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <div className="w-3 h-3 bg-orange-400 rounded-sm"></div> PRODUCTION
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-3 h-3 bg-blue-400 rounded-sm"></div> IMPORTS
            </div>
          </div>
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" stroke="#64748b" fontSize={10} tickFormatter={(val) => `${val/1000}k`} />
              <YAxis dataKey="country" type="category" width={40} stroke="#334155" fontSize={11} fontWeight="bold" />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                contentStyle={{ 
                  backgroundColor: 'rgba(255,255,255,0.95)', 
                  borderColor: '#e2e8f0', 
                  color: '#1e293b', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                }}
              />
              <Bar dataKey="production" fill="#fb923c" radius={[0, 4, 4, 0]} stackId="a" />
              <Bar dataKey="imports" fill="#3b82f6" radius={[0, 4, 4, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function DependencyContent({ data }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((d, i) => {
        const isHigh = d.dependence > 70;
        const colorClass = isHigh ? 'text-rose-600' : d.dependence > 40 ? 'text-amber-600' : 'text-emerald-600';
        const borderColor = isHigh ? 'border-rose-200 bg-rose-50/50' : 'border-white/40 bg-white/40';
        
        return (
          <motion.div
            key={d.country}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`backdrop-blur-md border ${borderColor} p-6 rounded-xl hover:bg-white/60 transition-colors group relative overflow-hidden shadow-sm`}
          >
            {isHigh && <div className="absolute top-0 right-0 w-12 h-12 bg-rose-400/20 blur-xl"></div>}
            
            <div className="flex justify-between items-start mb-4">
              <span className="text-xl font-bold text-slate-800">{d.country}</span>
              <div className={`text-xs px-2 py-1 rounded-full bg-white/60 font-bold ${colorClass}`}>
                {d.dependence.toFixed(1)}% DEP
              </div>
            </div>
            
            <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden mb-6">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: `${Math.min(d.dependence, 100)}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className={`absolute top-0 left-0 h-full ${isHigh ? 'bg-rose-500' : 'bg-blue-400'}`}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 block mb-1">IMPORTS</span>
                <span className="text-slate-700 font-semibold">{d.imports.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block mb-1">EXPORTS</span>
                <span className="text-slate-700 font-semibold">{d.exports.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function ConsumptionContent({ data, country }) {
  if (!data || data.length === 0) return null

  return (
    <div className="relative group hover:scale-[1.01] transition-transform duration-500">
       <div className="bg-gradient-to-br from-white/90 via-white/40 to-indigo-50/50 border border-white/40 backdrop-blur-xl p-6 md:p-10 rounded-3xl relative overflow-hidden shadow-xl">
         {/* Decorative Background Elements */}
         <div className="absolute -right-20 -bottom-20 w-64 h-64 border border-indigo-200 rounded-full animate-[spin_10s_linear_infinite]" />
         <div className="absolute -right-20 -bottom-20 w-48 h-48 border border-indigo-200 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10">
           <div className="h-[350px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={data}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                 <Tooltip 
                   cursor={{fill: 'rgba(0,0,0,0.05)'}}
                   contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e2e8f0', color: '#1e293b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                 />
                 <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                   {data.map((entry, i) => (
                     <Cell key={i} fill={entry.fill} />
                   ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
           
           <div>
              <h3 className="text-3xl font-bold text-slate-800 mb-6 leading-tight">
                Sectoral<br/> <span className="text-indigo-500">Analysis</span>
              </h3>
              <p className="text-slate-500 mb-8 font-light">
                Breakdown of final energy consumption across key economic sectors in {country}.
              </p>
              
              <div className="space-y-4">
                {data.map((d, i) => (
                  <motion.div 
                    key={d.name}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/60 group-hover:bg-white/80 transition-colors border border-white/40 shadow-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.fill }} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-700 uppercase tracking-wider">{d.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{d.value.toLocaleString()} KTOE</div>
                    </div>
                  </motion.div>
                ))}
              </div>
           </div>
         </div>
       </div>
    </div>
  )
}

function InsightsContent({ production, imports, renewableShare, countries }) {
  const stats = [
    { icon: '⚡', value: production.toLocaleString(), label: 'PRODUCTION', unit: 'KTOE', color: 'text-orange-600', bg: 'bg-orange-50' },
    { icon: '📥', value: imports.toLocaleString(), label: 'IMPORTS', unit: 'KTOE', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: '🌱', value: renewableShare + '%', label: 'RENEWABLES', unit: 'SHARE', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: '🌍', value: countries.length, label: 'COVERAGE', unit: 'NATIONS', color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ y: -5 }}
          className={`${s.bg} border border-white/60 p-6 rounded-2xl text-center backdrop-blur-sm group hover:bg-white hover:shadow-lg transition-all shadow-sm`}
        >
          <div className="text-2xl mb-4 grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110">{s.icon}</div>
          <div className={`text-2xl md:text-3xl font-black ${s.color} mb-1 font-mono`}>{s.value}</div>
          <div className="text-[10px] md:text-xs text-slate-400 uppercase tracking-widest">{s.label}</div>
        </motion.div>
      ))}
    </div>
  )
}

function FooterSection() {
  return (
    <div className="py-24 border-t border-slate-200 bg-slate-50 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100/50 via-transparent to-transparent opacity-60" />
      
      <div className="relative z-10">
        <h2 className="text-4xl font-black mb-4 text-slate-800 uppercase tracking-tighter">Eurostat Data Source</h2>
        <div className="flex justify-center gap-4 mb-8 text-sm font-mono text-blue-500">
          <span>[ nrg_bal_c ]</span>
          <span>[ nrg_ind_share ]</span>
          <span>[ nrg_cb_gas ]</span>
        </div>
        
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="group relative px-8 py-3 bg-slate-800 text-white font-bold uppercase tracking-widest hover:bg-blue-600 transition-colors shadow-lg rounded-full"
        >
          <span className="relative z-10">Return to Surface</span>
          <div className="absolute inset-0 scale-90 bg-blue-400/50 rounded-full blur-lg -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>
  )
}
