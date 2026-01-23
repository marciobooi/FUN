import { useState, useEffect } from 'react'

export function AnimatedMetrics({ metrics }) {
  const [displayValues, setDisplayValues] = useState(metrics.map(m => 0))

  useEffect(() => {
    const intervals = metrics.map((metric, idx) => {
      let current = 0
      const target = metric.value
      const duration = 2000
      const step = target / (duration / 50)

      const interval = setInterval(() => {
        current += step
        if (current >= target) {
          current = target
          clearInterval(interval)
        }
        setDisplayValues(prev => {
          const newValues = [...prev]
          newValues[idx] = Math.round(current)
          return newValues
        })
      }, 50)

      return interval
    })

    return () => intervals.forEach(clearInterval)
  }, [metrics])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric, idx) => (
        <div
          key={idx}
          className={`bg-gradient-to-br ${metric.color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow transform hover:scale-105`}
        >
          <div className="text-3xl font-bold mb-2">{metric.icon}</div>
          <div className="text-3xl font-bold mb-1">{displayValues[idx]}</div>
          <p className="text-sm opacity-90">{metric.label}</p>
        </div>
      ))}
    </div>
  )
}
