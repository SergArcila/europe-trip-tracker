import { createContext, useContext, useState, useCallback } from 'react';
import { getTrips, getTripById, getCityDetail } from '../lib/api';

const CACHE_KEY = 'tt_data_v1';

function hydrateCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return { tripList: null, tripsById: {}, citiesById: {} };
    return JSON.parse(raw);
  } catch {
    return { tripList: null, tripsById: {}, citiesById: {} };
  }
}

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [cache, setCache] = useState(hydrateCache);

  const update = useCallback((updater) => {
    setCache(prev => {
      const next = updater(prev);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  // Eagerly load everything for a user right after login.
  // Runs in the background — pages already show cached data instantly.
  const prefetchAll = useCallback(async (userId) => {
    try {
      // Step 1: trip list
      const trips = await getTrips(userId);
      update(c => ({ ...c, tripList: trips }));

      // Step 2: full trip data (bookings, transport, city stubs) — all trips in parallel
      const tripDetails = await Promise.all(trips.map(t => getTripById(t.id)));
      const tripsById = {};
      tripDetails.forEach(t => { tripsById[t.id] = t; });
      update(c => ({ ...c, tripsById: { ...c.tripsById, ...tripsById } }));

      // Step 3: collect every unique city ID across all trips
      const cityIds = [...new Set(tripDetails.flatMap(t => (t.cities || []).map(c => c.id)))];

      // Step 4: load city details in batches of 5 to avoid flooding the connection pool
      const BATCH = 5;
      const citiesById = {};
      for (let i = 0; i < cityIds.length; i += BATCH) {
        const batch = cityIds.slice(i, i + BATCH);
        const results = await Promise.all(batch.map(id => getCityDetail(id)));
        results.forEach(c => { citiesById[c.id] = c; });
        // Write each batch to cache as it arrives so pages can already use partial results
        update(c => ({ ...c, citiesById: { ...c.citiesById, ...citiesById } }));
      }
    } catch (e) {
      // Non-fatal — pages will fall back to on-demand loading
      console.error('Prefetch failed:', e);
    }
  }, [update]);

  const loadTrips = useCallback(async (userId) => {
    const data = await getTrips(userId);
    update(c => ({ ...c, tripList: data }));
    return data;
  }, [update]);

  const loadTrip = useCallback(async (tripId) => {
    const data = await getTripById(tripId);
    update(c => ({ ...c, tripsById: { ...c.tripsById, [tripId]: data } }));
    return data;
  }, [update]);

  const loadCity = useCallback(async (cityId) => {
    const data = await getCityDetail(cityId);
    update(c => ({ ...c, citiesById: { ...c.citiesById, [cityId]: data } }));
    return data;
  }, [update]);

  const persistTrip = useCallback((trip) => {
    update(c => ({
      ...c,
      tripsById: { ...c.tripsById, [trip.id]: trip },
      tripList: c.tripList
        ? c.tripList.map(t => t.id === trip.id ? { ...t, ...trip } : t)
        : c.tripList,
    }));
  }, [update]);

  const persistCity = useCallback((city) => {
    update(c => ({
      ...c,
      citiesById: { ...c.citiesById, [city.id]: city },
    }));
  }, [update]);

  const patchTripEntry = useCallback((tripId, fields) => {
    update(c => ({
      ...c,
      tripsById: c.tripsById[tripId]
        ? { ...c.tripsById, [tripId]: { ...c.tripsById[tripId], ...fields } }
        : c.tripsById,
      tripList: c.tripList
        ? c.tripList.map(t => t.id === tripId ? { ...t, ...fields } : t)
        : c.tripList,
    }));
  }, [update]);

  const removeTripEntry = useCallback((tripId) => {
    update(c => {
      const { [tripId]: _removed, ...restTrips } = c.tripsById;
      return {
        ...c,
        tripList: c.tripList ? c.tripList.filter(t => t.id !== tripId) : c.tripList,
        tripsById: restTrips,
      };
    });
  }, [update]);

  const invalidateTripList = useCallback(() => {
    update(c => ({ ...c, tripList: null }));
  }, [update]);

  const clearCache = useCallback(() => {
    try { localStorage.removeItem(CACHE_KEY); } catch {}
    setCache({ tripList: null, tripsById: {}, citiesById: {} });
  }, []);

  return (
    <DataContext.Provider value={{
      tripList: cache.tripList,
      getTrip: (id) => cache.tripsById[id] ?? null,
      getCity: (id) => cache.citiesById[id] ?? null,
      prefetchAll,
      loadTrips,
      loadTrip,
      loadCity,
      persistTrip,
      persistCity,
      patchTripEntry,
      removeTripEntry,
      invalidateTripList,
      clearCache,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
