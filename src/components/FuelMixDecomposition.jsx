import { fuelFamilies } from '../data/siecCodes'
import { FuelDecomposition } from './FuelDecomposition'

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
      <h3 className="text-xl font-bold text-gray-900 mb-8">Fuel Mix Decomposition</h3>
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
        {selectedCountries.map(country => (
          <FuelDecomposition key={country} countryCode={country} year={selectedYear} />
        ))}
      </div>
    </section>
  ) : null;
}
