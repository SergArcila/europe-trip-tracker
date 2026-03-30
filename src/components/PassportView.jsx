import { useState } from 'react';
import { getPassportStats, getAllYears } from '../utils/tripHelpers';
import { f, pf } from '../utils/constants';

function WorldMap({ cities }) {
  const withCoords = cities.filter(c => c.lat && c.lng);

  if (withCoords.length === 0) {
    return (
      <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 13, fontFamily: f }}>
        No city coordinates available
      </div>
    );
  }

  const lats = withCoords.map(c => c.lat);
  const lngs = withCoords.map(c => c.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const padLat = Math.max((maxLat - minLat) * 0.3, 3);
  const padLng = Math.max((maxLng - minLng) * 0.3, 3);
  const bbox = `${minLng - padLng},${minLat - padLat},${maxLng + padLng},${maxLat + padLat}`;
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`;

  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)' }}>
      <iframe src={osmUrl} style={{ width: '100%', height: 280, border: 'none', display: 'block' }} loading="lazy" title="World Map" />
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
