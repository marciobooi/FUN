import { useRef, useEffect, useId, useMemo, useState } from 'react'
import { Legend as RechartsLegend, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'
import { cn } from '@/lib/utils'

/**
 * ChartContainer - A wrapper for ResponsiveContainer that handles dimension timing issues
 * and prevents -1 width/height warnings
 */
export function ChartContainer({
  children,
  width = '100%',
  height = '100%',
  minHeight = 200,
  className = '',
  style = {},
  config = {},
  id,
}) {
  const containerRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  const generatedId = useId()
  const chartId = `chart-${id || generatedId.replace(/:/g, '')}`

  const cssVars = useMemo(() => {
    const entries = Object.entries(config)
      .map(([key, value]) => {
        const color = value?.theme?.light || value?.color
        return color ? `--color-${key}: ${color};` : ''
      })
      .filter(Boolean)

    return entries.join('\n')
  }, [config])

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
      height: parsedHeight,
    }
  }

  return (
    <div
      data-chart={chartId}
      ref={containerRef}
      className={cn(
        'flex justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke="#ccc"]]:stroke-border/60 [&_.recharts-legend-item-text]:!text-foreground [&_.recharts-tooltip-cursor]:stroke-border/60 [&_.recharts-reference-line_[stroke="#ccc"]]:stroke-border [&_.recharts-surface]:outline-hidden',
        className
      )}
      style={{ position: 'relative', width: '100%', ...style }}
    >
      {cssVars && <style>{`[data-chart="${chartId}"] { ${cssVars} }`}</style>}
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
          className="flex items-center justify-center text-muted-foreground"
          style={{ height: style.height || minHeight }}
        >
          <p>Loading chart...</p>
        </div>
      )}
    </div>
  )
}

export const ChartTooltip = RechartsTooltip
export const ChartLegend = RechartsLegend

export function ChartTooltipContent({
  active,
  payload,
  label,
  formatter,
  hideLabel = false,
  indicator = 'dot',
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-border/80 bg-card/95 px-3 py-2 shadow-xl backdrop-blur-sm">
      {!hideLabel && label !== undefined && (
        <div className="mb-2 text-xs font-semibold text-foreground">{label}</div>
      )}
      <div className="space-y-1.5">
        {payload.map((item, idx) => {
          const name = item.name || item.dataKey || 'Value'
          const value = item.value
          const color = item.color || item.payload?.fill || 'var(--color-primary)'
          const formatted = formatter ? formatter(value, name, item) : [value, name]
          const displayValue = Array.isArray(formatted) ? formatted[0] : value
          const displayName = Array.isArray(formatted) ? formatted[1] : name

          return (
            <div key={`${name}-${idx}`} className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                {indicator === 'line' ? (
                  <span className="h-0.5 w-3 rounded-full" style={{ backgroundColor: color }} />
                ) : (
                  <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: color }} />
                )}
                <span>{displayName}</span>
              </div>
              <span className="font-semibold text-foreground">{displayValue}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ChartLegendContent({ payload }) {
  if (!payload?.length) return null

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs">
      {payload.map((item, idx) => (
        <div key={`${item.value}-${idx}`} className="flex items-center gap-2 text-muted-foreground">
          <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: item.color }} />
          <span>{item.value}</span>
        </div>
      ))}
    </div>
  )
}
