import axios from 'axios';

const BASE_URL = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_bal_c';

// Mapping for nrg_bal (Balance flow)
const FLOW_MAPPING = {
  'PPRD': 'production',
  'IMP': 'imports',
  'EXP': 'exports',
  'FC_E': 'consumption',
  'TO': 'available',
  'GIC': 'grossInlandConsumption'
};

// Energy products (siec) for fuel mix - expanded for detailed breakdown
const FUEL_CODES = {
  // Main aggregates - these should definitely work
  'C0000X0350-0370': 'solidFossil',  // Solid fossil fuels
  'O4000XBIO': 'oil',                // Oil and petroleum products
  'G3000': 'gas',                    // Natural gas
  'RA000': 'renewables',             // Renewables and biofuels
  'N900H': 'nuclear',                // Nuclear heat
  'E7000': 'electricity',            // Electricity
  'W6100_6220': 'waste',             // Waste
  'H8000': 'heat',                   // Heat
  
  // Peat
  'P1000': 'peat',
  'P1100': 'peat',
  'P1200': 'peatProducts',
  
  // Key detailed fuels
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
};

// Sector consumption codes
const SECTOR_CODES = {
  'FC_IND_E': 'industry',
  'FC_TRA_E': 'transport',
  'FC_OTH_HH_E': 'households',
  'FC_OTH_CP_E': 'commercial'
};

/**
 * Fetch dataset metadata (available years and countries)
 */
export const fetchDatasetMetadata = async () => {
  try {
    // Minimal request to get dataset dimensions
    const params = new URLSearchParams();
    params.append('format', 'JSON');
    params.append('nrg_bal', 'PPRD');
    params.append('siec', 'TOTAL');
    params.append('unit', 'KTOE');
    // Don't filter geo or time to get all available
    
    const response = await axios.get(BASE_URL, { params });
    const data = response.data;
    
    if (!data || !data.dimension) {
      return { years: [], countries: [] };
    }
    
    // Extract available years
    const timeCategory = data.dimension.time?.category?.index || {};
    const years = Object.keys(timeCategory).map(y => parseInt(y)).sort((a, b) => b - a);
    
    // Extract available countries
    const geoCategory = data.dimension.geo?.category?.index || {};
    const geoLabels = data.dimension.geo?.category?.label || {};
    const countries = Object.keys(geoCategory).map(code => ({
      code,
      name: geoLabels[code] || code
    }));
    
    return { years, countries };
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return { years: [2023, 2022, 2021, 2020], countries: [] }; // Fallback
  }
};

/**
 * Fetch basic energy balance data
 */
export const fetchEnergyData = async (countries, year) => {
  if (!countries || countries.length === 0) return {};

  try {
    const flows = Object.keys(FLOW_MAPPING);
    
    const params = new URLSearchParams();
    params.append('format', 'JSON');
    countries.forEach(c => params.append('geo', c));
    params.append('time', year.toString());
    flows.forEach(f => params.append('nrg_bal', f));
    params.append('siec', 'TOTAL');
    params.append('unit', 'KTOE');

    const response = await axios.get(BASE_URL, { params });
    return transformBasicResponse(response.data, countries, year);
  } catch (error) {
    console.error('Eurostat API Error:', error);
    throw error;
  }
};

/**
 * Fetch detailed fuel mix data
 */
export const fetchFuelMixData = async (countries, year) => {
  if (!countries || countries.length === 0) return {};

  try {
    const params = new URLSearchParams();
    params.append('format', 'JSON');
    countries.forEach(c => params.append('geo', c));
    params.append('time', year.toString());
    params.append('nrg_bal', 'GIC'); // Gross Inland Consumption - includes all energy types including nuclear
    // Add all fuel codes for detailed breakdown
    Object.keys(FUEL_CODES).forEach(code => params.append('siec', code));
    params.append('unit', 'KTOE');

    const response = await axios.get(BASE_URL, { params });
    return transformFuelMixResponse(response.data, countries, 'GIC', year);
  } catch (error) {
    console.error('Fuel Mix API Error:', error);
    return {};
  }
};

/**
 * Fetch fuel mix data for specific SIEC codes
 */
export const fetchFuelMixDataForCodes = async (countries, year, siecCodes) => {
  if (!countries || countries.length === 0 || !siecCodes || siecCodes.length === 0) return {};

  try {
    const params = new URLSearchParams();
    params.append('format', 'JSON');
    countries.forEach(c => params.append('geo', c));
    params.append('time', year.toString());
    
    // Use appropriate balance flows for different fuel types
    let balanceFlow = 'FC_E'; // Default to final consumption
    if (siecCodes.some(code => code.startsWith('P'))) {
      balanceFlow = 'TO'; // Total available for peat
    } else if (siecCodes.some(code => code.startsWith('N'))) {
      balanceFlow = 'PPRD'; // Production for nuclear
    } else if (siecCodes.some(code => code.startsWith('R') || code.startsWith('RA'))) {
      balanceFlow = 'TO'; // Total available for renewables
    }
    
    params.append('nrg_bal', balanceFlow);
    
    // Add ALL fuel codes to ensure the API returns data, then filter later
    Object.keys(FUEL_CODES).forEach(code => params.append('siec', code));
    params.append('unit', 'KTOE');

    const response = await axios.get(BASE_URL, { params });
    console.log('Raw API response for fuel codes:', siecCodes, 'balance:', balanceFlow, response.data);
    console.log('Available SIEC codes in response:', Object.values(response.data.dimension.siec.category.index));
    const result = transformFuelMixResponse(response.data, countries, balanceFlow, year);
    
    // Filter the result to only include requested fuel keys
    const filteredResult = {};
    countries.forEach(country => {
      filteredResult[country] = {};
      siecCodes.forEach(code => {
        const fuelKey = FUEL_CODES[code];
        if (fuelKey && result[country][fuelKey] !== undefined) {
          filteredResult[country][fuelKey] = result[country][fuelKey];
        }
      });
    });
    
    console.log('Filtered fuel mix result for codes:', siecCodes, filteredResult);
    return filteredResult;
  } catch (error) {
    console.error('Fuel Mix API Error for codes:', error);
    return {};
  }
};
export const fetchSectorData = async (countries, year) => {
  if (!countries || countries.length === 0) return {};

  try {
    const params = new URLSearchParams();
    params.append('format', 'JSON');
    countries.forEach(c => params.append('geo', c));
    params.append('time', year.toString());
    Object.keys(SECTOR_CODES).forEach(code => params.append('nrg_bal', code));
    params.append('siec', 'TOTAL');
    params.append('unit', 'KTOE');

    const response = await axios.get(BASE_URL, { params });
    return transformSectorResponse(response.data, countries, year);
  } catch (error) {
    console.error('Sector API Error:', error);
    return {};
  }
};

// --- Transform Functions ---

function transformBasicResponse(data, countries, year) {
  const result = {};
  countries.forEach(c => {
    result[c] = { production: 0, imports: 0, exports: 0, consumption: 0, available: 0, dependence: 0 };
  });

  if (!data?.value || !data?.dimension) return result;

  const getValue = createValueGetter(data);

  countries.forEach(geo => {
    Object.entries(FLOW_MAPPING).forEach(([flowCode, appKey]) => {
      const val = getValue({ freq: 'A', nrg_bal: flowCode, siec: 'TOTAL', unit: 'KTOE', geo, time: year.toString() });
      if (val !== null && !isNaN(val)) {
        result[geo][appKey] = val;
        result[geo][`${appKey}Raw`] = val; // Store raw number
      }
    });

    // Calculate dependence
    const imp = result[geo].imports || 0;
    const exp = result[geo].exports || 0;
    const avail = result[geo].available || 1;
    if (!isNaN(imp) && !isNaN(exp) && !isNaN(avail) && avail !== 0) {
      result[geo].dependence = (((imp - exp) / avail) * 100).toFixed(1) + '%';
    } else {
      result[geo].dependence = '—';
    }
    
    // Format for display
    ['production', 'imports', 'exports', 'consumption', 'available'].forEach(key => {
      if (result[geo][key] !== undefined && !isNaN(result[geo][key])) {
        result[geo][key] = Math.round(result[geo][key]).toLocaleString();
      } else {
        result[geo][key] = '—';
      }
    });
  });

  return result;
}

function transformFuelMixResponse(data, countries, nrgBal = 'FC_E', year) {
  const result = {};
  countries.forEach(c => { result[c] = {}; });

  if (!data?.value || !data?.dimension) return result;
  const getValue = createValueGetter(data);

  countries.forEach(geo => {
    Object.entries(FUEL_CODES).forEach(([code, name]) => {
      const val = getValue({ freq: 'A', nrg_bal: nrgBal, siec: code, unit: 'KTOE', geo, time: year });
      result[geo][name] = (val !== null && !isNaN(val)) ? Math.round(val) : null;
    });
  });
  return result;
}

function transformSectorResponse(data, countries, year) {
  const result = {};
  countries.forEach(c => { result[c] = {}; });

  if (!data?.value || !data?.dimension) return result;
  const getValue = createValueGetter(data);

  countries.forEach(geo => {
    Object.entries(SECTOR_CODES).forEach(([code, name]) => {
      const val = getValue({ freq: 'A', nrg_bal: code, siec: 'TOTAL', unit: 'KTOE', geo, time: year });
      result[geo][name] = val !== null ? Math.round(val) : 0;
    });
  });
  return result;
}

// --- Utility ---

function createValueGetter(data) {
  const { value, dimension, id: ids, size: sizes } = data;
  const dimIndices = ids.map(dimId => dimension[dimId]?.category?.index || {});
  
  return (filters) => {
    let linearIndex = 0;
    let multiplier = 1;

    for (let k = ids.length - 1; k >= 0; k--) {
      const dimId = ids[k];
      const filterVal = filters[dimId];
      const dimValIndex = filterVal !== undefined ? (dimIndices[k][filterVal] ?? 0) : 0;
      linearIndex += dimValIndex * multiplier;
      multiplier *= sizes[k];
    }
    return value[linearIndex] ?? null;
  };
}

/**
 * Fetch population data from Eurostat demo_pjan dataset
 */
export const fetchPopulationData = async (countries, year) => {
  if (!countries || countries.length === 0) return {};

  try {
    const params = new URLSearchParams();
    params.append('format', 'JSON');
    countries.forEach(c => params.append('geo', c));
    params.append('time', year.toString());
    params.append('unit', 'NR'); // Number (population)
    params.append('age', 'TOTAL');
    params.append('sex', 'T');

    const response = await axios.get('https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/demo_pjan', { params });
    return transformPopulationResponse(response.data, countries, year);
  } catch (error) {
    console.error('Population API Error:', error);
    return {};
  }
};

/**
 * Fetch GDP data from Eurostat nama_10_gdp dataset
 */
export const fetchGDPData = async (countries, year) => {
  if (!countries || countries.length === 0) return {};

  try {
    const params = new URLSearchParams();
    params.append('format', 'JSON');
    countries.forEach(c => params.append('geo', c));
    params.append('time', year.toString());
    params.append('unit', 'CLV10_MEUR'); // Chain linked volumes (2010), million euro
    params.append('na_item', 'B1GQ'); // Gross domestic product at market prices

    const response = await axios.get('https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nama_10_gdp', { params });
    return transformGDPResponse(response.data, countries, year);
  } catch (error) {
    console.error('GDP API Error:', error);
    return {};
  }
};

/**
 * Transform population API response
 */
function transformPopulationResponse(data, countries, year) {
  const result = {};
  countries.forEach(c => { result[c] = 0; });

  if (!data?.value || !data?.dimension) return result;
  const getValue = createValueGetter(data);

  countries.forEach(geo => {
    const val = getValue({ freq: 'A', unit: 'NR', age: 'TOTAL', sex: 'T', geo, time: year.toString() });
    if (val !== null && !isNaN(val)) {
      result[geo] = val; // Population in thousands
    }
  });

  return result;
}

/**
 * Transform GDP API response
 */
function transformGDPResponse(data, countries, year) {
  const result = {};
  countries.forEach(c => { result[c] = 0; });

  if (!data?.value || !data?.dimension) return result;
  const getValue = createValueGetter(data);

  countries.forEach(geo => {
    const val = getValue({ freq: 'A', unit: 'CLV10_MEUR', na_item: 'B1GQ', geo, time: year.toString() });
    if (val !== null && !isNaN(val)) {
      result[geo] = val; // GDP in million EUR (chain linked volumes, 2010 prices)
    }
  });

  return result;
}
