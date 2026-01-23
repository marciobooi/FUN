import { useState, useEffect, useCallback } from 'react';

export function useUrlPersistence(defaultCountries = [], defaultYear = 2023) {
  // Initialize state from URL if available, otherwise defaults
  const [selectedCountries, setSelectedCountries] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const geo = params.get('geo');
    return geo ? geo.split(',') : defaultCountries;
  });

  const [selectedYear, setSelectedYear] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const time = params.get('year');
    return time ? parseInt(time, 10) : defaultYear;
  });

  // Update URL when state changes
  const updateUrl = useCallback((countries, year) => {
    const params = new URLSearchParams(window.location.search);
    
    if (countries.length > 0) {
      params.set('geo', countries.join(','));
    } else {
      params.delete('geo');
    }

    if (year) {
      params.set('year', year.toString());
    } else {
      params.delete('year');
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, []);

  // Wrapper setters that update both state and URL
  const setCountries = (countries) => {
    setSelectedCountries(countries);
    updateUrl(countries, selectedYear);
  };

  const setYear = (year) => {
    setSelectedYear(year);
    updateUrl(selectedCountries, year);
  };

  // Sync on mount (in case URL was manually changed without reload, though less likely in this simple setup)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const geo = params.get('geo');
    const time = params.get('year');
    
    if (geo && geo !== selectedCountries.join(',')) {
        setSelectedCountries(geo.split(','));
    }
  }, []);

  return {
    selectedCountries,
    setSelectedCountries: setCountries,
    selectedYear,
    setSelectedYear: setYear
  };
}
