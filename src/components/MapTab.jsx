import { PinIcon } from './common/Icons';
import { allCityItems } from '../utils/tripHelpers';
import { f, getCatColor as catColorUtil } from '../utils/constants';

export default function MapTab({ city }) {
  const items = allCityItems(city);

  if (items.length === 0) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13, fontFamily: f }}>No locations with coordinates</div>;
  }

  const lats = items.map(i => i.lat), lngs = items.map(i => i.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const padLat = (maxLat - minLat) * 0.35 || 0.015;
  const padLng = (maxLng - minLng) * 0.35 || 0.015;
  const bbox = `${minLng - padLng},${minLat - padLat},${maxLng + padLng},${maxLat + padLat}`;
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`;
  const gmapsUrl = `https://www.google.com/maps/dir/${items.map(i => `${i.lat},${i.lng}`).join('/')}`;

  const usedCats = [...new Set(items.map(i => i.cat))];

  return (
    <div>
      <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 10 }}>
        <iframe src={osmUrl} style={{ width: '100%', height: 340, border: 'none', display: 'block' }} loading="lazy" title="City Map" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
        {items.map(item => {
          const col = catColorUtil(item.cat, city.color);
          return (
            <a key={item.id} href={`https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, textDecoration: 'none', background: 'var(--bg-card)', border: '1px solid var(--border-light)', transition: 'all .15s', opacity: item.done ? 0.45 : 1 }}
              onMouseEnter={e => e.currentTarget.style.borderColor = col}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-light)'}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: col, flexShrink: 0 }} />
              <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-primary)', fontFamily: f, flex: 1, textDecoration: item.done ? 'line-through' : 'none' }}>{item.text}</span>
              <span style={{ color: col, flexShrink: 0 }}><PinIcon /></span>
            </a>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', padding: '6px 0', flexWrap: 'wrap' }}>
        {usedCats.map(k => {
          const col = catColorUtil(k, city.color);
          const label = k === 'monaco' ? 'Monaco' : k.charAt(0).toUpperCase() + k.slice(1);
          return (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-secondary)', fontFamily: f }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: col }} />{label}
            </div>
          );
        })}
      </div>
      <a href={gmapsUrl} target="_blank" rel="noopener noreferrer"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 10, background: city.color, color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600, fontFamily: f, marginTop: 8, transition: 'opacity .15s' }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
        <PinIcon /> Open All in Google Maps
      </a>
    </div>
  );
}
