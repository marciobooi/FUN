import React from 'react'
import { fuelFamilies } from '../../data/siecCodes'

export function FuelFamilySelector({ selectedFamily, setSelectedFamily }) {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <button
        onClick={() => setSelectedFamily(null)}
        className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
          selectedFamily === null
            ? 'bg-blue-600 text-white shadow-lg'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:shadow-md'
        }`}
      >
        All Metrics
      </button>
      {fuelFamilies.map(family => (
        <button
          key={family.id}
          onClick={() => setSelectedFamily(family)}
          className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
            selectedFamily?.id === family.id
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:shadow-md'
          }`}
        >
          {family.name}
        </button>
      ))}
    </div>
  )
}