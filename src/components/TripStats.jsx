import { cityCounts, pct, tripDistance } from '../utils/tripHelpers';
import { f } from '../utils/constants';

export default function TripStats({ trip }) {
  let grandT = 0, grandD = 0;
  trip.cities.forEach(city => {
    const { t, d } = cityCounts(city);
    grandT += t;
    grandD += d;
  });

  const visited = trip.cities.filter(c => { const { d } = cityCounts(c); return d > 0; }).length;
  const bkDone = (trip.bookings || []).filter(b => b.done).length;
  const trDone = (trip.transport || []).filter(t => t.done).length;
  const totalBooked = (trip.bookings || []).length + (trip.transport || []).length;
  const countries = new Set(trip.cities.map(c => c.country || c.flag)).size;
  const dist = tripDistance(trip);

  const stats = [
    { label: 'Cities', value: `${visited}/${trip.cities.length}`, icon: '🏙️', sub: `${countries} ${countries === 1 ? 'country' : 'countries'}` },
    { label: 'Items Done', value: `${grandD}/${grandT}`, icon: '✅', sub: `${pct(grandD, grandT)}% complete` },
    { label: 'Booked', value: `${bkDone + trDone}/${totalBooked}`, icon: '🎟️', sub: 'tickets & transport' },
    { label: 'Distance', value: dist > 0 ? `${dist.toLocaleString()} km` : '—', icon: '📍', sub: 'total route' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {stats.map((s, i) => (
        <div key={i} style={{ background: 'var(--bg-card)', borderRadius: 12, padding: '14px', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: f, color: 'var(--text-primary)' }}>{s.value}</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: f, fontWeight: 500 }}>{s.label}</div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: f, marginTop: 2, opacity: 0.7 }}>{s.sub}</div>
        </div>
      ))}
    </div>
  );
}
