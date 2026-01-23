import { useRef, useEffect, useState } from 'react'
import { ResponsiveContainer } from 'recharts'

/**
 * ChartContainer - A wrapper for ResponsiveContainer that handles dimension timing issues
 * and prevents -1 width/height warnings
 */
export function ChartContainer({ 
  children, 
  width = "100%", 
  height = "100%",
  minHeight = 200,
  className = "",
  style = {}
}) {
  const containerRef = useRef(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (containerRef.current) {
      // Double requestAnimationFrame ensures browser has painted layout
      const frameId = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            // Mark as ready once we have valid dimensions
            if (rect.width > 0 && rect.height > 0) {
              setIsReady(true)
            }
          }
        })
      })
      return () => cancelAnimationFrame(frameId)
    }
  }, [])

  // Determine initial dimensions for ResponsiveContainer based on style
  const getInitialDimensions = () => {
    const heightValue = style.height || minHeight
    const parsedHeight = typeof heightValue === 'string' 
      ? parseInt(heightValue) || minHeight 
      : heightValue
    
    return { 
      width: 400, 
      height: parsedHeight 
    }
  }

  return (
    <div 
      ref={containerRef} 
      className={className}
      style={{ position: 'relative', width: '100%', ...style }}
    >
      {isReady ? (
        <ResponsiveContainer 
          width={width} 
          height={height}
          initialDimension={getInitialDimensions()}
        >
          {children}
        </ResponsiveContainer>
      ) : (
        <div 
          className="flex items-center justify-center text-gray-300"
          style={{ height: style.height || minHeight }}
        >
          <p>Loading chart...</p>
        </div>
      )}
    </div>
  )
}
