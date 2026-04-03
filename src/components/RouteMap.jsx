import { useState, useRef, useEffect, useCallback } from 'react';
import { ComposableMap, Geographies, Geography, Marker, Graticule, Sphere } from 'react-simple-maps';
import { cityCounts, formatDateRange } from '../utils/tripHelpers';
import { f } from '../utils/constants';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// ISO 3166-1 numeric → country name lookup (covers common trip destinations)
const ISO_TO_COUNTRY = {
  724: 'Spain', 250: 'France', 276: 'Germany', 528: 'Netherlands',
  380: 'Italy', 620: 'Portugal', 826: 'United Kingdom', 56: 'Belgium',
  40: 'Austria', 756: 'Switzerland', 300: 'Greece', 203: 'Czech Republic',
  616: 'Poland', 348: 'Hungary', 208: 'Denmark', 752: 'Sweden',
  578: 'Norway', 246: 'Finland', 372: 'Ireland', 191: 'Croatia',
  642: 'Romania', 100: 'Bulgaria', 703: 'Slovakia', 705: 'Slovenia',
  233: 'Estonia', 428: 'Latvia', 440: 'Lithuania', 442: 'Luxembourg',
  352: 'Iceland', 8: 'Albania', 688: 'Serbia', 499: 'Montenegro',
  807: 'North Macedonia', 840: 'United States', 124: 'Canada', 484: 'Mexico',
  76: 'Brazil', 32: 'Argentina', 152: 'Chile', 170: 'Colombia', 604: 'Peru',
  392: 'Japan', 156: 'China', 410: 'South Korea', 356: 'India',
  36: 'Australia', 554: 'New Zealand', 764: 'Thailand', 704: 'Vietnam',
  360: 'Indonesia', 458: 'Malaysia', 702: 'Singapore', 608: 'Philippines',
  792: 'Turkey', 376: 'Israel', 818: 'Egypt', 504: 'Morocco',
  710: 'South Africa', 404: 'Kenya', 834: 'Tanzania', 218: 'Ecuador',
};

function computeScale(cities) {
  if (cities.length < 2) return 360;
  const lats = cities.map(c => c.lat);
  const lngs = cities.map(c => c.lng);
  const span = Math.max(
    Math.max(...lats) - Math.min(...lats),
    Math.max(...lngs) - Math.min(...lngs)
  );
  if (span < 5)  return 620;
  if (span < 15) return 440;
  if (span < 35) return 330;
  if (span < 60) return 255;
  return 185;
}

function getCountryFill(isoId, countryData) {
  const name = ISO_TO_COUNTRY[isoId];
  if (!name) return '#1e3252';
  const data = countryData[name];
  if (!data) return '#1e3252';
  const { pct } = data;
  if (pct === 0)   return '#27405f'; // in itinerary, not started
  if (pct < 0.5)   return '#1e5282'; // some progress — warm blue
  if (pct < 1)     return '#1a6aaa'; // good progress — brighter
  return '#0f84d4';                  // complete — fully lit
}

export default function RouteMap({ trip }) {
  const cities = trip.cities.filter(c => c.lat && c.lng);
  const [hovered, setHovered] = useState(null);

  // Compute per-country progress from city checklist data
  const countryData = {};
  for (const city of trip.cities) {
    if (!city.country) continue;
    const { t, d } = cityCounts(city);
    const pct = t > 0 ? d / t : 0;
    if (!countryData[city.country]) {
      countryData[city.country] = { t, d, pct };
    } else {
      // merge: combine totals so multi-city countries show combined progress
      const existing = countryData[city.country];
      const newT = existing.t + t;
      const newD = existing.d + d;
      countryData[city.country] = { t: newT, d: newD, pct: newT > 0 ? newD / newT : 0 };
    }
  }

  const avgLat = cities.length > 0 ? cities.reduce((s, c) => s + c.lat, 0) / cities.length : 48;
  const avgLng = cities.length > 0 ? cities.reduce((s, c) => s + c.lng, 0) / cities.length : 10;
  const baseScale = computeScale(cities);

  const [rotation, setRotation] = useState([-avgLng, -avgLat, 0]);
  const [scale, setScale] = useState(baseScale);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, rotation: [-avgLng, -avgLat, 0] });
  const mapRef = useRef(null);

  // Wheel zoom (non-passive so we can preventDefault)
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

  // Touch support
  const touchStart = useRef({ x: 0, y: 0, dist: 0, rotation: [-avgLng, -avgLat, 0], scale: baseScale });

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
      const factor = dist / touchStart.current.dist;
      setScale(Math.max(120, Math.min(1200, touchStart.current.scale * factor)));
    }
  }, [scale]);

  if (cities.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13, fontFamily: f }}>
        Add coordinates to cities to see the globe
      </div>
    );
  }

  return (
    <div>
      {/* Globe */}
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
          background: '#060d1a',
          borderRadius: 18,
          overflow: 'hidden',
          border: '1px solid #1a2744',
          position: 'relative',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        <ComposableMap
          projection="geoOrthographic"
          projectionConfig={{ rotate: rotation, scale }}
          style={{ width: '100%', height: 360 }}
        >
          <defs>
            <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="countryGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="atm" cx="50%" cy="50%" r="50%">
              <stop offset="85%" stopColor="#0d1f3c" stopOpacity="0" />
              <stop offset="100%" stopColor="#2563a8" stopOpacity="0.45" />
            </radialGradient>
          </defs>

          <Sphere fill="#0b1929" stroke="#1a2a48" strokeWidth={0.5} />
          <Sphere fill="url(#atm)" stroke="none" />
          <Graticule stroke="#11213a" strokeWidth={0.35} />

          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map(geo => {
                const fill = getCountryFill(geo.id, countryData);
                const isLit = fill !== '#1e3252';
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke={isLit ? '#2a5080' : '#1e3050'}
                    strokeWidth={isLit ? 0.6 : 0.35}
                    filter={isLit ? 'url(#countryGlow)' : undefined}
                    style={{ default: { outline: 'none' }, hover: { outline: 'none' }, pressed: { outline: 'none' } }}
                  />
                );
              })
            }
          </Geographies>

          {cities.map(city => (
            <Marker
              key={city.id}
              coordinates={[city.lng, city.lat]}
              onMouseEnter={() => setHovered(city.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <circle r={hovered === city.id ? 16 : 11} fill={city.color + '1a'} style={{ transition: 'r .2s' }} />
              <circle r={hovered === city.id ? 9 : 6} fill={city.color + '55'} style={{ transition: 'r .2s' }} />
              <circle r={hovered === city.id ? 5.5 : 3.5} fill={city.color} filter="url(#glow)" style={{ transition: 'r .2s' }} />
              {hovered === city.id && (
                <text y={-18} textAnchor="middle" style={{ fontSize: 11, fontFamily: '-apple-system, system-ui, sans-serif', fontWeight: 700, fill: '#fff', pointerEvents: 'none', letterSpacing: '0.02em' }}>
                  {city.name}
                </text>
              )}
            </Marker>
          ))}
        </ComposableMap>

        {/* Flag pill */}
        <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)', borderRadius: 9, padding: '5px 10px', display: 'flex', gap: 5, alignItems: 'center' }}>
          {[...new Map(cities.map(c => [c.country || c.name, c.flag || '📍'])).entries()].map(([country, flag]) => (
            <span key={country} title={country} style={{ fontSize: 15 }}>{flag}</span>
          ))}
        </div>

        {/* Zoom hint */}
        <div style={{ position: 'absolute', bottom: 10, right: 12, fontSize: 9.5, color: 'rgba(255,255,255,0.25)', fontFamily: f, letterSpacing: '0.04em', pointerEvents: 'none' }}>
          drag to rotate · scroll to zoom
        </div>

        {/* Bottom fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, background: 'linear-gradient(to top, #060d1a, transparent)', pointerEvents: 'none' }} />
      </div>

      {/* City list with dates */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 10 }}>
        {trip.cities.map(city => {
          const { t, d } = cityCounts(city);
          const pct = t > 0 ? Math.round((d / t) * 100) : 0;
          const dateStr = formatDateRange(city.startDate, city.endDate);
          const isActive = hovered === city.id;
          return (
            <div
              key={city.id}
              onMouseEnter={() => setHovered(city.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 13px',
                background: isActive ? `${city.color}12` : 'var(--bg-card)',
                borderRadius: 11,
                border: `1px solid ${isActive ? city.color + '40' : 'var(--border)'}`,
                transition: 'all .15s',
                cursor: 'default',
              }}
            >
              {/* Color dot with glow for visited */}
              <div style={{
                width: 9, height: 9, borderRadius: 5,
                background: city.color, flexShrink: 0,
                boxShadow: d > 0 ? `0 0 7px ${city.color}` : 'none',
                opacity: d > 0 ? 1 : 0.5,
              }} />
              <span style={{ fontSize: 16, flexShrink: 0 }}>{city.flag || '📍'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: f }}>{city.name}</div>
                {dateStr && <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: f, marginTop: 1 }}>{dateStr}</div>}
              </div>
              {t > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <div style={{ width: 40, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: city.color, borderRadius: 2, boxShadow: pct > 0 ? `0 0 4px ${city.color}` : 'none' }} />
                  </div>
                  <span style={{ fontSize: 11, color: pct > 0 ? city.color : 'var(--text-secondary)', fontFamily: f, fontWeight: 600, minWidth: 26, textAlign: 'right' }}>{pct}%</span>
                </div>
              )}
              <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: f, flexShrink: 0 }}>{city.country}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
