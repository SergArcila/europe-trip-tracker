export const findItem = (city, id) => {
  for (const c of Object.values(city.categories)) {
    const i = c.items.find(x => x.id === id);
    if (i) return i;
  }
  return null;
};

export const slotDone = (city, s) =>
  s.ref ? (findItem(city, s.ref)?.done || false) : !!s.done;

export const slotCoords = (city, s) => {
  if (s.lat && s.lng) return s;
  if (s.ref) { const i = findItem(city, s.ref); if (i?.lat) return i; }
  return null;
};

export const cityCounts = (city) => {
  let t = 0, d = 0;
  Object.values(city.categories).forEach(c =>
    c.items.forEach(i => { t++; if (i.done) d++; })
  );
  (city.schedule || []).forEach(dy =>
    dy.slots.forEach(s => { if (!s.ref && s.id) { t++; if (s.done) d++; } })
  );
  return { t, d };
};

export const pct = (d, t) => t > 0 ? Math.round((d / t) * 100) : 0;

export const allCityItems = (city) => {
  const r = [];
  Object.entries(city.categories).forEach(([k, c]) =>
    c.items.forEach(i => { if (i.lat && i.lng) r.push({ ...i, cat: k, catIcon: c.icon }); })
  );
  return r;
};

export const tripProgress = (trip) => {
  let t = 0, d = 0;
  trip.cities.forEach(city => {
    const counts = cityCounts(city);
    t += counts.t;
    d += counts.d;
  });
  return { t, d, pct: pct(d, t) };
};

const toRad = n => n * Math.PI / 180;
export const haversine = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng/2)**2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
};

export const tripDistance = (trip) => {
  let total = 0;
  for (let i = 1; i < trip.cities.length; i++) {
    const prev = trip.cities[i-1], curr = trip.cities[i];
    if (prev.lat && prev.lng && curr.lat && curr.lng)
      total += haversine(prev.lat, prev.lng, curr.lat, curr.lng);
  }
  return total;
};

export const formatDateRange = (start, end) => {
  if (!start || !end) return '';
  const s = new Date(start + 'T00:00:00'), e = new Date(end + 'T00:00:00');
  const mo = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  if (s.getMonth() === e.getMonth())
    return `${mo[s.getMonth()]} ${s.getDate()}–${e.getDate()}`;
  return `${mo[s.getMonth()]} ${s.getDate()} – ${mo[e.getMonth()]} ${e.getDate()}`;
};

export const tripDays = (trip) => {
  if (!trip.startDate || !trip.endDate) return 0;
  const s = new Date(trip.startDate + 'T00:00:00'), e = new Date(trip.endDate + 'T00:00:00');
  return Math.round((e - s) / (1000*60*60*24)) + 1;
};

// Passport aggregation
export const getPassportStats = (trips, year = null) => {
  const filtered = year ? trips.filter(t => t.startDate?.startsWith(year)) : trips;

  const countries = new Set();
  const cityList = [];
  let totalDistance = 0;

  filtered.forEach(trip => {
    trip.cities.forEach(city => {
      const countryName = city.country || city.name;
      countries.add(countryName);
      cityList.push({ name: city.name, country: countryName, flag: city.flag, color: city.color, lat: city.lat, lng: city.lng });
    });
    totalDistance += tripDistance(trip);
  });

  return {
    trips: filtered.length,
    countriesCount: countries.size,
    citiesCount: cityList.length,
    uniqueCities: new Set(cityList.map(c => c.name)).size,
    distance: totalDistance,
    countries: Array.from(countries),
    cities: cityList,
  };
};

export const getAllYears = (trips) => {
  const years = new Set();
  trips.forEach(t => {
    if (t.startDate) years.add(t.startDate.substring(0, 4));
  });
  return Array.from(years).sort((a, b) => b - a);
};
