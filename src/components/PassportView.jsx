import { useState, useRef, useEffect, useCallback } from 'react';
import { ComposableMap, Geographies, Geography, Marker, Graticule, Sphere } from 'react-simple-maps';
import { getPassportStats, getAllYears, buildCountryStatus } from '../utils/tripHelpers';
import { ALL_COUNTRIES, TOTAL_COUNTRIES, COUNTRY_NUMERIC_CODES } from '../utils/countries';
import { f, pf } from '../utils/constants';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';



function GlobeMap({ cities, countryStatus, profileVisitedCodes, homeCode }) {
  const codeStatus = {};
  for (const [name, s] of Object.entries(countryStatus)) {
    const code = COUNTRY_NUMERIC_CODES[name];
    if (code) codeStatus[code] = s;
  }
  // Also mark profile countries (manually added) as 'past' if not already in trips
  for (const code of (profileVisitedCodes || [])) {
    if (!codeStatus[code]) codeStatus[code] = 'past';
  }
  // Home country always green
  if (homeCode) codeStatus[homeCode] = 'home';
  const markers = cities.filter(c => c.lat && c.lng);

  const [rotation, setRotation] = useState([0, -20, 0]);
  const [scale, setScale] = useState(185);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, rotation: [0, -20, 0] });
  const mapRef = useRef(null);
  const touchStart = useRef({ x: 0, y: 0, dist: 0, rotation: [0, -20, 0], scale: 185 });

  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      setScale(s => Math.max(120, Math.min(1200, s - e.deltaY * 0.7)));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const onMouseDown = useCallback((e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, rotation: [...rotation] };
  }, [rotation]);

  const onMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const sens = 180 / scale;
    const [lon, lat, roll] = dragStart.current.rotation;
    setRotation([
      lon - dx * sens,
      Math.max(-90, Math.min(90, lat + dy * sens)),
      roll,
    ]);
  }, [isDragging, scale]);

  const onMouseUp = useCallback(() => setIsDragging(false), []);

  const onTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, dist: 0, rotation: [...rotation], scale };
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStart.current = { ...touchStart.current, dist: Math.hypot(dx, dy), scale };
    }
  }, [rotation, scale]);

  const onTouchMove = useCallback((e) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - touchStart.current.x;
      const dy = e.touches[0].clientY - touchStart.current.y;
      const sens = 180 / scale;
      const [lon, lat, roll] = touchStart.current.rotation;
      setRotation([
        lon - dx * sens,
        Math.max(-90, Math.min(90, lat + dy * sens)),
        roll,
      ]);
    } else if (e.touches.length === 2 && touchStart.current.dist > 0) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      setScale(Math.max(120, Math.min(1200, touchStart.current.scale * (dist / touchStart.current.dist))));
    }
  }, [scale]);

  return (
    <div
      ref={mapRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onMouseUp}
      style={{
        background: '#010812',
        borderRadius: 14,
        overflow: 'hidden',
        border: '1px solid #0d1f38',
        position: 'relative',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none',
      }}
    >
      <ComposableMap
        projection="geoOrthographic"
        projectionConfig={{ rotate: rotation, scale }}
        style={{ width: '100%', height: 320 }}
      >
        <defs>
          <filter id="pglow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="pEarthGrad" cx="40%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#0a1a2e" />
            <stop offset="55%" stopColor="#050e1c" />
            <stop offset="100%" stopColor="#010812" />
          </radialGradient>
          <radialGradient id="patm" cx="50%" cy="50%" r="50%">
            <stop offset="80%" stopColor="transparent" stopOpacity="0" />
            <stop offset="93%" stopColor="#3a7fd4" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#5aa0ff" stopOpacity="0.1" />
          </radialGradient>
        </defs>

        <Sphere fill="url(#pEarthGrad)" stroke="#0d1f38" strokeWidth={0.4} />
        <Sphere fill="url(#patm)" stroke="none" />
        <Graticule stroke="#081528" strokeWidth={0.3} />

        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map(geo => {
              const s = codeStatus[String(geo.id)];
              // home = green, past = bright blue, upcoming = muted blue, none = near-black land
              const fill = s === 'home' ? '#22c55e' : s === 'past' ? '#1e6db5' : s === 'upcoming' ? '#1a4a7a' : '#0a1828';
              const stroke = s === 'home' ? '#2ed573' : s === 'past' ? '#2880cc' : s === 'upcoming' ? '#1a4070' : '#081420';
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={s ? 0.6 : 0.3}
                  style={{ default: { outline: 'none' }, hover: { outline: 'none' }, pressed: { outline: 'none' } }}
                />
              );
            })
          }
        </Geographies>

        {markers.map((city, i) => (
          <Marker key={i} coordinates={[city.lng, city.lat]}>
            <circle r={10} fill={(city.color || '#E63946') + '1a'} />
            <circle r={5.5} fill={(city.color || '#E63946') + '55'} />
            <circle r={3.5} fill={city.color || '#E63946'} filter="url(#pglow)" />
          </Marker>
        ))}
      </ComposableMap>

      <div style={{ position: 'absolute', bottom: 10, right: 12, fontSize: 9.5, color: 'rgba(255,255,255,0.25)', fontFamily: f, letterSpacing: '0.04em', pointerEvents: 'none' }}>
        drag to rotate · scroll to zoom
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(to top, #010812, transparent)', pointerEvents: 'none' }} />
    </div>
  );
}

export default function PassportView({ trips, profile }) {
  const years = ['ALL-TIME', ...getAllYears(trips)];
  const [selectedYear, setSelectedYear] = useState('ALL-TIME');

  const year = selectedYear === 'ALL-TIME' ? null : selectedYear;
  const stats = getPassportStats(trips, year);
  const countryStatus = buildCountryStatus(trips, year);

  // Home country numeric code (for green highlight) — only in ALL-TIME view
  const homeCode = !year && profile?.home_country ? COUNTRY_NUMERIC_CODES[profile.home_country] : null;

  // Profile-added countries (manually visited, NOT home since it gets its own color) shown in ALL-TIME view
  const profileVisitedCodes = !year ? [
    ...(profile?.countries_visited || []).map(n => COUNTRY_NUMERIC_CODES[n]).filter(Boolean),
  ] : [];

  // Merge trip countries with manually-added profile countries
  const countryMap = {};
  trips
    .filter(t => !year || t.startDate?.startsWith(year))
    .forEach(trip => {
      trip.cities.forEach(city => {
        const key = city.country || city.name;
        if (!countryMap[key]) countryMap[key] = city.flag;
      });
    });

  // Profile countries (only shown in ALL-TIME, or if no year filter)
  const profileHomeCountry = !year && profile?.home_country ? profile.home_country : null;
  const profileVisited = (!year && profile?.countries_visited) ? profile.countries_visited : [];

  if (profileHomeCountry && !countryMap[profileHomeCountry]) {
    const found = ALL_COUNTRIES.find(c => c.name === profileHomeCountry);
    countryMap[profileHomeCountry] = found?.flag || '🏳️';
  }
  profileVisited.forEach(name => {
    if (!countryMap[name]) {
      const found = ALL_COUNTRIES.find(c => c.name === name);
      countryMap[name] = found?.flag || '🏳️';
    }
  });

  // Profile-sourced countries are always 'past' (already visited)
  const profilePastNames = new Set([
    ...(profileHomeCountry ? [profileHomeCountry] : []),
    ...profileVisited,
  ]);

  const countries = Object.entries(countryMap).map(([name, flag]) => ({
    name,
    flag,
    // Profile countries are always past; trip countries use date-aware status
    status: profilePastNames.has(name) ? 'past' : (countryStatus[name] || 'upcoming'),
  }));

  // Sort: past first, then upcoming
  countries.sort((a, b) => {
    if (a.status === b.status) return a.name.localeCompare(b.name);
    return a.status === 'past' ? -1 : 1;
  });

  // World % only counts actually visited (past) countries
  const pastNames = new Set([
    ...countries.filter(c => c.status === 'past').map(c => c.name),
  ]);
  const worldTotal = pastNames.size;
  const worldPct = Math.round((worldTotal / TOTAL_COUNTRIES) * 100);

  return (
    <div style={{ marginTop: 40, marginBottom: 20 }}>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: pf, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            ✈️ Passport
          </h2>
          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontFamily: f, margin: 0 }}>
            Your travel history across the world
          </p>
        </div>
        {worldTotal > 0 && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: pf, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>{worldPct}%</div>
            <div style={{ fontSize: 10.5, color: 'var(--text-secondary)', fontFamily: f, marginTop: 1 }}>{worldTotal} / {TOTAL_COUNTRIES} countries</div>
          </div>
        )}
      </div>

      {/* World progress bar */}
      {worldTotal > 0 && (
        <div style={{ marginBottom: 16, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${worldPct}%`, height: '100%', background: 'linear-gradient(90deg, #1a6aaa, #2e86de)', borderRadius: 2 }} />
        </div>
      )}

      {/* Year tabs */}
      <div style={{ display: 'flex', gap: 6, overflow: 'auto', marginBottom: 16, paddingBottom: 4 }}>
        {years.map(yr => (
          <button
            key={yr}
            onClick={() => setSelectedYear(yr)}
            style={{
              padding: '7px 14px', borderRadius: 20, border: 'none',
              background: selectedYear === yr ? 'var(--text-primary)' : 'var(--bg-card)',
              color: selectedYear === yr ? 'var(--bg)' : 'var(--text-secondary)',
              fontSize: 12.5, fontWeight: 600, fontFamily: f,
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .15s',
            }}
          >
            {yr}
          </button>
        ))}
      </div>

      {/* Globe */}
      <div style={{ marginBottom: 16 }}>
        <GlobeMap
          cities={[
            ...stats.cities,
            // Profile home city (green marker)
            ...((!year && profile?.home_city?.lat) ? [{ ...profile.home_city, color: '#22c55e' }] : []),
            // Profile manually-added cities (blue marker)
            ...(!year ? (profile?.profile_cities || []).filter(c => c.lat && c.lng).map(c => ({ ...c, color: '#4fc3f7' })) : []),
          ]}
          countryStatus={countryStatus}
          profileVisitedCodes={profileVisitedCodes}
          homeCode={homeCode}
        />
      </div>

      {/* Stats Grid — use merged counts so profile countries/cities are included */}
      {(() => {
        const allCityNames = new Set([
          ...stats.cities.map(c => c.name),
          ...(!year && profile?.home_city ? [profile.home_city.name] : []),
          ...(!year ? (profile?.profile_cities || []).map(c => c.name) : []),
        ]);
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {[
              { icon: '🌍', label: 'Countries', value: worldTotal },
              { icon: '🏙️', label: 'Cities', value: allCityNames.size },
              { icon: '📍', label: 'Distance', value: stats.distance > 0 ? `${stats.distance.toLocaleString()} km` : '—' },
              { icon: '✈️', label: 'Trips', value: stats.trips },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg-card)', borderRadius: 11, padding: '12px 14px', border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: f, color: 'var(--text-primary)' }}>{s.value}</div>
                <div style={{ fontSize: 10.5, color: 'var(--text-secondary)', fontFamily: f, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Countries */}
      {countries.length > 0 && (
        <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: '14px 16px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, fontFamily: f, color: 'var(--text-primary)' }}>
              Countries
            </div>
            {countries.some(c => c.status === 'upcoming') && (
              <div style={{ fontSize: 10.5, color: 'var(--text-secondary)', fontFamily: f }}>
                🔒 = upcoming
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {countries.map((c, i) => {
              const visited = c.status === 'past';
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '6px 10px',
                  background: visited ? 'rgba(255,255,255,0.07)' : 'transparent',
                  border: visited ? '1px solid rgba(255,255,255,0.13)' : '1px dashed rgba(255,255,255,0.15)',
                  borderRadius: 8,
                  fontSize: 11.5, fontFamily: f,
                  color: visited ? 'var(--text-primary)' : 'var(--text-secondary)',
                  opacity: visited ? 1 : 0.4,
                  transition: 'all .2s',
                }}>
                  <span style={{ fontSize: 14, filter: visited ? 'none' : 'grayscale(1)' }}>{c.flag}</span>
                  <span>{c.name}</span>
                  {!visited && <span style={{ fontSize: 10, marginLeft: 1 }}>🔒</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {stats.trips === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)', fontSize: 13, fontFamily: f }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🌎</div>
          <div style={{ fontWeight: 500 }}>Start planning trips to build your passport</div>
        </div>
      )}
    </div>
  );
}
