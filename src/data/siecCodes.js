/**
 * Standard International Energy Product Classification (SIEC) codes from nrg_bal_c
 * Following Eurostat Energy Balance methodology and IRES standards
 *
 * Code Structure:
 * - C: Coal and coal products
 * - P: Peat and peat products
 * - S: Oil shale and oil sands
 * - G: Natural gas
 * - O: Oil and petroleum products
 * - R: Renewables and biofuels
 * - W: Waste
 * - N: Nuclear
 * - E: Electricity
 * - H: Heat
 *
 * Format: { code, label }
 */

const siecCodes = [
    // TOTAL
    { code: 'TOTAL', label: 'Total' },

    // ============================================
    // SOLID FOSSIL FUELS (C)
    // ============================================
    { code: 'C0000X0350-0370', label: 'Solid fossil fuels' },

    // Hard Coal
    { code: 'C0100', label: 'Hard coal' },
    { code: 'C0110', label: 'Anthracite' },
    { code: 'C0121', label: 'Coking coal' },
    { code: 'C0129', label: 'Other bituminous coal' },

    // Brown Coal
    { code: 'C0200', label: 'Brown coal' },
    { code: 'C0210', label: 'Sub-bituminous coal' },
    { code: 'C0220', label: 'Lignite' },

    // Derived Coal Products
    { code: 'C0300', label: 'Derived coal products' },
    { code: 'C0311', label: 'Coke oven coke' },
    { code: 'C0312', label: 'Gas coke' },
    { code: 'C0320', label: 'Patent fuel' },
    { code: 'C0330', label: 'Brown coal briquettes' },
    { code: 'C0340', label: 'Coal tar' },

    // Manufactured Gases
    { code: 'C0350-0370', label: 'Manufactured gases' },
    { code: 'C0350', label: 'Coke oven gas' },
    { code: 'C0360', label: 'Gas works gas' },
    { code: 'C0371', label: 'Blast furnace gas' },
    { code: 'C0379', label: 'Other recovered gases' },

    // ============================================
    // PEAT (P)
    // ============================================
    { code: 'P1000', label: 'Peat and peat products' },
    { code: 'P1100', label: 'Peat' },
    { code: 'P1200', label: 'Peat products' },

    // ============================================
    // OIL SHALE (S)
    // ============================================
    { code: 'S2000', label: 'Oil shale and oil sands' },

    // ============================================
    // NATURAL GAS (G)
    // ============================================
    { code: 'G3000', label: 'Natural gas' },

    // ============================================
    // OIL AND PETROLEUM PRODUCTS (O)
    // ============================================
    { code: 'O4000XBIO', label: 'Oil and petroleum products (excl. biofuel portion)' },

    // Primary Oil Products
    { code: 'O4100_TOT', label: 'Crude oil' },
    { code: 'O4200', label: 'Natural gas liquids (NGL)' },
    { code: 'O4300', label: 'Refinery feedstocks' },
    { code: 'O4400X4410', label: 'Additives and oxygenates (excl. biofuel portion)' },
    { code: 'O4500', label: 'Other hydrocarbons' },

    // Refinery Products
    { code: 'O4600', label: 'Refinery products' },
    { code: 'O4610', label: 'Refinery gas' },
    { code: 'O4620', label: 'Ethane' },
    { code: 'O4630', label: 'Liquefied petroleum gases (LPG)' },
    { code: 'O4640', label: 'Naphtha' },

    // Gasoline Products
    { code: 'O4650', label: 'Gasoline products' },
    { code: 'O4651', label: 'Aviation gasoline' },
    { code: 'O4652XR5210B', label: 'Motor gasoline (excl. biofuel portion)' },
    { code: 'O4653', label: 'Gasoline-type jet fuel' },

    // Kerosene and Middle Distillates
    { code: 'O4660', label: 'Kerosene and middle distillates' },
    { code: 'O4661XR5230B', label: 'Kerosene-type jet fuel (excl. biofuel portion)' },
    { code: 'O4669', label: 'Other kerosene' },
    { code: 'O4671XR5220B', label: 'Gas oil and diesel oil (excl. biofuel portion)' },
    { code: 'O4680', label: 'Fuel oil' },

    // Other Petroleum Products
    { code: 'O4690', label: 'Other petroleum products' },
    { code: 'O4691', label: 'White spirit and SBP spirits' },
    { code: 'O4692', label: 'Lubricants' },
    { code: 'O4693', label: 'Paraffin waxes' },
    { code: 'O4694', label: 'Petroleum coke' },
    { code: 'O4695', label: 'Bitumen' },
    { code: 'O4699', label: 'Other oil products n.e.c.' },

    // ============================================
    // RENEWABLES AND BIOFUELS (RA, R)
    // ============================================
    { code: 'RA000', label: 'Renewables and biofuels' },

    // Primary Renewables (non-combustible)
    { code: 'RA100', label: 'Hydro power' },
    { code: 'RA200', label: 'Geothermal energy' },
    { code: 'RA300', label: 'Wind energy' },
    { code: 'RA400', label: 'Solar energy' },
    { code: 'RA410', label: 'Solar thermal' },
    { code: 'RA420', label: 'Solar photovoltaic' },
    { code: 'RA500', label: 'Tide, wave and ocean' },
    { code: 'RA600', label: 'Ambient heat (heat pumps)' },

    // Biofuels (combustible)
    { code: 'R5000', label: 'Biofuels' },

    // Solid Biofuels
    { code: 'R5100', label: 'Solid biofuels' },
    { code: 'R5110-5150_W6000RI', label: 'Primary solid biofuels' },
    { code: 'R5160', label: 'Charcoal' },

    // Liquid Biofuels
    { code: 'R5200', label: 'Liquid biofuels' },
    { code: 'R5210', label: 'Biogasoline' },
    { code: 'R5210P', label: 'Pure biogasoline' },
    { code: 'R5210B', label: 'Blended biogasoline' },
    { code: 'R5220', label: 'Biodiesels' },
    { code: 'R5220P', label: 'Pure biodiesels' },
    { code: 'R5220B', label: 'Blended biodiesels' },
    { code: 'R5230', label: 'Bio jet kerosene' },
    { code: 'R5230P', label: 'Pure bio jet kerosene' },
    { code: 'R5230B', label: 'Blended bio jet kerosene' },
    { code: 'R5290', label: 'Other liquid biofuels' },

    // Gaseous Biofuels
    { code: 'R5300', label: 'Biogases' },

    // ============================================
    // WASTE (W)
    // ============================================
    { code: 'W6100_6220', label: 'Non-renewable waste' },
    { code: 'W6100', label: 'Industrial waste (non-renewable)' },
    { code: 'W6200', label: 'Municipal waste' },
    { code: 'W6210', label: 'Renewable municipal waste' },
    { code: 'W6220', label: 'Non-renewable municipal waste' },

    // ============================================
    // NUCLEAR (N)
    // ============================================
    { code: 'N900H', label: 'Nuclear heat' },

    // ============================================
    // ELECTRICITY (E)
    // ============================================
    { code: 'E7000', label: 'Electricity' },

    // ============================================
    // HEAT (H)
    // ============================================
    { code: 'H8000', label: 'Derived heat' }
];

/**
 * Energy Balance Flow Codes from nrg_bal_c
 * Following Eurostat Energy Balance methodology
 *
 * These codes represent different stages and flows in the energy balance
 * from primary production through final consumption
 *
 * Format: { code, label }
 */
const balanceCodes = [
    { code: 'PPRD', label: 'Primary production' },
    { code: 'RCV_RCY', label: 'Receipts from other sources / recycling' },
    { code: 'IMP', label: 'Imports' },
    { code: 'EXP', label: 'Exports' },
    { code: 'STK_CHG', label: 'Change in stock' },
    { code: 'GAE', label: 'Gross available energy' },
    { code: 'INTMARB', label: 'International maritime bunkers' },
    { code: 'INTAVI', label: 'International aviation' },
    { code: 'GIC', label: 'Gross inland consumption' },
    { code: 'NRGSUP', label: 'Total energy supply' },
    { code: 'GIC_EED', label: 'Gross inland consumption - EED' },
    { code: 'PEC_EED', label: 'Primary energy consumption - EED' },
    { code: 'FEC_EED', label: 'Final energy consumption - EED' },
    { code: 'TI_E', label: 'Transformation input - energy use (total)' },
    { code: 'TI_EHG_E', label: 'Transformation input - electricity & heat generation' },
    { code: 'TI_CO_E', label: 'Transformation input - coke ovens' },
    { code: 'TI_BF_E', label: 'Transformation input - blast furnaces' },
    { code: 'TI_GW_E', label: 'Transformation input - gas works' },
    { code: 'TI_RPI_E', label: 'Transformation input - refineries & petrochemicals' },
    { code: 'TI_PF_E', label: 'Transformation input - patent fuel plants' },
    { code: 'TI_NSP_E', label: 'Transformation input - not elsewhere specified' },
    { code: 'TO', label: 'Transformation output (total)' },
    { code: 'TO_EHG', label: 'Transformation output - electricity & heat generation' },
    { code: 'TO_CO', label: 'Transformation output - coke ovens' },
    { code: 'TO_BF', label: 'Transformation output - blast furnaces' },
    { code: 'TO_GW', label: 'Transformation output - gas works' },
    { code: 'TO_RPI', label: 'Transformation output - refineries & petrochemicals' },
    { code: 'TO_PF', label: 'Transformation output - patent fuel plants' },
    { code: 'TO_NSP', label: 'Transformation output - not elsewhere specified' },
    { code: 'NRG_E', label: 'Energy sector - energy use' },
    { code: 'DL', label: 'Distribution losses' },
    { code: 'AFC', label: 'Available for final consumption' },
    { code: 'FC_NE', label: 'Final consumption - non-energy use (total)' },
    { code: 'FC_E', label: 'Final consumption - energy use (total)' },
    { code: 'FC_IND_E', label: 'Final consumption - industry (energy use)' },
    { code: 'FC_TRA_E', label: 'Final consumption - transport (energy use)' },
    { code: 'FC_OTH_E', label: 'Final consumption - other sectors (energy use)' },
    { code: 'FC_IND_NE', label: 'Final consumption - industry (non-energy use)' },
    { code: 'FC_TRA_NE', label: 'Final consumption - transport (non-energy use)' },
    { code: 'FC_OTH_NE', label: 'Final consumption - other sectors (non-energy use)' },
    { code: 'STATDIFF', label: 'Statistical differences' },
    { code: 'GEP', label: 'Gross electricity production' },
    { code: 'GHP', label: 'Gross heat production' }
];

/**
 * Hierarchical SIEC (Standard International Energy Product Classification) structure
 * Following Eurostat NRG_BAL_C energy balance methodology
 *
 * Based on:
 * - Eurostat Energy Balance Guide
 * - International Recommendations for Energy Statistics (IRES)
 * - UN Statistics Division SIEC classification
 *
 * Structure: TOTAL → Main Aggregates → Product Groups → Individual Products
 *
 * Main SIEC Categories:
 * - C: Coal and coal products (solid fossil fuels)
 * - P: Peat and peat products
 * - S: Oil shale and oil sands
 * - G: Natural gas
 * - O: Oil and petroleum products
 * - R: Renewables and biofuels
 * - W: Waste
 * - N: Nuclear
 * - E: Electricity
 * - H: Heat
 */
const fuelFamilies = [
    // ============================================
    // SOLID FOSSIL FUELS (Coal and coal products)
    // ============================================
    {
        id: 'C0000X0350-0370',
        name: 'Solid Fossil Fuels',
        category: 'primary',
        description: 'Coal and coal-derived products including manufactured gases',
        children: [
            // Primary coal products
            {
                id: 'C0100',
                name: 'Hard Coal',
                category: 'primary',
                children: [
                    { id: 'C0110', name: 'Anthracite', category: 'primary', children: [] },
                    { id: 'C0121', name: 'Coking Coal', category: 'primary', children: [] },
                    { id: 'C0129', name: 'Other Bituminous Coal', category: 'primary', children: [] }
                ]
            },
            {
                id: 'C0200',
                name: 'Brown Coal',
                category: 'primary',
                children: [
                    { id: 'C0210', name: 'Sub-bituminous Coal', category: 'primary', children: [] },
                    { id: 'C0220', name: 'Lignite', category: 'primary', children: [] }
                ]
            },
            // Coal-derived products
            {
                id: 'C0300',
                name: 'Derived Coal Products',
                category: 'secondary',
                children: [
                    { id: 'C0311', name: 'Coke Oven Coke', category: 'secondary', children: [] },
                    { id: 'C0312', name: 'Gas Coke', category: 'secondary', children: [] },
                    { id: 'C0320', name: 'Patent Fuel', category: 'secondary', children: [] },
                    { id: 'C0330', name: 'Brown Coal Briquettes', category: 'secondary', children: [] },
                    { id: 'C0340', name: 'Coal Tar', category: 'secondary', children: [] }
                ]
            },
            // Manufactured gases (from coal)
            {
                id: 'C0350-0370',
                name: 'Manufactured Gases',
                category: 'secondary',
                children: [
                    { id: 'C0350', name: 'Coke Oven Gas', category: 'secondary', children: [] },
                    { id: 'C0360', name: 'Gas Works Gas', category: 'secondary', children: [] },
                    { id: 'C0371', name: 'Blast Furnace Gas', category: 'secondary', children: [] },
                    { id: 'C0379', name: 'Other Recovered Gases', category: 'secondary', children: [] }
                ]
            }
        ]
    },

    // ============================================
    // PEAT AND PEAT PRODUCTS
    // ============================================
    {
        id: 'P1000',
        name: 'Peat and Peat Products',
        category: 'primary',
        description: 'Peat and peat-derived products',
        children: [
            { id: 'P1100', name: 'Peat', category: 'primary', children: [] },
            { id: 'P1200', name: 'Peat Products', category: 'secondary', children: [] }
        ]
    },

    // ============================================
    // OIL SHALE AND OIL SANDS
    // ============================================
    {
        id: 'S2000',
        name: 'Oil Shale and Oil Sands',
        category: 'primary',
        description: 'Oil shale and oil sands',
        children: []
    },

    // ============================================
    // NATURAL GAS
    // ============================================
    {
        id: 'G3000',
        name: 'Natural Gas',
        category: 'primary',
        description: 'Natural gas including biogas',
        children: []
    },

    // ============================================
    // OIL AND PETROLEUM PRODUCTS
    // ============================================
    {
        id: 'O4000XBIO',
        name: 'Oil and Petroleum Products',
        category: 'primary',
        description: 'Crude oil and all petroleum-derived products',
        children: [
            // Primary oil products
            {
                id: 'O4100_TOT',
                name: 'Crude Oil',
                category: 'primary',
                children: []
            },
            { id: 'O4200', name: 'Natural Gas Liquids (NGL)', category: 'primary', children: [] },
            { id: 'O4300', name: 'Refinery Feedstocks', category: 'primary', children: [] },
            { id: 'O4400X4410', name: 'Additives and Oxygenates', category: 'secondary', children: [] },
            { id: 'O4500', name: 'Other Hydrocarbons', category: 'primary', children: [] },
            // Refinery products
            {
                id: 'O4600',
                name: 'Refinery Products',
                category: 'secondary',
                children: [
                    { id: 'O4610', name: 'Refinery Gas', category: 'secondary', children: [] },
                    { id: 'O4620', name: 'Ethane', category: 'secondary', children: [] },
                    { id: 'O4630', name: 'Liquefied Petroleum Gases (LPG)', category: 'secondary', children: [] },
                    { id: 'O4640', name: 'Naphtha', category: 'secondary', children: [] },
                    // Motor fuels
                    {
                        id: 'O4650',
                        name: 'Gasoline Products',
                        category: 'secondary',
                        children: [
                            { id: 'O4651', name: 'Aviation Gasoline', category: 'secondary', children: [] },
                            { id: 'O4652XR5210B', name: 'Motor Gasoline', category: 'secondary', children: [] },
                            { id: 'O4653', name: 'Gasoline-type Jet Fuel', category: 'secondary', children: [] }
                        ]
                    },
                    // Kerosene and diesel
                    {
                        id: 'O4660',
                        name: 'Kerosene and Middle Distillates',
                        category: 'secondary',
                        children: [
                            { id: 'O4661XR5230B', name: 'Kerosene-type Jet Fuel', category: 'secondary', children: [] },
                            { id: 'O4669', name: 'Other Kerosene', category: 'secondary', children: [] },
                            { id: 'O4671XR5220B', name: 'Gas Oil and Diesel Oil', category: 'secondary', children: [] }
                        ]
                    },
                    { id: 'O4680', name: 'Fuel Oil', category: 'secondary', children: [] },
                    // Other petroleum products
                    {
                        id: 'O4690',
                        name: 'Other Petroleum Products',
                        category: 'secondary',
                        children: [
                            { id: 'O4691', name: 'White Spirit and SBP', category: 'secondary', children: [] },
                            { id: 'O4692', name: 'Lubricants', category: 'secondary', children: [] },
                            { id: 'O4693', name: 'Paraffin Waxes', category: 'secondary', children: [] },
                            { id: 'O4694', name: 'Petroleum Coke', category: 'secondary', children: [] },
                            { id: 'O4695', name: 'Bitumen', category: 'secondary', children: [] },
                            { id: 'O4699', name: 'Other Oil Products n.e.c.', category: 'secondary', children: [] }
                        ]
                    }
                ]
            }
        ]
    },

    // ============================================
    // RENEWABLES AND BIOFUELS
    // ============================================
    {
        id: 'RA000',
        name: 'Renewables and Biofuels',
        category: 'primary',
        description: 'All renewable energy sources including biofuels',
        children: [
            // Primary renewables (non-combustible)
            {
                id: 'RA100',
                name: 'Hydro Power',
                category: 'primary',
                children: []
            },
            {
                id: 'RA200',
                name: 'Geothermal Energy',
                category: 'primary',
                children: []
            },
            {
                id: 'RA300',
                name: 'Wind Energy',
                category: 'primary',
                children: []
            },
            {
                id: 'RA400',
                name: 'Solar Energy',
                category: 'primary',
                children: [
                    { id: 'RA410', name: 'Solar Thermal', category: 'primary', children: [] },
                    { id: 'RA420', name: 'Solar Photovoltaic', category: 'primary', children: [] }
                ]
            },
            {
                id: 'RA500',
                name: 'Tide, Wave and Ocean',
                category: 'primary',
                children: []
            },
            {
                id: 'RA600',
                name: 'Ambient Heat (Heat Pumps)',
                category: 'primary',
                children: []
            },
            // Biofuels (combustible renewables)
            {
                id: 'R5000',
                name: 'Biofuels',
                category: 'primary',
                children: [
                    // Solid biofuels
                    {
                        id: 'R5100',
                        name: 'Solid Biofuels',
                        category: 'primary',
                        children: [
                            { id: 'R5110-5150_W6000RI', name: 'Primary Solid Biofuels', category: 'primary', children: [] },
                            { id: 'R5160', name: 'Charcoal', category: 'secondary', children: [] }
                        ]
                    },
                    // Liquid biofuels
                    {
                        id: 'R5200',
                        name: 'Liquid Biofuels',
                        category: 'secondary',
                        children: [
                            {
                                id: 'R5210',
                                name: 'Biogasoline',
                                category: 'secondary',
                                children: [
                                    { id: 'R5210P', name: 'Pure Biogasoline', category: 'secondary', children: [] },
                                    { id: 'R5210B', name: 'Blended Biogasoline', category: 'secondary', children: [] }
                                ]
                            },
                            {
                                id: 'R5220',
                                name: 'Biodiesels',
                                category: 'secondary',
                                children: [
                                    { id: 'R5220P', name: 'Pure Biodiesels', category: 'secondary', children: [] },
                                    { id: 'R5220B', name: 'Blended Biodiesels', category: 'secondary', children: [] }
                                ]
                            },
                            {
                                id: 'R5230',
                                name: 'Bio Jet Kerosene',
                                category: 'secondary',
                                children: [
                                    { id: 'R5230P', name: 'Pure Bio Jet Kerosene', category: 'secondary', children: [] },
                                    { id: 'R5230B', name: 'Blended Bio Jet Kerosene', category: 'secondary', children: [] }
                                ]
                            },
                            { id: 'R5290', name: 'Other Liquid Biofuels', category: 'secondary', children: [] }
                        ]
                    },
                    // Gaseous biofuels
                    {
                        id: 'R5300',
                        name: 'Biogases',
                        category: 'secondary',
                        children: []
                    }
                ]
            }
        ]
    },

    // ============================================
    // WASTE
    // ============================================
    {
        id: 'W6100_6220',
        name: 'Waste',
        category: 'secondary',
        description: 'Waste used for energy production',
        children: [
            { id: 'W6100', name: 'Industrial Waste', category: 'secondary', children: [] },
            {
                id: 'W6200',
                name: 'Municipal Waste',
                category: 'secondary',
                children: [
                    { id: 'W6210', name: 'Renewable Municipal Waste', category: 'secondary', children: [] },
                    { id: 'W6220', name: 'Non-renewable Municipal Waste', category: 'secondary', children: [] }
                ]
            }
        ]
    },

    // ============================================
    // NUCLEAR
    // ============================================
    {
        id: 'N900H',
        name: 'Nuclear',
        category: 'primary',
        description: 'Nuclear energy',
        children: []
    },

    // ============================================
    // ELECTRICITY (Secondary energy)
    // ============================================
    {
        id: 'E7000',
        name: 'Electricity',
        category: 'secondary',
        description: 'Electricity produced from primary energy sources',
        children: []
    },

    // ============================================
    // HEAT (Secondary energy)
    // ============================================
    {
        id: 'H8000',
        name: 'Heat',
        category: 'secondary',
        description: 'Heat produced from primary energy sources',
        children: []
    }
];

/**
 * Mapping from SIEC codes to fuelMix data keys
 * Used to link detailed SIEC codes to aggregated fuel mix categories
 */
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
};

/**
 * Energy metrics categories for dashboard overview
 * Used to display key energy metrics and indicators
 */
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
];

export { siecCodes, balanceCodes, fuelFamilies, fuelKeyMap, categories };