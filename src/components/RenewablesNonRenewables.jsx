import { useEffect, useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { fetchEnergyDataForYears, fetchFuelMixDataForYears } from '../services/eurostat'
import { getAvailableYears } from '../utils/yearUtils'
import { getCountryName } from '../data/countryNames'
import { MethodologyModal } from './ui/MethodologyModal'
import { LineChartComponent } from './ui/charts/LineChartComponent'
import { BarChartComponent } from './ui/charts/BarChartComponent'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart'

const RENEWABLE_COLOR = '#10B981'
const NON_RENEWABLE_COLOR = '#64748B'
const FOSSIL_COLOR = '#EF4444'
const WIND_HYDRO_COLOR = '#38BDF8'

const formatKtoe = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return 'No data'
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)} KTOE`
}

const formatPercent = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return 'No data'
  return `${value.toFixed(1)}%`
}

const calculateRollingStd = (series, windowSize = 5) => {
  if (!series.length) return []

  return series.map((point, index) => {
    const start = Math.max(0, index - windowSize + 1)
    const slice = series.slice(start, index + 1).map((item) => item.value).filter((value) => Number.isFinite(value))

    if (slice.length < 2) {
      return { ...point, std: null }
    }

    const mean = slice.reduce((sum, value) => sum + value, 0) / slice.length
    const variance = slice.reduce((sum, value) => sum + (value - mean) ** 2, 0) / slice.length
    const std = Math.sqrt(variance)

    return { ...point, std }
  })
}

export function RenewablesNonRenewables({ selectedCountries, selectedYear, currentData = {}, fuelMix = {} }) {
  const [seriesData, setSeriesData] = useState([])
  const [shareData, setShareData] = useState([])
  const [growthData, setGrowthData] = useState([])
  const [volatilityData, setVolatilityData] = useState([])
  const [comparisonData, setComparisonData] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedCountries.length) {
        setSeriesData([])
        setShareData([])
        setGrowthData([])
        setVolatilityData([])
        setComparisonData([])
        return
      }

      setIsLoading(true)
      try {
        const availableYears = await getAvailableYears()
        const years = availableYears
          .filter((year) => year >= 2005 && year <= selectedYear)
          .sort((a, b) => a - b)

        const pastYears = years.filter((year) => year !== selectedYear)

        const [historicalEnergy, historicalFuel] = await Promise.all([
          pastYears.length ? fetchEnergyDataForYears(selectedCountries, pastYears) : Promise.resolve({}),
          pastYears.length ? fetchFuelMixDataForYears(selectedCountries, pastYears, 'GIC') : Promise.resolve({}),
        ])

        const buildYearData = (year) => {
          let total = 0
          let renewables = 0
          let fossil = 0
          let windHydro = 0

          selectedCountries.forEach((country) => {
            const energy = year === selectedYear ? (currentData[country] || {}) : (historicalEnergy[year]?.[country] || {})
            const fuels = year === selectedYear ? (fuelMix[country] || {}) : (historicalFuel[year]?.[country] || {})

            const gic = energy.grossInlandConsumptionRaw || 0
            const renewableKtoe = fuels.renewables || 0
            const fossilKtoe = (fuels.solidFossil || 0) + (fuels.oil || 0) + (fuels.gas || 0)
            const windHydroKtoe = (fuels.wind || 0) + (fuels.hydro || 0)

            total += gic
            renewables += renewableKtoe
            fossil += fossilKtoe
            windHydro += windHydroKtoe
          })

          const nonRenewables = Math.max(total - renewables, 0)
          const share = total > 0 ? (renewables / total) * 100 : null

          return {
            year: year.toString(),
            renewables: Math.round(renewables),
            nonRenewables: Math.round(nonRenewables),
            renewableShare: share,
            fossil,
            windHydro,
          }
        }

        const series = years.map(buildYearData).filter((point) => point.renewables > 0 || point.nonRenewables > 0)
        const shareSeries = series.map((point) => ({ year: point.year, share: point.renewableShare }))

        const growthSeries = series.map((point, index) => {
          if (index === 0) {
            return { year: point.year, renewables: null, nonRenewables: null }
          }

          const prev = series[index - 1]
          const renewablesGrowth = prev.renewables > 0 ? ((point.renewables - prev.renewables) / prev.renewables) * 100 : null
          const nonRenewablesGrowth = prev.nonRenewables > 0 ? ((point.nonRenewables - prev.nonRenewables) / prev.nonRenewables) * 100 : null

          return {
            year: point.year,
            renewables: renewablesGrowth,
            nonRenewables: nonRenewablesGrowth,
          }
        })

        const windHydroSeries = series.map((point) => ({ year: point.year, value: point.windHydro }))
        const fossilSeries = series.map((point) => ({ year: point.year, value: point.fossil }))

        const windHydroVolatility = calculateRollingStd(windHydroSeries)
        const fossilVolatility = calculateRollingStd(fossilSeries)

        const volatilitySeries = series.map((point) => {
          const windHydroValue = windHydroVolatility.find((item) => item.year === point.year)
          const fossilValue = fossilVolatility.find((item) => item.year === point.year)

          return {
            year: point.year,
            windHydro: windHydroValue?.std ?? null,
            fossil: fossilValue?.std ?? null,
          }
        })

        const comparison = selectedCountries.map((country) => {
          const energy = currentData[country] || {}
          const fuels = fuelMix[country] || {}
          const total = energy.grossInlandConsumptionRaw || 0
          const renewableKtoe = fuels.renewables || 0
          const share = total > 0 ? (renewableKtoe / total) * 100 : null

          return {
            country: getCountryName(country),
            share,
          }
        })

        setSeriesData(series)
        setShareData(shareSeries)
        setGrowthData(growthSeries)
        setVolatilityData(volatilitySeries)
        setComparisonData(comparison)
      } catch (error) {
        console.error('Error fetching renewables vs non-renewables data:', error)
        setSeriesData([])
        setShareData([])
        setGrowthData([])
        setVolatilityData([])
        setComparisonData([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [selectedCountries, selectedYear, currentData, fuelMix])

  const stackedChartConfig = useMemo(() => ({
    renewables: {
      label: 'Renewables',
      color: RENEWABLE_COLOR,
    },
    nonRenewables: {
      label: 'Non-renewables',
      color: NON_RENEWABLE_COLOR,
    },
  }), [])

  const hasData = seriesData.length > 0

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <span className="text-2xl">🌿</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Renewable and Non-Renewable Energy Dynamics</h2>
              <p className="text-gray-600 text-sm">
                Structural transition, growth speed, and volatility of the energy mix based on Eurostat energy balances.
              </p>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                Aggregated across selected countries
              </div>
            </div>
          </div>
          <MethodologyModal title="Renewables vs Non-Renewables - Methodology">
            <p>
              <strong>Data Source:</strong> Eurostat nrg_bal_c (Energy balance), unit KTOE.
            </p>
            <ul className="space-y-1 ml-4 list-disc mb-3">
              <li><strong>Renewables:</strong> Eurostat aggregate RA000 (renewables & biofuels).</li>
              <li><strong>Non-renewables:</strong> Total GIC minus renewables (includes fossil fuels and nuclear).</li>
              <li><strong>Gross Inland Consumption (GIC):</strong> Total energy available within a country.</li>
              <li><strong>Growth rates:</strong> Year-on-year percentage change.</li>
              <li><strong>Volatility:</strong> Rolling 5-year standard deviation of hydro+wind vs fossil fuels.</li>
            </ul>
            <p>
              <strong>Note:</strong> Nuclear is not renewable and is included in non-renewables for comparability.
            </p>
          </MethodologyModal>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-900 mb-6">
          <p className="font-semibold mb-2">Definitions (Eurostat-aligned)</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Renewables include bioenergy, wind, solar, hydro, geothermal, and ambient heat (RA000).</li>
            <li>Non-renewables include coal, oil, natural gas, and nuclear. Nuclear is shown as non-renewable but low-carbon.</li>
            <li>All metrics use Gross Inland Consumption (GIC) in KTOE for consistent energy-balance comparisons.</li>
          </ul>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mr-3"></div>
            <p className="text-gray-600">Loading renewables transition data...</p>
          </div>
        )}

        {!isLoading && !hasData && (
          <div className="text-center py-10 text-gray-500">No renewables vs non-renewables data available.</div>
        )}

        {!isLoading && hasData && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Energy Mix Structure (GIC)</h3>
                <ChartContainer config={stackedChartConfig} height={320} minHeight={320}>
                  <AreaChart data={seriesData} margin={{ top: 5, right: 24, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(value)} />
                    <ChartTooltip content={<ChartTooltipContent formatter={(value, name) => [formatKtoe(value), name]} />} />
                    <Area type="monotone" dataKey="nonRenewables" stackId="1" stroke={NON_RENEWABLE_COLOR} fill={NON_RENEWABLE_COLOR} fillOpacity={0.35} name="Non-renewables" />
                    <Area type="monotone" dataKey="renewables" stackId="1" stroke={RENEWABLE_COLOR} fill={RENEWABLE_COLOR} fillOpacity={0.55} name="Renewables" />
                  </AreaChart>
                </ChartContainer>
                <p className="text-sm text-gray-600 mt-3">
                  Shows the structural evolution of the combined energy system for selected countries.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Renewable Share of GIC</h3>
                <LineChartComponent
                  data={shareData}
                  lines={[{ dataKey: 'share', stroke: RENEWABLE_COLOR, name: 'Renewables share' }]}
                  xAxisKey="year"
                  yAxisLabel="Share (%)"
                  height={320}
                  customTooltip={(value) => [formatPercent(value), 'Renewables share']}
                />
                <p className="text-sm text-gray-600 mt-3">
                  Aggregate share for the selected countries. Growth can reflect renewable expansion or fossil contraction.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Transition Speed (YoY Growth)</h3>
                <LineChartComponent
                  data={growthData}
                  lines={[
                    { dataKey: 'renewables', stroke: RENEWABLE_COLOR, name: 'Renewables YoY' },
                    { dataKey: 'nonRenewables', stroke: NON_RENEWABLE_COLOR, name: 'Non-renewables YoY' },
                  ]}
                  xAxisKey="year"
                  yAxisLabel="Growth (%)"
                  height={300}
                  customTooltip={(value, name) => [formatPercent(value), name]}
                  showDots
                />
                <p className="text-sm text-gray-600 mt-3">
                  YoY change for the combined selected-country totals.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Volatility: Hydro + Wind vs Fossil Backup</h3>
                <LineChartComponent
                  data={volatilityData}
                  lines={[
                    { dataKey: 'windHydro', stroke: WIND_HYDRO_COLOR, name: 'Hydro + Wind' },
                    { dataKey: 'fossil', stroke: FOSSIL_COLOR, name: 'Gas + Oil + Coal' },
                  ]}
                  xAxisKey="year"
                  yAxisLabel="Rolling Std (KTOE)"
                  height={300}
                  customTooltip={(value, name) => [formatKtoe(value), name]}
                />
                <p className="text-sm text-gray-600 mt-3">
                  Volatility is calculated on the aggregated hydro+wind and fossil totals.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Country Comparison ({selectedYear})</h3>
              <BarChartComponent
                data={comparisonData}
                bars={[{ dataKey: 'share', fill: RENEWABLE_COLOR, name: 'Renewables share' }]}
                xAxisKey="country"
                yAxisLabel="Share (%)"
                height={300}
                layout="horizontal"
                customTooltip={(value) => [formatPercent(value), 'Renewables share']}
              />
              <p className="text-sm text-gray-600 mt-3">
                Normalizes renewable performance across small and large economies.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
