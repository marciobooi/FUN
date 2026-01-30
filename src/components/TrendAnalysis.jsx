import { EnergyComparisonChart } from './EnergyComparisonChart'

export function TrendAnalysis({ countries, year, data }) {
  return (
    <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-8">Trend Analysis</h3>
      <EnergyComparisonChart
        countries={countries}
        year={year}
        data={data}
      />
    </section>
  )
}
