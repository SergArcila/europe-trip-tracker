const KEY = 'trips-v4';

// Always sync name, dates and city dates from the canonical defaults.
// User data (checklist progress, custom items, bookings) is preserved.
function applyDefaultPatches(stored, defaultTrips) {
  return stored.map(trip => {
    const def = defaultTrips.find(d => d.id === trip.id);
    if (!def) return trip;
    return {
      ...trip,
      name: def.name,
      coverEmoji: def.coverEmoji,
      startDate: def.startDate,
      endDate: def.endDate,
      archived: trip.archived ?? def.archived ?? false,
      cities: trip.cities.map(city => {
        const defCity = def.cities.find(c => c.id === city.id);
        if (!defCity) return city;
        return { ...city, startDate: defCity.startDate, endDate: defCity.endDate };
      }),
    };
  });
}

function autoArchive(trips) {
  const today = new Date().toISOString().slice(0, 10);
  return trips.map(t =>
    !t.archived && t.endDate && t.endDate < today ? { ...t, archived: true } : t
  );
}

export function loadTrips(defaultTrips) {
  try {
    const s = localStorage.getItem(KEY);
    if (s) {
      const stored = JSON.parse(s);
      const patched = applyDefaultPatches(stored, defaultTrips);
      // Add any default trips not yet in storage
      const storedIds = new Set(patched.map(t => t.id));
      const missing = defaultTrips.filter(t => !storedIds.has(t.id));
      const all = missing.length > 0 ? [...patched, ...missing] : patched;
      return autoArchive(all);
    }
    return autoArchive(defaultTrips);
  } catch {
    return autoArchive(defaultTrips);
  }
}

export function saveTrips(trips) {
  try {
    localStorage.setItem(KEY, JSON.stringify(trips));
  } catch {}
}
