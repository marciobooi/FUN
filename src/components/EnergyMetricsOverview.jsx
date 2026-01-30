import React from 'react'
import { FuelFamilySelector } from './ui/FuelFamilySelector'
import { MetricsGrid } from './ui/MetricsGrid'

export function EnergyMetricsOverview({
  selectedCountries,
  selectedFamily,
  setSelectedFamily,
  data,
  familyFuelData,
  isLoadingFamilyData
}) {
  // Mapping from siec codes to fuelMix keys
  const fuelKeyMap = {
    'C0000X0350-0370': 'solidFossil',
    'O4000XBIO': 'oil',
    'G3000': 'gas',
    'RA000': 'renewables',
    'N900H': 'nuclear',
    'E7000': 'electricity',
    'W6100_6220': 'waste',
    'H8000': 'heat',
    // Peat
    'P1000': 'peat',
    'P1100': 'peat',
    'P1200': 'peatProducts',
    // Detailed solid fossil fuels
    'C0100': 'hardCoal',
    'C0110': 'anthracite',
    'C0121': 'cokingCoal',
    'C0129': 'otherBituminousCoal',
    'C0200': 'brownCoal',
    'C0210': 'subBituminousCoal',
    'C0220': 'lignite',
    'C0300': 'derivedCoal',
    'C0311': 'cokeOvenCoke',
    'C0312': 'gasCoke',
    'C0320': 'patentFuel',
    'C0330': 'brownCoalBriquettes',
    'C0340': 'coalTar',
    'C0350-0370': 'manufacturedGases',
    'C0350': 'cokeOvenGas',
    'C0360': 'gasWorksGas',
    'C0371': 'blastFurnaceGas',
    'C0379': 'otherRecoveredGases',
    // Other detailed fuels
    'O4100_TOT': 'crudeOil',
    'O4650': 'gasoline',
    'O4660': 'kerosene',
    'O4671XR5220B': 'diesel',
    'O4680': 'fuelOil',
    'RA100': 'hydro',
    'RA200': 'geothermal',
    'RA300': 'wind',
    'RA400': 'solar',
    'RA410': 'solarThermal',
    'RA420': 'solarPhotovoltaic',
    'RA500': 'tideWaveOcean',
    'RA600': 'ambientHeat',
    'R5000': 'biofuels',
    'R5100': 'solidBiofuels',
    'R5110-5150_W6000RI': 'primarySolidBiofuels',
    'R5160': 'charcoal',
    'R5200': 'liquidBiofuels',
    'R5210': 'biogasoline',
    'R5210P': 'pureBiogasoline',
    'R5210B': 'blendedBiogasoline',
    'R5220': 'biodiesels',
    'R5220P': 'pureBiodiesels',
    'R5220B': 'blendedBiodiesels',
    'R5230': 'bioJetKerosene',
    'R5230P': 'pureBioJetKerosene',
    'R5230B': 'blendedBioJetKerosene',
    'R5290': 'otherLiquidBiofuels',
    'R5300': 'biogases',
    'W6100': 'industrialWaste',
    'W6210': 'renewableMunicipalWaste',
    'W6220': 'nonRenewableMunicipalWaste'
  }

  const categories = [
    {
      id: 'production',
      label: 'Energy Production',
      icon: '⚡',
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      id: 'imports',
      label: 'Energy Imports',
      icon: '📥',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      id: 'exports',
      label: 'Energy Exports',
      icon: '📤',
      color: 'from-emerald-500 to-green-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      id: 'consumption',
      label: 'Final Consumption',
      icon: '🏭',
      color: 'from-red-500 to-rose-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
    {
      id: 'available',
      label: 'Available Energy',
      icon: '💡',
      color: 'from-indigo-500 to-blue-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
    },
    {
      id: 'dependence',
      label: 'Energy Dependence',
      icon: '📊',
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      id: 'net_imports',
      label: 'Net Energy Trade',
      icon: '⚖️',
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600',
      calculate: (data, countryCode) => {
        const imp = data?.importsRaw || 0;
        const exp = data?.exportsRaw || 0;
        const balance = imp - exp;
        return balance.toLocaleString();
      }
    },
    {
      id: 'self_sufficiency',
      label: 'Energy Self-Sufficiency',
      icon: '🔄',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      calculate: (data, countryCode) => {
        const production = data?.productionRaw || 0;
        const consumption = data?.consumptionRaw || 0;
        return consumption > 0 ? ((production / consumption) * 100).toFixed(1) + '%' : '—';
      }
    },
    {
      id: 'efficiency',
      label: 'Energy Efficiency',
      icon: '⚡',
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      calculate: (data, countryCode) => {
        const available = data?.availableRaw || 0;
        const consumption = data?.consumptionRaw || 0;
        return available > 0 ? ((consumption / available) * 100).toFixed(1) + '%' : '—';
      }
    },
    {
      id: 'trade_balance',
      label: 'Trade Balance',
      icon: '📈',
      color: 'from-slate-500 to-gray-500',
      bgColor: 'bg-slate-50',
      textColor: 'text-slate-600',
      calculate: (data, countryCode) => {
        const imports = data?.importsRaw || 0;
        const exports = data?.exportsRaw || 0;
        const balance = imports - exports;
        return balance >= 0 ? '+' + balance.toLocaleString() : balance.toLocaleString();
      }
    }
  ]

  // Helper function to recursively collect all leaf nodes (fuels with no children)
  const collectLeafNodes = (node) => {
    if (!node.children || node.children.length === 0) {
      return [node];
    }
    return node.children.flatMap(collectLeafNodes);
  };

  // Generate fuel-specific categories when a family is selected
  const getFuelCategories = (family) => {
    if (!family) return categories;

    // Collect all leaf nodes (detailed fuel types) from the family hierarchy
    const leafNodes = collectLeafNodes(family);

    // Filter out fuels that have no data for all selected countries
    const filteredLeafNodes = leafNodes.filter(leaf => {
      const fuelKey = fuelKeyMap[leaf.id];
      if (!fuelKey) return false;

      // Check if at least one country has data for this fuel
      return selectedCountries.some(countryCode => {
        const data = familyFuelData[countryCode]?.[fuelKey];
        return data !== null && data !== undefined && !isNaN(data) && data !== 0;
      });
    });

    // Return ONLY fuel-specific categories when a family is selected
    return filteredLeafNodes.map(leaf => ({
      id: leaf.id,
      label: leaf.name,
      icon: '🔥',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',

      calculate: (countryData, countryCode) => {
        const fuelKey = fuelKeyMap[leaf.id];

        // Show loading indicator if data is being fetched
        if (isLoadingFamilyData) {
          return '...';
        }

        // Check if we have fuel data for this country and fuel type
        if (fuelKey && familyFuelData && familyFuelData[countryCode] && familyFuelData[countryCode][fuelKey] !== null && familyFuelData[countryCode][fuelKey] !== undefined && !isNaN(familyFuelData[countryCode][fuelKey]) && familyFuelData[countryCode][fuelKey] !== 0) {
          const value = familyFuelData[countryCode][fuelKey];
          return Number(value).toLocaleString();
        }

        // No data available
        return '—';
      }
    }));
  };

  const displayCategories = selectedFamily ? getFuelCategories(selectedFamily) : categories;

  return (
    <>
      {/* Fuel Family Buttons */}
      <FuelFamilySelector selectedFamily={selectedFamily} setSelectedFamily={setSelectedFamily} />

      {/* Metrics Grid */}
      <MetricsGrid
        displayCategories={displayCategories}
        selectedCountries={selectedCountries}
        data={data}
        isLoadingFamilyData={isLoadingFamilyData}
      />
    </>
  )
}