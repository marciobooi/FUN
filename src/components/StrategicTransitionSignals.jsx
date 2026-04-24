import { useEffect, useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { fetchBalanceDataForYears, fetchEnergyDataForYears, fetchFuelMixDataForYears, fetchGDPDataForYears } from '../services/eurostat'
import { getAvailableYears } from '../utils/yearUtils'
import { getCountryName } from '../data/countryNames'
import { MethodologyModal } from './ui/MethodologyModal'
import { LineChartComponent } from './ui/charts/LineChartComponent'
import { BarChartComponent } from './ui/charts/BarChartComponent'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart'

const RESILIENCE_COLORS = {
  excellent: '#10B981',
  strong: '#3B82F6',
  moderate: '#F59E0B',
  fragile: '#EF4444',
}

const TYPOLOGY_COLORS = {
  structural: '#10B981',
  substitution: '#3B82F6',
  stagnation: '#9CA3AF',
  shock: '#F59E0B',
}

const formatPercent = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return 'No data'
  return `${value.toFixed(1)}%`
}

const formatSigned = (value, suffix = '%') => {
  if (value === null || value === undefined || Number.isNaN(value)) return 'No data'
  const rounded = value.toFixed(1)
  const sign = value > 0 ? '+' : ''
  return `${sign}${rounded}${suffix}`
}

const classifyResilience = (score) => {
  if (score >= 80) return { label: 'High resilience', color: RESILIENCE_COLORS.excellent }
  if (score >= 65) return { label: 'Strong resilience', color: RESILIENCE_COLORS.strong }
  if (score >= 50) return { label: 'Moderate resilience', color: RESILIENCE_COLORS.moderate }
  return { label: 'Fragile system', color: RESILIENCE_COLORS.fragile }
}

export function StrategicTransitionSignals({ selectedCountries, selectedYear, currentData = {}, fuelMix = {} }) {
  const [electrificationSeries, setElectrificationSeries] = useState([])
  const [electrificationSplit, setElectrificationSplit] = useState([])
  const [dispatchableSplit, setDispatchableSplit] = useState([])
  const [resilienceScores, setResilienceScores] = useState([])
  const [decouplingSeries, setDecouplingSeries] = useState([])
  const [transitionProfiles, setTransitionProfiles] = useState([])
  const [shockSummary, setShockSummary] = useState([])
  const [costExposure, setCostExposure] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchSignals = async () => {
      if (!selectedCountries.length) {
        setElectrificationSeries([])
        setElectrificationSplit([])
        setDispatchableSplit([])
        setResilienceScores([])
        setDecouplingSeries([])
        setTransitionProfiles([])
        setShockSummary([])
        setCostExposure([])
        return
      }

      setIsLoading(true)
      try {
        const availableYears = await getAvailableYears()
        const years = availableYears
          .filter((year) => year >= 2005 && year <= selectedYear)
          .sort((a, b) => a - b)

        const pastYears = years.filter((year) => year !== selectedYear)

        const [energyByYear, fuelByYear, gdpByYear, balanceByYear] = await Promise.all([
          pastYears.length ? fetchEnergyDataForYears(selectedCountries, pastYears) : Promise.resolve({}),
          pastYears.length ? fetchFuelMixDataForYears(selectedCountries, pastYears, 'GIC') : Promise.resolve({}),
          fetchGDPDataForYears(selectedCountries, years),
          fetchBalanceDataForYears(selectedCountries, years, ['FC_E', 'FC_TRA_E', 'FC_IND_E', 'FC_OTH_HH_E'], ['TOTAL', 'E7000']),
        ])

        const electrification = years.map((year) => {
          let totalFinal = 0
          let totalElectric = 0

          selectedCountries.forEach((country) => {
            const source = balanceByYear[year]?.[country]
            totalFinal += source?.FC_E?.TOTAL || 0
            totalElectric += source?.FC_E?.E7000 || 0
          })

          const share = totalFinal > 0 ? (totalElectric / totalFinal) * 100 : null

          return {
            year: year.toString(),
            share,
            totalElectric,
            totalFinal,
          }
        })

        const electrificationSeriesClean = electrification.filter((point) => point.share !== null)

        const latestBalances = balanceByYear[selectedYear] || {}

        const splitTotals = {
          transport: { electric: 0, total: 0 },
          industry: { electric: 0, total: 0 },
          households: { electric: 0, total: 0 },
        }

        selectedCountries.forEach((country) => {
          const balance = latestBalances[country] || {}
          splitTotals.transport.electric += balance.FC_TRA_E?.E7000 || 0
          splitTotals.transport.total += balance.FC_TRA_E?.TOTAL || 0
          splitTotals.industry.electric += balance.FC_IND_E?.E7000 || 0
          splitTotals.industry.total += balance.FC_IND_E?.TOTAL || 0
          splitTotals.households.electric += balance.FC_OTH_HH_E?.E7000 || 0
          splitTotals.households.total += balance.FC_OTH_HH_E?.TOTAL || 0
        })

        const splitData = [
          {
            sector: 'Transport',
            share: splitTotals.transport.total > 0 ? (splitTotals.transport.electric / splitTotals.transport.total) * 100 : null,
          },
          {
            sector: 'Industry',
            share: splitTotals.industry.total > 0 ? (splitTotals.industry.electric / splitTotals.industry.total) * 100 : null,
          },
          {
            sector: 'Households',
            share: splitTotals.households.total > 0 ? (splitTotals.households.electric / splitTotals.households.total) * 100 : null,
          },
        ]

        const dispatchable = selectedCountries.map((country) => {
          const fuels = fuelMix[country] || {}
          const total = Object.values(fuels).reduce((sum, value) => sum + (value || 0), 0)
          const dispatchableValue =
            (fuels.solidFossil || 0) + (fuels.oil || 0) + (fuels.gas || 0) + (fuels.nuclear || 0) +
            (fuels.biofuels || 0) + (fuels.solidBiofuels || 0) + (fuels.liquidBiofuels || 0) +
            (fuels.biogases || 0) + (fuels.hydro || 0)
          const nonDispatchableValue = (fuels.wind || 0) + (fuels.solar || 0)

          const dispatchableShare = total > 0 ? (dispatchableValue / total) * 100 : null
          const nonDispatchableShare = total > 0 ? (nonDispatchableValue / total) * 100 : null

          return {
            country: getCountryName(country),
            dispatchable: dispatchableShare,
            nonDispatchable: nonDispatchableShare,
          }
        })

        const yearTotals = years.reduce((acc, year) => {
          let gic = 0
          let imports = 0
          let renewables = 0
          let fossil = 0

          selectedCountries.forEach((country) => {
            const energy = year === selectedYear ? currentData[country] || {} : energyByYear[year]?.[country] || {}
            const fuels = year === selectedYear ? fuelMix[country] || {} : fuelByYear[year]?.[country] || {}

            gic += energy.grossInlandConsumptionRaw || 0
            imports += energy.importsRaw || 0
            renewables += fuels.renewables || 0
            fossil += (fuels.solidFossil || 0) + (fuels.oil || 0) + (fuels.gas || 0)
          })

          const renewablesShare = gic > 0 ? (renewables / gic) * 100 : null
          const fossilShare = gic > 0 ? (fossil / gic) * 100 : null
          const fossilImports = fossilShare === null ? null : imports * (fossilShare / 100)

          acc[year] = { gic, imports, renewablesShare, fossilShare, fossilImports }
          return acc
        }, {})

        const shockEvents = [
          { label: '2008 financial shock', pre: 2007, shock: 2009, recovery: 2011 },
          { label: '2020 pandemic shock', pre: 2019, shock: 2020, recovery: 2021 },
          { label: '2022 energy shock', pre: 2021, shock: 2022, recovery: 2023 },
        ]

        const shockRows = shockEvents
          .map((event) => {
            const pre = yearTotals[event.pre]
            const shock = yearTotals[event.shock]
            const recovery = yearTotals[event.recovery]

            if (!pre || !shock || !recovery) return null

            const gicShock = pre.gic > 0 ? ((shock.gic - pre.gic) / pre.gic) * 100 : null
            const gicRecovery = shock.gic > 0 ? ((recovery.gic - shock.gic) / shock.gic) * 100 : null

            const fossilShock = pre.fossilImports ? ((shock.fossilImports - pre.fossilImports) / pre.fossilImports) * 100 : null
            const fossilRecovery = shock.fossilImports ? ((recovery.fossilImports - shock.fossilImports) / shock.fossilImports) * 100 : null

            const renewablesShock = pre.renewablesShare !== null ? (shock.renewablesShare - pre.renewablesShare) : null
            const renewablesRecovery = shock.renewablesShare !== null ? (recovery.renewablesShare - shock.renewablesShare) : null

            return {
              event: event.label,
              gicShock,
              gicRecovery,
              fossilShock,
              fossilRecovery,
              renewablesShock,
              renewablesRecovery,
            }
          })
          .filter(Boolean)

        const exposure = selectedCountries.map((country) => {
          const energy = currentData[country] || {}
          const fuels = fuelMix[country] || {}
          const available = energy.availableRaw || 0
          const imports = energy.importsRaw || 0
          const gic = energy.grossInlandConsumptionRaw || 0
          const fossil = (fuels.solidFossil || 0) + (fuels.oil || 0) + (fuels.gas || 0)
          const importShare = available > 0 ? imports / available : null
          const fossilShare = gic > 0 ? fossil / gic : null
          const exposureValue = importShare !== null && fossilShare !== null ? importShare * fossilShare * 100 : null

          return {
            country: getCountryName(country),
            exposure: exposureValue,
          }
        })

        const decoupling = years.map((year) => {
          let gic = 0
          let gdp = 0

          selectedCountries.forEach((country) => {
            const energy = year === selectedYear ? currentData[country] || {} : energyByYear[year]?.[country] || {}
            const gdpData = gdpByYear[year]?.[country]

            gic += energy.grossInlandConsumptionRaw || 0
            gdp += gdpData || 0
          })

          return {
            year: year.toString(),
            gic,
            gdp,
          }
        })

        const base = decoupling[0] || { gic: 1, gdp: 1 }
        const decouplingIndexed = decoupling.map((point) => ({
          year: point.year,
          gicIndex: base.gic ? (point.gic / base.gic) * 100 : null,
          gdpIndex: base.gdp ? (point.gdp / base.gdp) * 100 : null,
        }))

        const resilience = selectedCountries.map((country) => {
          const energy = currentData[country] || {}
          const fuels = fuelMix[country] || {}

          const imports = energy.importsRaw || 0
          const exports = energy.exportsRaw || 0
          const available = energy.availableRaw || 0
          const dependency = available > 0 ? ((imports - exports) / available) * 100 : null

          const totalFuel = (fuels.solidFossil || 0) + (fuels.oil || 0) + (fuels.gas || 0) + (fuels.nuclear || 0) + (fuels.renewables || 0)
          const fuelShares = [
            fuels.solidFossil || 0,
            fuels.oil || 0,
            fuels.gas || 0,
            fuels.nuclear || 0,
            fuels.renewables || 0,
          ].map((value) => (totalFuel > 0 ? value / totalFuel : 0))

          const hhi = fuelShares.reduce((sum, share) => sum + share * share, 0)
          const diversity = (1 - hhi) * 100

          const dispatchableShare = dispatchable.find((item) => item.country === getCountryName(country))?.dispatchable || null

          const renewablesHistory = years.map((year) => {
            const yearFuel = year === selectedYear ? fuels : fuelByYear[year]?.[country] || {}
            const yearEnergy = year === selectedYear ? energy : energyByYear[year]?.[country] || {}
            const total = yearEnergy.grossInlandConsumptionRaw || 0
            const renewables = yearFuel.renewables || 0
            return total > 0 ? (renewables / total) * 100 : null
          }).filter((value) => value !== null)

          const recent = renewablesHistory.slice(-5)
          const mean = recent.reduce((sum, value) => sum + value, 0) / Math.max(recent.length, 1)
          const variance = recent.reduce((sum, value) => sum + (value - mean) ** 2, 0) / Math.max(recent.length, 1)
          const std = Math.sqrt(variance)
          const stability = Math.max(0, 100 - Math.min(100, (std / 6) * 100))

          const dependencyScore = dependency === null ? 0 : Math.max(0, 100 - Math.min(100, dependency))
          const score =
            dependencyScore * 0.3 +
            diversity * 0.25 +
            stability * 0.2 +
            (dispatchableShare ?? 0) * 0.25

          const classification = classifyResilience(score)

          return {
            country: getCountryName(country),
            score,
            label: classification.label,
            color: classification.color,
          }
        })

        const profiles = selectedCountries.map((country) => {
          const history = years.slice(-10).map((year) => {
            const yearFuel = year === selectedYear ? fuelMix[country] || {} : fuelByYear[year]?.[country] || {}
            const yearEnergy = year === selectedYear ? currentData[country] || {} : energyByYear[year]?.[country] || {}
            const total = yearEnergy.grossInlandConsumptionRaw || 0
            const renewables = yearFuel.renewables || 0
            const fossil = (yearFuel.solidFossil || 0) + (yearFuel.oil || 0) + (yearFuel.gas || 0)

            return {
              renewablesShare: total > 0 ? (renewables / total) * 100 : null,
              fossilShare: total > 0 ? (fossil / total) * 100 : null,
            }
          }).filter((item) => item.renewablesShare !== null && item.fossilShare !== null)

          const first = history[0]
          const last = history[history.length - 1]
          const renewablesDelta = last ? last.renewablesShare - first.renewablesShare : 0
          const fossilDelta = last ? last.fossilShare - first.fossilShare : 0

          let label = 'Stagnation'
          let color = TYPOLOGY_COLORS.stagnation

          if (renewablesDelta > 3 && fossilDelta < -3) {
            label = 'Structural transition'
            color = TYPOLOGY_COLORS.structural
          } else if (renewablesDelta > 3 && fossilDelta >= -3) {
            label = 'Substitution effect'
            color = TYPOLOGY_COLORS.substitution
          } else if (renewablesDelta <= 3 && fossilDelta < -3) {
            label = 'Shock-driven change'
            color = TYPOLOGY_COLORS.shock
          }

          return {
            country: getCountryName(country),
            label,
            color,
          }
        })

        setElectrificationSeries(electrificationSeriesClean)
        setElectrificationSplit(splitData)
        setDispatchableSplit(dispatchable)
        setResilienceScores(resilience)
        setDecouplingSeries(decouplingIndexed)
        setTransitionProfiles(profiles)
        setShockSummary(shockRows)
        setCostExposure(exposure)
      } catch (error) {
        console.error('Error building strategic signals:', error)
        setElectrificationSeries([])
        setElectrificationSplit([])
        setDispatchableSplit([])
        setResilienceScores([])
        setDecouplingSeries([])
        setTransitionProfiles([])
        setShockSummary([])
        setCostExposure([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSignals()
  }, [selectedCountries, selectedYear, currentData, fuelMix])

  const electrificationConfig = useMemo(() => ({
    share: {
      label: 'Electrification share',
      color: '#3B82F6',
    },
  }), [])

  const resilienceBars = resilienceScores.map((entry) => ({
    ...entry,
    score: Math.round(entry.score),
  }))

  const resilienceColors = resilienceScores.map((entry) => entry.color)

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Strategic Transition Signals</h2>
            <p className="text-gray-600 text-sm">
              Resilience, flexibility, electrification, and decoupling signals to explain the pace and robustness of transition.
            </p>
          </div>
          <MethodologyModal title="Strategic Transition Signals - Methodology">
            <ul className="space-y-1 ml-4 list-disc mb-3">
              <li><strong>Resilience index:</strong> Weighted composite of import dependency, fuel diversity (HHI), renewables stability, and dispatchable share.</li>
              <li><strong>Dispatchable split:</strong> Fossil + nuclear + biomass + hydro (dispatchable) vs wind + solar (non-dispatchable).</li>
              <li><strong>Electrification:</strong> Electricity final consumption / total final energy consumption (FC_E, E7000 vs TOTAL).</li>
              <li><strong>Decoupling:</strong> Indexed GDP vs GIC (base year = first available year).</li>
              <li><strong>Transition typology:</strong> Based on 10-year change in renewables and fossil shares.</li>
            </ul>
          </MethodologyModal>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-gray-600">Loading strategic signals...</p>
          </div>
        )}

        {!isLoading && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Energy System Resilience Index</h3>
                <BarChartComponent
                  data={resilienceBars}
                  bars={[{ dataKey: 'score', fill: '#2563EB', name: 'Resilience score', colors: resilienceColors }]}
                  xAxisKey="country"
                  yAxisLabel="Score (0-100)"
                  height={300}
                  layout="horizontal"
                  customTooltip={(value, name) => [value, name]}
                />
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600">
                  {resilienceScores.map((entry) => (
                    <div key={entry.country} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2">
                      <span className="font-semibold text-gray-800">{entry.country}</span>
                      <span className="font-semibold" style={{ color: entry.color }}>{entry.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Dispatchable vs Non-Dispatchable Share ({selectedYear})</h3>
                <BarChartComponent
                  data={dispatchableSplit}
                  bars={[
                    { dataKey: 'dispatchable', fill: '#10B981', name: 'Dispatchable' },
                    { dataKey: 'nonDispatchable', fill: '#60A5FA', name: 'Non-dispatchable' },
                  ]}
                  xAxisKey="country"
                  yAxisLabel="Share (%)"
                  height={300}
                  layout="horizontal"
                  customTooltip={(value, name) => [formatPercent(value), name]}
                />
                <p className="text-sm text-gray-600 mt-3">
                  Explains why fossil and nuclear capacity persist as stability back-up even with renewable growth.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Electrification Index</h3>
                <ChartContainer config={electrificationConfig} height={300} minHeight={300}>
                  <AreaChart data={electrificationSeries} margin={{ top: 5, right: 24, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `${value}%`} />
                    <ChartTooltip content={<ChartTooltipContent formatter={(value) => [formatPercent(value), 'Electrification']} />} />
                    <Area type="monotone" dataKey="share" stroke="#3B82F6" fill="#93C5FD" fillOpacity={0.6} name="Electrification" />
                  </AreaChart>
                </ChartContainer>
                <p className="text-sm text-gray-600 mt-3">
                  Electricity final consumption as a share of total final energy (aggregate of selected countries).
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Electrification by Sector ({selectedYear})</h3>
                <BarChartComponent
                  data={electrificationSplit}
                  bars={[{ dataKey: 'share', fill: '#3B82F6', name: 'Electricity share' }]}
                  xAxisKey="sector"
                  yAxisLabel="Share (%)"
                  height={300}
                  layout="horizontal"
                  customTooltip={(value) => [formatPercent(value), 'Electricity share']}
                />
                <p className="text-sm text-gray-600 mt-3">
                  Highlights where electrification is advancing fastest: transport, industry, or households.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Shock Absorption Analysis</h3>
                {shockSummary.length === 0 ? (
                  <div className="text-sm text-gray-500">Insufficient historical data to compare shock periods.</div>
                ) : (
                  <div className="space-y-3 text-sm">
                    {shockSummary.map((row) => (
                      <div key={row.event} className="rounded-xl border border-gray-200 bg-white p-3">
                        <div className="font-semibold text-gray-800 mb-2">{row.event}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-600">
                          <div>
                            <div className="font-semibold text-gray-700">GIC change</div>
                            <div>{formatSigned(row.gicShock)} / {formatSigned(row.gicRecovery)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-700">Fossil imports change</div>
                            <div>{formatSigned(row.fossilShock)} / {formatSigned(row.fossilRecovery)}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-700">Renewables share change</div>
                            <div>{formatSigned(row.renewablesShock, 'pp')} / {formatSigned(row.renewablesRecovery, 'pp')}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-sm text-gray-600 mt-3">
                  Each row shows pre-shock to shock change and shock to recovery change.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Energy Cost Exposure Proxy ({selectedYear})</h3>
                <BarChartComponent
                  data={costExposure}
                  bars={[{ dataKey: 'exposure', fill: '#F97316', name: 'Exposure proxy' }]}
                  xAxisKey="country"
                  yAxisLabel="Import share × fossil share (%)"
                  height={300}
                  layout="horizontal"
                  customTooltip={(value) => [formatPercent(value), 'Exposure proxy']}
                />
                <p className="text-sm text-gray-600 mt-3">
                  Higher values imply greater sensitivity to imported fossil energy prices.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Absolute vs Relative Decoupling (Indexed)</h3>
                <LineChartComponent
                  data={decouplingSeries}
                  lines={[
                    { dataKey: 'gdpIndex', stroke: '#10B981', name: 'GDP index' },
                    { dataKey: 'gicIndex', stroke: '#F97316', name: 'GIC index' },
                  ]}
                  xAxisKey="year"
                  yAxisLabel="Index (Base = 100)"
                  height={300}
                  customTooltip={(value, name) => [value ? value.toFixed(1) : 'No data', name]}
                />
                <p className="text-sm text-gray-600 mt-3">
                  Shows whether economic growth decouples from energy demand.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Transition Path Classification</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {transitionProfiles.map((profile) => (
                    <div key={profile.country} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
                      <span className="font-semibold text-gray-800">{profile.country}</span>
                      <span className="rounded-full px-2 py-1 text-xs font-semibold text-white" style={{ backgroundColor: profile.color }}>
                        {profile.label}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Tags each country into a transition archetype based on the last decade of renewables and fossil shifts.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
