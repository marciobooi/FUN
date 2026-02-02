import { useState } from 'react'

/**
 * Practical Field Mapping Component
 * 
 * At-a-glance reference guide for Eurostat energy data field meanings,
 * units, and practical interpretation tips. Helps analysts understand
 * what each field represents, where to find it, and how to use it correctly.
 * 
 * Data sources:
 * - ec.europa.eu (European Commission)
 * - fgeerolf.com (Eurostat Field Guide)
 */

const FIELD_MAPPING_GUIDE = [
  {
    category: 'Headline Demand (Energy Balance)',
    icon: '📊',
    color: 'blue',
    mappings: [
      {
        field: 'GIC (Gross Inland Consumption)',
        description: 'Total primary energy consumption. Fundamental measure of a country\'s overall energy demand including losses.',
        unit: 'KTOE',
        siec: 'TOTAL',
        source: 'ec.europa.eu',
        dataItem: 'nrg_bal',
        usage: 'Use for overall energy independence, supply diversity, and macroeconomic trends.'
      },
      {
        field: 'GAE (Gross Available Energy)',
        description: 'Energy available from all sources (production + imports - exports - bunkers).',
        unit: 'KTOE',
        siec: 'TOTAL or fuel-specific',
        source: 'ec.europa.eu',
        dataItem: 'nrg_bal',
        usage: 'Use when analyzing actual energy supplied to national economy.'
      },
      {
        field: 'AFC (Apparent Fuel Consumption)',
        description: 'Adjusted GIC excluding non-energy uses and statistical differences.',
        unit: 'KTOE',
        siec: 'TOTAL or sector',
        source: 'ec.europa.eu',
        dataItem: 'nrg_bal',
        usage: 'Use for sector-level consumption analysis (households, industry, transport).'
      }
    ]
  },
  {
    category: 'Imports & Exports',
    icon: '🚢',
    color: 'orange',
    mappings: [
      {
        field: 'IMP (Imports)',
        description: 'Total energy imported into the country, including feedstock for transformation.',
        unit: 'KTOE',
        siec: 'TOTAL, fuel groups (coal, oil, gas, etc.), or specific products',
        source: 'fgeerolf.com',
        dataItem: 'nrg_bal',
        usage: 'Use for import reliance analysis, security of supply, diversification metrics.'
      },
      {
        field: 'EXP (Exports)',
        description: 'Total energy exported. Often electricity, refined products, or surplus renewable generation.',
        unit: 'KTOE',
        siec: 'TOTAL or fuel-specific',
        source: 'fgeerolf.com',
        dataItem: 'nrg_bal',
        usage: 'Use to calculate net imports (IMP - EXP), export revenues, self-sufficiency.'
      },
      {
        field: 'Net Imports = (IMP - EXP) / GIC',
        description: 'Proportion of energy that must be imported. Key security indicator.',
        unit: 'Percentage (%)',
        siec: 'TOTAL or fuel-specific',
        source: 'Calculated metric',
        dataItem: 'Derived from nrg_bal',
        usage: 'Positive = import dependent | Negative = exporter of surplus energy.'
      }
    ]
  },
  {
    category: 'Production',
    icon: '⚡',
    color: 'green',
    mappings: [
      {
        field: 'PRD (Production)',
        description: 'Primary energy production from domestic resources (mining, extraction, renewable generation).',
        unit: 'KTOE',
        siec: 'TOTAL or fuel-specific (coal, oil, gas, nuclear, renewables, etc.)',
        source: 'fgeerolf.com',
        dataItem: 'nrg_bal',
        usage: 'Use for energy independence analysis, fossil fuel reserves depletion, renewable capacity growth.'
      },
      {
        field: 'Renewable Production',
        description: 'Production from renewable sources (hydro, wind, solar, biomass, geothermal).',
        unit: 'KTOE',
        siec: 'RA000 (renewables aggregate) or individual SIEC codes',
        source: 'fgeerolf.com',
        dataItem: 'nrg_bal',
        usage: 'Use for tracking decarbonization progress, renewable energy targets, climate commitments.'
      }
    ]
  },
  {
    category: 'Power Outputs (Electricity & Heat)',
    icon: '💡',
    color: 'yellow',
    mappings: [
      {
        field: 'E7000 (Electricity Production)',
        description: 'Transformation output - electricity generated from all sources (thermal, nuclear, renewable).',
        unit: 'GWh (Gigawatt-hours)',
        siec: 'E7000',
        source: 'fgeerolf.com',
        dataItem: 'nrg_bal',
        usage: 'Use for electricity generation analysis, grid composition, technology breakdown. Always in GWh.'
      },
      {
        field: 'H8000 (Heat Production)',
        description: 'Transformation output - district heat and other industrial heat produced.',
        unit: 'GWh (Gigawatt-hours)',
        siec: 'H8000',
        source: 'fgeerolf.com',
        dataItem: 'nrg_bal',
        usage: 'Use for district heating analysis, combined heat and power (CHP) assessment.'
      },
      {
        field: 'Technology Breakdown',
        description: 'Electricity by source (coal, gas, nuclear, hydro, wind, solar, biomass, geothermal).',
        unit: 'GWh or KTOE (convert using: 1 KTOE = 11.63 GWh)',
        siec: 'Fuel-specific SIEC codes',
        source: 'fgeerolf.com',
        dataItem: 'nrg_bal with GIC balance flow',
        usage: 'Use for grid diversification, decarbonization tracking, technology cost analysis.'
      }
    ]
  },
  {
    category: 'Transformation & Processing',
    icon: '🔧',
    color: 'purple',
    mappings: [
      {
        field: 'TI_* (Transformation Inputs)',
        description: 'Energy inputs to power plants, refineries, and other conversion facilities.',
        unit: 'KTOE (typically)',
        siec: 'Fuel-specific',
        source: 'fgeerolf.com',
        dataItem: 'nrg_bal',
        usage: 'Use for efficiency analysis, thermal losses, energy conversion chain mapping.'
      },
      {
        field: 'Transformation Efficiency',
        description: 'Ratio of useful output (electricity, heat) to input fuel. Indicates plant efficiency.',
        unit: 'Percentage (%)',
        siec: 'By technology/fuel',
        source: 'Calculated from outputs/inputs',
        dataItem: 'Derived from nrg_bal',
        usage: 'Use for comparing plant efficiency, identifying modernization opportunities, climate impact.'
      }
    ]
  },
  {
    category: 'Sector Consumption (Final Energy)',
    icon: '🏘️',
    color: 'cyan',
    mappings: [
      {
        field: 'AFC_HH (Households)',
        description: 'Energy consumed in residential buildings for heating, cooling, lighting, appliances.',
        unit: 'KTOE',
        siec: 'TOTAL or fuel-specific',
        source: 'ec.europa.eu',
        dataItem: 'nrg_bal (AFC breakdown)',
        usage: 'Use for building efficiency analysis, renewable heating adoption, heating demand seasonality.'
      },
      {
        field: 'AFC_TRN (Transport)',
        description: 'Energy consumed in transport sector (road, rail, aviation, maritime). Mostly oil products.',
        unit: 'KTOE',
        siec: 'O4000 (oil) primarily',
        source: 'ec.europa.eu',
        dataItem: 'nrg_bal (AFC breakdown)',
        usage: 'Use for EV adoption analysis, fossil fuel dependency, decarbonization strategies.'
      },
      {
        field: 'AFC_IND (Industry)',
        description: 'Energy consumed in manufacturing, mining, and processing industries.',
        unit: 'KTOE',
        siec: 'TOTAL or fuel-specific (coal, gas, electricity by industry subsector)',
        source: 'ec.europa.eu',
        dataItem: 'nrg_bal (AFC breakdown)',
        usage: 'Use for industrial competitiveness, energy costs, electrification progress.'
      },
      {
        field: 'AFC_SRV (Services & Other)',
        description: 'Energy consumed in commercial, public, and institutional sectors.',
        unit: 'KTOE',
        siec: 'TOTAL or fuel-specific',
        source: 'ec.europa.eu',
        dataItem: 'nrg_bal (AFC breakdown)',
        usage: 'Use for commercial building efficiency, municipal energy planning.'
      }
    ]
  }
]

const UX_TIPS = [
  {
    title: 'Unit Conventions',
    tips: [
      'Default to KTOE (Kilotonnes of Oil Equivalent) for balance accounting and cross-fuel comparisons.',
      'Use GWh (Gigawatt-hours) exclusively for electricity-specific visualizations and grid analysis.',
      'Convert between units: 1 KTOE = 11.63 GWh for electricity (40.86% thermal efficiency assumed).',
      'Always label the unit clearly on axes and in tooltips to avoid confusion.'
    ]
  },
  {
    title: 'User Guidance',
    tips: [
      'Provide a unit toggle switch on electricity pages so users can view data in both KTOE and GWh.',
      'Show source unit in tooltips: e.g., "Coal: 500 KTOE (source: Eurostat nrg_bal_c)".',
      'Include a "Field Guide" modal or sidebar accessible from dashboard for quick reference.',
      'Color-code balance flows: Red for imports/dependencies, Green for production/exports, Blue for transformation.'
    ]
  },
  {
    title: 'Data Integrity Checks',
    tips: [
      'Verify GIC = PRD + IMP - EXP (or close, accounting for stock changes and statistical differences).',
      'Flag unusual years with missing data, wars, economic crises that disrupt energy patterns.',
      'Check electricity units: if E7000 is in KTOE but seems too small, convert to GWh first.',
      'Validate fuel shares: Σ(fuel share) should equal 100% for a given year and balance flow.'
    ]
  }
]

function ExpandableCategory({ category, isOpen, onToggle }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    orange: 'bg-orange-50 border-orange-200 text-orange-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    cyan: 'bg-cyan-50 border-cyan-200 text-cyan-800'
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className={`w-full p-4 flex items-center justify-between font-semibold transition-colors ${
          colors[category.color]
        } hover:opacity-90`}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{category.icon}</span>
          <span>{category.category}</span>
        </div>
        {isOpen ? (
          <span className="text-lg">▼</span>
        ) : (
          <span className="text-lg">▶</span>
        )}
      </button>

      {isOpen && (
        <div className="bg-white divide-y divide-gray-200">
          {category.mappings.map((mapping, idx) => (
            <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">{mapping.field}</h4>
                  <p className="text-xs text-gray-500 mt-1">{mapping.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-xs">
                <div>
                  <p className="text-gray-500 font-semibold">Unit</p>
                  <p className="text-gray-800 font-mono">{mapping.unit}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold">SIEC</p>
                  <p className="text-gray-800 font-mono">{mapping.siec}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold">Data Item</p>
                  <p className="text-gray-800 font-mono">{mapping.dataItem}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold">Source</p>
                  <p className="text-gray-800">{mapping.source}</p>
                </div>
              </div>

              <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-100">
                <p className="text-xs text-blue-800">
                  <strong>💡 Use:</strong> {mapping.usage}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function PracticalFieldMapping() {
  const [openCategories, setOpenCategories] = useState({})

  const toggleCategory = (idx) => {
    setOpenCategories(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }))
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-indigo-100 rounded-xl">
            <span className="text-2xl">📚</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Practical Field Mapping (At-a-Glance)</h2>
            <p className="text-gray-600 text-sm">Reference guide for understanding Eurostat energy data fields, units, and practical usage</p>
          </div>
        </div>

        {/* Field Mapping Categories */}
        <div className="space-y-4 mb-10">
          {FIELD_MAPPING_GUIDE.map((category, idx) => (
            <ExpandableCategory
              key={idx}
              category={category}
              isOpen={openCategories[idx] || false}
              onToggle={() => toggleCategory(idx)}
            />
          ))}
        </div>

        {/* UX Tips Section */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200 mb-6">
          <h3 className="text-xl font-semibold text-indigo-900 mb-4 flex items-center gap-2">
            <span>✨</span> User Experience & Data Best Practices
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {UX_TIPS.map((section, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 border border-indigo-100">
                <h4 className="font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.tips.map((tip, tipIdx) => (
                    <li key={tipIdx} className="text-xs text-gray-700 flex gap-2">
                      <span className="text-indigo-500 flex-shrink-0">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Data Sources */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-2">📋 Sources</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-gray-700">European Commission</p>
              <p className="text-gray-600 text-xs">ec.europa.eu - Official energy policy and statistics</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Eurostat Field Guide</p>
              <p className="text-gray-600 text-xs">fgeerolf.com - Community-curated Eurostat documentation</p>
            </div>
          </div>
        </div>

        {/* Quick Reference */}
        <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-3">🎯 Quick Reference: Common Conversions</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-blue-700 font-semibold">KTOE to GWh</p>
              <p className="text-blue-900 font-mono">× 11.63</p>
            </div>
            <div>
              <p className="text-blue-700 font-semibold">GWh to KTOE</p>
              <p className="text-blue-900 font-mono">÷ 11.63</p>
            </div>
            <div>
              <p className="text-blue-700 font-semibold">Efficiency Check</p>
              <p className="text-blue-900 font-mono">Output / Input</p>
            </div>
            <div>
              <p className="text-blue-700 font-semibold">Import Reliance</p>
              <p className="text-blue-900 font-mono">(IMP - EXP) / GIC</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
