import { fetchDatasetMetadata } from '../services/eurostat'

let cachedYears = null
let yearsPromise = null

/**
 * Get all available years from the Eurostat dataset
 * Results are cached to avoid multiple API calls
 * @returns {Promise<number[]>} Array of available years in descending order
 */
export const getAvailableYears = async () => {
  // Return cached years if already fetched
  if (cachedYears !== null) {
    return cachedYears
  }

  // If a fetch is already in progress, wait for it
  if (yearsPromise) {
    return yearsPromise
  }

  // Fetch years and cache them
  yearsPromise = fetchDatasetMetadata()
    .then(metadata => {
      cachedYears = metadata.years
      yearsPromise = null
      return cachedYears
    })
    .catch(error => {
      console.error('Failed to fetch available years:', error)
      // Fallback to a reasonable range
      cachedYears = [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2010, 2005, 2000, 1995, 1990]
      yearsPromise = null
      return cachedYears
    })

  return yearsPromise
}

/**
 * Clear the cached years (useful for testing or if data changes)
 */
export const clearYearsCache = () => {
  cachedYears = null
  yearsPromise = null
}
