import { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { getPassportStats, getAllYears } from '../utils/tripHelpers';
import { f, pf } from '../utils/constants';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// ISO 3166-1 numeric → country name lookup
const COUNTRY_CODES = {
  'Afghanistan':'004','Albania':'008','Algeria':'012','Argentina':'032','Australia':'036',
  'Austria':'040','Azerbaijan':'031','Bahrain':'048','Bangladesh':'050','Belarus':'112',
  'Belgium':'056','Bolivia':'068','Bosnia and Herzegovina':'070','Brazil':'076',
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

function WorldMap({ cities, countries }) {
  const visitedCodes = new Set(countries.map(n => COUNTRY_CODES[n]).filter(Boolean));
  const markers = cities.filter(c => c.lat && c.lng);

  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)', background: '#1a2030' }}>
      <ComposableMap projectionConfig={{ scale: 145, center: [10, 10] }} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map(geo => {
              const visited = visitedCodes.has(String(geo.id));
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={visited ? '#457B9D' : '#2a3142'}
                  stroke="#1a2030"
                  strokeWidth={0.5}
                  style={{ default: { outline: 'none' }, hover: { outline: 'none', fill: visited ? '#5a9dbf' : '#343d52' }, pressed: { outline: 'none' } }}
                />
              );
            })
          }
        </Geographies>
        {markers.map((city, i) => (
          <Marker key={i} coordinates={[city.lng, city.lat]}>
            <circle r={4} fill={city.color || '#E63946'} stroke="#fff" strokeWidth={1.5} opacity={0.9} />
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
}

export default function PassportView({ trips }) {
  const years = ['ALL-TIME', ...getAllYears(trips)];
  const [selectedYear, setSelectedYear] = useState('ALL-TIME');

  const year = selectedYear === 'ALL-TIME' ? null : selectedYear;
  const stats = getPassportStats(trips, year);

  // Get unique countries with flags
  const countryMap = {};
  trips
    .filter(t => !year || t.startDate?.startsWith(year))
    .forEach(trip => {
      trip.cities.forEach(city => {
        const key = city.country || city.name;
        if (!countryMap[key]) {
          countryMap[key] = city.flag;
        }
      });
    });

  const countries = Object.entries(countryMap).map(([name, flag]) => ({ name, flag }));

  return (
    <div style={{ marginTop: 40, marginBottom: 20 }}>
      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: pf, color: 'var(--text-primary)', margin: '0 0 12px' }}>
          ✈️ Passport
        </h2>
        <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontFamily: f, margin: 0 }}>
          Your travel history across the world
        </p>
      </div>

      {/* Year tabs */}
      <div style={{ display: 'flex', gap: 6, overflow: 'auto', marginBottom: 18, paddingBottom: 8, scrollBehavior: 'smooth' }}>
        {years.map(yr => (
          <button
            key={yr}
            onClick={() => setSelectedYear(yr)}
            style={{
              padding: '8px 14px',
              borderRadius: 20,
              border: 'none',
              background: selectedYear === yr ? 'var(--text-primary)' : 'var(--bg-card)',
              color: selectedYear === yr ? 'var(--bg)' : 'var(--text-secondary)',
              fontSize: 12.5,
              fontWeight: 600,
              fontFamily: f,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all .15s',
            }}
            onMouseEnter={e => !selectedYear === yr && (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            {yr}
          </button>
        ))}
      </div>

      {/* World Map */}
      <div style={{ marginBottom: 20 }}>
        <WorldMap cities={stats.cities} />
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
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
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 10px',
                  background: 'var(--border-light)',
                  borderRadius: 8,
                  fontSize: 11.5,
                  color: 'var(--text-secondary)',
                  fontFamily: f,
                }}
                title={c.name}
              >
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
