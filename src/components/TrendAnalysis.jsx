import { EnergyComparisonChart } from './EnergyComparisonChart'
import { MethodologyModal } from './ui/MethodologyModal'

export function TrendAnalysis({ countries, year, data }) {
  return (
    <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-gray-900">Trend Analysis</h3>
        <MethodologyModal title="Trend Analysis - Methodology">
          <p>
            <strong>Data Source:</strong> Eurostat nrg_bal_c (Energy balance by product) - Historical GIC (Gross Inland Consumption) time series
          </p>
          <p>
            <strong>Analysis Type:</strong> Year-over-year trend analysis showing energy consumption patterns and shifts in the selected countries
          </p>
          <p>
            <strong>Metrics Tracked:</strong> 
            <span className="block ml-2 mt-1">
              • Gross Inland Consumption (GIC) by fuel type and total | 
              • Production trends | 
              • Import/Export flows | 
              • Growth rates and volatility
            </span>
          </p>
          <p>
            <strong>Unit:</strong> KTOE (Kilotonnes of Oil Equivalent) - standardized for cross-fuel and cross-country comparison
          </p>
          <p>
            <strong>Time Period:</strong> Historical data from 2005 to selected year (or most recent available), enabling long-term trend assessment
          </p>
          <p>
            <strong>Coverage:</strong> Individual country trends or aggregated multi-country analysis depending on selection
          </p>
          <p>
            <strong>Note:</strong> Trend shifts often correlate with economic cycles (2008 financial crisis), energy policy changes (renewable targets), extreme weather (hydro availability), and geopolitical events (supply disruptions). See "Practical Field Mapping" guide for detailed energy balance definitions.
          </p>
        </MethodologyModal>
      </div>
      <EnergyComparisonChart
        countries={countries}
        year={year}
        data={data}
      />
    </section>
  )
}
