import { useState, useEffect } from 'react'
import { fetchEnergyData, fetchDatasetMetadata, fetchFuelMixData, fetchSectorData } from '../services/eurostat'

export function useEurostatData(countries, year) {
  const [data, setData] = useState({})
  const [fuelMix, setFuelMix] = useState({})
  const [sectors, setSectors] = useState({})
  const [years, setYears] = useState([])
  const [availableCountries, setAvailableCountries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch metadata on mount
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const meta = await fetchDatasetMetadata()
        setYears(meta.years)
        setAvailableCountries(meta.countries)
      } catch (err) {
        console.error('Failed to fetch metadata', err)
        setYears([2023, 2022, 2021, 2020, 2019])
      }
    }
    loadMetadata()
  }, [])

  // Fetch data when countries or year changes
  useEffect(() => {
    const loadData = async () => {
      if (!countries || countries.length === 0) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch all data types in parallel
        const [basicData, fuelData, sectorData] = await Promise.all([
          fetchEnergyData(countries, year),
          fetchFuelMixData(countries, year),
          fetchSectorData(countries, year)
        ])
        
        setData(basicData)
        setFuelMix(fuelData)
        setSectors(sectorData)
        
      } catch (err) {
        console.error('Error fetching Eurostat data:', err)
        setError('Failed to load energy data. Eurostat API might be unavailable.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [countries, year])

  return { data, fuelMix, sectors, years, availableCountries, isLoading, error }
}
