import { useState, useRef, useEffect, useCallback } from 'react';
import { ComposableMap, Geographies, Geography, Marker, Graticule, Sphere } from 'react-simple-maps';
import { getPassportStats, getAllYears } from '../utils/tripHelpers';
import { f, pf } from '../utils/constants';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const COUNTRY_CODES = {
  'Afghanistan':'4','Albania':'8','Algeria':'12','Argentina':'32','Australia':'36',
  'Austria':'40','Azerbaijan':'31','Bahrain':'48','Bangladesh':'50','Belarus':'112',
  'Belgium':'56','Bolivia':'68','Bosnia and Herzegovina':'70','Brazil':'76',
  'Bulgaria':'100','Cambodia':'116','Cameroon':'120','Canada':'124','Chile':'152',
  'China':'156','Colombia':'170','Costa Rica':'188','Croatia':'191','Cuba':'192',
  'Czech Republic':'203','Denmark':'208','Dominican Republic':'214','Ecuador':'218',
  'Egypt':'818','El Salvador':'222','Estonia':'233','Ethiopia':'231','Finland':'246',
  'France':'250','Georgia':'268','Germany':'276','Ghana':'288','Greece':'300',
  'Guatemala':'320','Honduras':'340','Hungary':'348','Iceland':'352','India':'356',
  'Indonesia':'360','Iran':'364','Iraq':'368','Ireland':'372','Israel':'376',
  'Italy':'380','Jamaica':'388','Japan':'392','Jordan':'400','Kazakhstan':'398',
  'Kenya':'404','Kosovo':'383','Kuwait':'414','Kyrgyzstan':'417','Laos':'418',
  'Latvia':'428','Lebanon':'422','Libya':'434','Lithuania':'440','Luxembourg':'442',
  'Malaysia':'458','Mexico':'484','Monaco':'492','Mongolia':'496','Montenegro':'499',
  'Morocco':'504','Mozambique':'508','Myanmar':'104','Nepal':'524','Netherlands':'528',
  'New Zealand':'554','Nicaragua':'558','Nigeria':'566','North Korea':'408',
  'North Macedonia':'807','Norway':'578','Oman':'512','Pakistan':'586','Panama':'591',
  'Paraguay':'600','Peru':'604','Philippines':'608','Poland':'616','Portugal':'620',
  'Qatar':'634','Romania':'642','Russia':'643','Saudi Arabia':'682','Senegal':'686',
  'Serbia':'688','Singapore':'702','Slovakia':'703','Slovenia':'705',
  'South Africa':'710','South Korea':'410','Spain':'724','Sri Lanka':'144',
  'Sweden':'752','Switzerland':'756','Syria':'760','Taiwan':'158','Tajikistan':'762',
  'Tanzania':'834','Thailand':'764','Tunisia':'788','Turkey':'792','Turkmenistan':'795',
  'Uganda':'800','Ukraine':'804','United Arab Emirates':'784','United Kingdom':'826',
  'United States':'840','Uruguay':'858','Uzbekistan':'860','Venezuela':'862',
  'Vietnam':'704','Yemen':'887','Zimbabwe':'716',
};

// Returns 'past' | 'upcoming' | undefined for each country
function buildCountryStatus(trips, year) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const status = {}; // country name → 'past' | 'upcoming'
  const filtered = year ? trips.filter(t => t.startDate?.startsWith(year)) : trips;
  filtered.forEach(trip => {
    trip.cities.forEach(city => {
      const key = city.country || city.name;
      if (!key) return;
      const start = city.startDate ? new Date(city.startDate + 'T00:00:00') : null;
      const end = city.endDate ? new Date(city.endDate + 'T00:00:00') : null;
      let s;
      if (!start && !end) {
        s = 'upcoming'; // no dates → treat as planned
      } else if (end && end < today) {
        s = 'past'; // already visited
      } else if (start && start <= today) {
        s = 'past'; // currently there
      } else {
        s = 'upcoming'; // future
      }
      // past wins over upcoming
      if (!status[key] || s === 'past') status[key] = s;
    });
  });
  return status;
}

function GlobeMap({ cities, countryStatus }) {
  const getCode = (name) => COUNTRY_CODES[name];
  const codeStatus = {};
  for (const [name, s] of Object.entries(countryStatus)) {
    const code = getCode(name);
    if (code) codeStatus[code] = s;
  }
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
        background: '#060d1a',
        borderRadius: 14,
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
        style={{ width: '100%', height: 320 }}
      >
        <defs>
          <filter id="pglow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="patm" cx="50%" cy="50%" r="50%">
            <stop offset="85%" stopColor="#0d1f3c" stopOpacity="0" />
            <stop offset="100%" stopColor="#2563a8" stopOpacity="0.45" />
          </radialGradient>
        </defs>

        <Sphere fill="#0b1929" stroke="#1a2a48" strokeWidth={0.5} />
        <Sphere fill="url(#patm)" stroke="none" />
        <Graticule stroke="#11213a" strokeWidth={0.35} />

        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map(geo => {
              const s = codeStatus[String(geo.id)];
              const fill = s === 'past' ? '#2e86de' : s === 'upcoming' ? '#1a4a7a' : '#1e3252';
              const stroke = s === 'past' ? '#2a6090' : s === 'upcoming' ? '#1a4070' : '#1e3050';
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={s ? 0.6 : 0.35}
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
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(to top, #060d1a, transparent)', pointerEvents: 'none' }} />
    </div>
  );
}

export default function PassportView({ trips }) {
  const years = ['ALL-TIME', ...getAllYears(trips)];
  const [selectedYear, setSelectedYear] = useState('ALL-TIME');

  const year = selectedYear === 'ALL-TIME' ? null : selectedYear;
  const stats = getPassportStats(trips, year);
  const countryStatus = buildCountryStatus(trips, year);

  const countryMap = {};
  trips
    .filter(t => !year || t.startDate?.startsWith(year))
    .forEach(trip => {
      trip.cities.forEach(city => {
        const key = city.country || city.name;
        if (!countryMap[key]) countryMap[key] = city.flag;
      });
    });

  const countries = Object.entries(countryMap).map(([name, flag]) => ({ name, flag }));

  return (
    <div style={{ marginTop: 40, marginBottom: 20 }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: pf, color: 'var(--text-primary)', margin: '0 0 4px' }}>
          ✈️ Passport
        </h2>
        <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontFamily: f, margin: 0 }}>
          Your travel history across the world
        </p>
      </div>

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
        <GlobeMap cities={stats.cities} countryStatus={countryStatus} />
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        {[
          { icon: '🌍', label: 'Countries', value: stats.countriesCount },
          { icon: '🏙️', label: 'Cities', value: stats.citiesCount },
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

      {/* Countries visited */}
      {countries.length > 0 && (
        <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: '14px 16px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, fontFamily: f, color: 'var(--text-primary)', marginBottom: 10 }}>
            Countries Visited
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {countries.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', background: 'var(--border)', borderRadius: 8, fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: f }}>
                <span style={{ fontSize: 14 }}>{c.flag}</span>
                <span>{c.name}</span>
              </div>
            ))}
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
