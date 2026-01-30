import { FuelMixChart } from './FuelMixChart'
import { SectorConsumptionChart } from './SectorConsumptionChart'

export function DashboardCharts({ fuelMix, sectors, selectedCountries }) {
  return (
    <div className="space-y-8">
      {/* Fuel Mix Chart */}
      <FuelMixChart data={fuelMix} selectedCountries={selectedCountries} />
      
      {/* Sector Consumption */}
      <SectorConsumptionChart data={sectors} selectedCountries={selectedCountries} />
    </div>
  )
}
