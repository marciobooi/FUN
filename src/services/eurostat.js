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

// Energy products (siec) for fuel mix
const FUEL_CODES = {
  'C0000X0350-0370': 'solidFossil',  // Solid fossil fuels
  'O4000XBIO': 'oil',                // Oil and petroleum products
  'G3000': 'gas',                    // Natural gas
  'N900H': 'nuclear',                // Nuclear heat
  'RA000': 'renewables',             // Renewables and biofuels
  'E7000': 'electricity',            // Electricity
  'H8000': 'heat'                    // Heat
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
    params.append('nrg_bal', 'TO'); // Total supply
    Object.keys(FUEL_CODES).forEach(code => params.append('siec', code));
    params.append('unit', 'KTOE');

    const response = await axios.get(BASE_URL, { params });
    return transformFuelMixResponse(response.data, countries);
  } catch (error) {
    console.error('Fuel Mix API Error:', error);
    return {};
  }
};

/**
 * Fetch sector consumption data
 */
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
    return transformSectorResponse(response.data, countries);
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
      const val = getValue({ nrg_bal: flowCode, geo, siec: 'TOTAL' });
      if (val !== null) result[geo][appKey] = val;
    });

    // Calculate dependence
    const imp = result[geo].imports || 0;
    const exp = result[geo].exports || 0;
    const avail = result[geo].available || 1;
    result[geo].dependence = (((imp - exp) / avail) * 100).toFixed(1) + '%';
    
    // Format for display
    ['production', 'imports', 'exports', 'consumption', 'available'].forEach(key => {
      result[geo][key] = Math.round(result[geo][key]).toLocaleString();
    });
  });

  return result;
}

function transformFuelMixResponse(data, countries) {
  const result = {};
  countries.forEach(c => { result[c] = {}; });

  if (!data?.value || !data?.dimension) return result;
  const getValue = createValueGetter(data);

  countries.forEach(geo => {
    Object.entries(FUEL_CODES).forEach(([code, name]) => {
      const val = getValue({ nrg_bal: 'TO', geo, siec: code });
      result[geo][name] = val !== null ? Math.round(val) : 0;
    });
  });
  return result;
}

function transformSectorResponse(data, countries) {
  const result = {};
  countries.forEach(c => { result[c] = {}; });

  if (!data?.value || !data?.dimension) return result;
  const getValue = createValueGetter(data);

  countries.forEach(geo => {
    Object.entries(SECTOR_CODES).forEach(([code, name]) => {
      const val = getValue({ nrg_bal: code, geo, siec: 'TOTAL' });
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
