import { PinIcon } from './common/Icons';
import { haversine } from '../utils/tripHelpers';
import { f } from '../utils/constants';

export default function RouteMap({ trip }) {
  const cities = trip.cities.filter(c => c.lat && c.lng);

  if (cities.length < 2) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13, fontFamily: f }}>
        Add city coordinates to see the route map
      </div>
    );
  }

  const lats = cities.map(c => c.lat), lngs = cities.map(c => c.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const padLat = Math.max((maxLat - minLat) * 0.2, 1.5);
  const padLng = Math.max((maxLng - minLng) * 0.2, 1.5);
  const bbox = `${minLng - padLng},${minLat - padLat},${maxLng + padLng},${maxLat + padLat}`;
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`;
  const gmapsUrl = `https://www.google.com/maps/dir/${cities.map(c => `${encodeURIComponent(c.name)},${encodeURIComponent(c.country)}`).join('/')}`;

  let totalDist = 0;
  const legs = [];
  for (let i = 1; i < cities.length; i++) {
    const d = haversine(cities[i-1].lat, cities[i-1].lng, cities[i].lat, cities[i].lng);
    legs.push(d);
    totalDist += d;
  }

  return (
    <div>
      <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 10 }}>
        <iframe src={osmUrl} style={{ width: '100%', height: 360, border: 'none', display: 'block' }} loading="lazy" title="Trip Route Map" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 10 }}>
        {trip.cities.map((c, i) => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 9, border: '1px solid var(--border-light)' }}>
            <div style={{ width: 24, height: 24, borderRadius: 7, background: `${c.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0, fontWeight: 700, color: c.color, fontFamily: f }}>{i + 1}</div>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{c.flag}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: f, flex: 1 }}>{c.name}</span>
            {legs[i] && (
              <>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: f }}>{legs[i].toLocaleString()} km</span>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>→</span>
              </>
            )}
          </div>
        ))}
      </div>
      {totalDist > 0 && (
        <div style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: f, marginBottom: 8 }}>
          Total route: {totalDist.toLocaleString()} km
        </div>
      )}
      <a href={gmapsUrl} target="_blank" rel="noopener noreferrer"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 10, background: '#457B9D', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600, fontFamily: f, transition: 'opacity .15s' }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
        <PinIcon /> View Full Route in Google Maps
      </a>
    </div>
  );
}
