import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { fuelFamilies } from '../data/siecCodes'
import { getCountryName } from '../data/countryNames'
import { MethodologyModal } from './ui/MethodologyModal'

// Color mapping for fuel families
const FAMILY_COLORS = {
  'C0000X0350-0370': '#374151',  // Gray - Coal
  'P1000': '#92400E',             // Brown - Peat
  'S2000': '#2C1810',             // Dark Brown - Oil Shale
  'G3000': '#F59E0B',             // Amber - Gas
  'O4000XBIO': '#3B82F6',         // Blue - Oil
  'RA000': '#10B981',             // Green - Renewables
  'W6100_6220': '#92400E',        // Brown - Waste
  'N900H': '#8B5CF6',             // Violet - Nuclear
  'E7000': '#EF4444',             // Red - Electricity
  'H8000': '#F97316'              // Orange - Heat
}

export function FuelMixDecomposition({ fuelMix, selectedCountries, selectedYear }) {
  // Calculate energy mix for selected countries
  const calculateEnergyMix = () => {
    if (!fuelMix || selectedCountries.length === 0) return null;

    // Mapping between fuel family IDs and data keys
    const fuelMapping = {
      'C0000X0350-0370': 'solidFossil',
      'P1000': 'peat',
      'S2000': 'oilShale',
      'G3000': 'gas',
      'O4000XBIO': 'oil',
      'RA000': 'renewables',
      'W6100_6220': 'waste',
      'N900H': 'nuclear',
      'E7000': 'electricity',
      'H8000': 'heat'
    };

    if (selectedCountries.length === 1) {
      // Single country - show direct data
      const country = selectedCountries[0];
      const data = fuelMix[country];
      if (!data) return null;

      // Calculate total from all available fuel data
      const total = Object.values(data).reduce((sum, value) => sum + (value || 0), 0);
      if (total === 0) return null;

      // Create energy mix for all fuel families
      const mix = { country, isAggregate: false };

      fuelFamilies.forEach(family => {
        const dataKey = fuelMapping[family.id];
        if (dataKey && data[dataKey] !== undefined) {
          mix[family.id] = ((data[dataKey] || 0) / total * 100).toFixed(1);
        }
      });

      return mix;
    } else {
      // Multiple countries - show aggregate
      const totals = {};
      let totalEnergy = 0;

      // Initialize totals for all fuel families
      fuelFamilies.forEach(family => {
        totals[family.id] = 0;
      });

      selectedCountries.forEach(country => {
        if (fuelMix[country]) {
          const countryData = fuelMix[country];

          fuelFamilies.forEach(family => {
            const dataKey = fuelMapping[family.id];
            if (dataKey && countryData[dataKey] !== undefined) {
              totals[family.id] += countryData[dataKey] || 0;
            }
          });

          // Calculate total energy for this country
          totalEnergy += Object.values(countryData).reduce((sum, value) => sum + (value || 0), 0);
        }
      });

      if (totalEnergy === 0) return null;

      // Create aggregated energy mix
      const mix = {
        isAggregate: true,
        countries: selectedCountries
      };

      fuelFamilies.forEach(family => {
        if (totals[family.id] > 0) {
          mix[family.id] = ((totals[family.id] / totalEnergy) * 100).toFixed(1);
        }
      });

      return mix;
    }
  };

  const energyMix = calculateEnergyMix();

  return energyMix ? (
    <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-gray-900">Fuel Mix Decomposition</h3>
        <MethodologyModal title="Fuel Mix Decomposition - Methodology">
          <p>
            <strong>Data Source:</strong> Eurostat nrg_bal_c (Energy balance by product) - GIC (Gross Inland Consumption) decomposed by fuel type
          </p>
          <p>
            <strong>Fuel Families:</strong> 
            <span className="block ml-2 mt-1">
              • Coal & Solid Fuels (coal, lignite, coke) | 
              • Peat | 
              • Oil Shale | 
              • Natural Gas | 
              • Oil & Petroleum Products | 
              • Renewables (hydro, wind, solar, biomass, geothermal) | 
              • Waste (non-renewable waste) | 
              • Nuclear | 
              • Electricity (net imports) | 
              • Heat (district heating)
            </span>
          </p>
          <p>
            <strong>Unit:</strong> Mtoe (Million tonnes of Oil Equivalent) - aggregation of primary and secondary fuel contributions to total GIC
          </p>
          <p>
            <strong>Aggregation:</strong> Multi-country view shows combined GIC across selected countries; single-country view shows national fuel composition
          </p>
          <p>
            <strong>Coverage:</strong> All countries in the dataset from 2005 to present (annual data)
          </p>
          <p>
            <strong>Note:</strong> Fuel mix decomposition includes all energy types consumed nationally, including losses in transformation and distribution. See "Practical Field Mapping" guide for detailed fuel group definitions and SIEC code mappings.
          </p>
        </MethodologyModal>
      </div>
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50">
        <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          {energyMix.isAggregate 
            ? `Energy Mix Overview (${selectedYear})` 
            : `Energy Mix - ${energyMix.country} (${selectedYear})`
          }
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 text-sm">
          {fuelFamilies
            .filter(family => energyMix[family.id] !== undefined && parseFloat(energyMix[family.id]) > 0)
            .map(family => {
              // Color mapping for different fuel types
              const colorMap = {
                'C0000X0350-0370': 'text-gray-600',
                'P1000': 'text-amber-600',
                'S2000': 'text-stone-600',
                'G3000': 'text-amber-600',
                'O4000XBIO': 'text-blue-600',
                'RA000': 'text-green-600',
                'W6100_6220': 'text-orange-600',
                'N900H': 'text-purple-600',
                'E7000': 'text-red-600',
                'H8000': 'text-orange-500'
              };

              return (
                <div key={family.id} className="bg-white/70 rounded-xl p-3 border border-white/50 hover:bg-white/90 transition-colors">
                  <div className={`font-semibold ${colorMap[family.id] || 'text-gray-600'} text-xs leading-tight`}>
                    {family.name}
                  </div>
                  <div className="text-xl font-bold text-gray-800 mt-1">
                    {energyMix[family.id]}%
                  </div>
                </div>
              );
            })}
        </div>
        <p className="text-xs text-gray-600 mt-4 leading-relaxed">
          {energyMix.isAggregate
            ? `The energy mix shows the comprehensive fuel composition across the ${selectedCountries.length} selected countries combined, including all energy sources from primary fuels to electricity and heat. The shares vary significantly between countries based on their energy policies and resources.`
            : `The energy mix shows the comprehensive fuel composition for ${energyMix.country}, including all energy sources from primary fuels to electricity and heat. The shares vary significantly between countries based on their energy policies and resources.`
          }
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {selectedCountries.map(country => {
          const countryData = fuelMix[country]
          if (!countryData) return null

          // Mapping between fuel family IDs and data keys
          const fuelMapping = {
            'C0000X0350-0370': 'solidFossil',
            'P1000': 'peat',
            'S2000': 'oilShale',
            'G3000': 'gas',
            'O4000XBIO': 'oil',
            'RA000': 'renewables',
            'W6100_6220': 'waste',
            'N900H': 'nuclear',
            'E7000': 'electricity',
            'H8000': 'heat'
          }

          // Create pie data for fuel families
          const pieData = fuelFamilies
            .map(family => {
              const dataKey = fuelMapping[family.id]
              const value = dataKey && countryData[dataKey] ? parseFloat(countryData[dataKey]) : 0
              return {
                name: family.name,
                value: parseFloat(value.toFixed(1)),
                id: family.id
              }
            })
            .filter(item => item.value > 0)

          if (pieData.length === 0) return null

          const total = pieData.reduce((sum, item) => sum + item.value, 0)

          return (
            <div key={country} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-hidden">
              {/* KPI Card - All Fuels */}
              <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <h4 className="text-lg font-bold text-gray-800 mb-3">{getCountryName(country)}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {pieData.map(item => (
                    <div key={item.id} className="bg-white/70 rounded-lg p-2 border border-blue-100">
                      <div className="text-xs font-semibold text-gray-700">{item.name}</div>
                      <div className="text-sm font-bold text-blue-600">{item.value.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{(item.value / total * 100).toFixed(1)}%</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pie Chart */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h5 className="text-sm font-semibold text-gray-800 mb-4">Fuel Mix by Family</h5>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name.split(' ')[0]} ${(value / total * 100).toFixed(0)}%`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={FAMILY_COLORS[entry.id] || '#6B7280'} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        `${value.toLocaleString()} Mtoe`,
                        'Consumption'
                      ]}
                      contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Fuel Breakdown Table */}
              <div className="mt-4 space-y-2">
                {pieData.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-xs p-2 bg-gray-50 rounded border border-gray-100">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="font-semibold text-gray-800">
                      {item.value.toLocaleString()} Mtoe ({(item.value / total * 100).toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  ) : null;
}
