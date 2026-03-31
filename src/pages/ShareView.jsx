import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSharedTrip } from '../lib/api';
import { formatDateRange, tripDays, tripProgress, slotDone } from '../utils/tripHelpers';
import { f, pf } from '../utils/constants';

function ReadOnlySchedule({ trip }) {
  const [open, setOpen] = useState(true);

  const citiesWithSchedule = trip.cities.filter(c => c.schedule?.length > 0);
  if (!citiesWithSchedule.length) return null;

  const totalSlots = citiesWithSchedule.reduce((sum, c) =>
    sum + c.schedule.reduce((s, d) => s + d.slots.length, 0), 0);
  const doneSlots = citiesWithSchedule.reduce((sum, c) =>
    sum + c.schedule.reduce((s, d) => s + d.slots.filter(sl => slotDone(c, sl)).length, 0), 0);

  return (
    <div style={{ marginTop: 24 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '12px 16px', background: 'var(--bg-card)', borderRadius: 13, border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-primary)', fontFamily: f, fontSize: 14, fontWeight: 600 }}
      >
        <span>🗓️ Full Schedule</span>
        <span style={{ fontSize: 11.5, fontWeight: 400, color: 'var(--text-secondary)' }}>{doneSlots}/{totalSlots} done</span>
        <div style={{ flex: 1 }} />
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform .2s' }}>
          <path d="M3 5L7 9L11 5" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {citiesWithSchedule.map(city => (
            <div key={city.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: `${city.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{city.flag || '📍'}</div>
                <span style={{ fontSize: 13, fontWeight: 700, color: city.color, fontFamily: f }}>{city.name}</span>
                <div style={{ flex: 1, height: 1, background: `${city.color}20`, marginLeft: 4 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 4 }}>
                {city.schedule.map((day, dI) => {
                  const dc = day.slots.filter(s => slotDone(city, s)).length;
                  return (
                    <div key={dI} style={{ background: 'var(--bg-card)', borderRadius: 11, border: '1px solid var(--border)', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 13px', background: `${city.color}08`, borderBottom: '1px solid var(--border-light)' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', flexShrink: 0 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', fontFamily: f }}>{dc}/{day.slots.length}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', fontFamily: f }}>{day.day}</div>
                          {day.title && <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: f }}>{day.title}</div>}
                        </div>
                      </div>
                      <div style={{ padding: '2px 13px' }}>
                        {day.slots.map((slot, sI) => {
                          const done = slotDone(city, slot);
                          return (
                            <div key={slot.id ?? sI} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 0', borderBottom: sI < day.slots.length - 1 ? '1px solid var(--border-light)' : 'none', opacity: done ? 0.45 : 1 }}>
                              <div style={{ width: 19, height: 19, borderRadius: 5, border: `2px solid ${done ? city.color : 'var(--border)'}`, background: done ? city.color : 'transparent', flexShrink: 0 }} />
                              <span style={{ fontSize: 10, fontWeight: 700, color: city.color, fontFamily: f, minWidth: 48, textTransform: 'uppercase', letterSpacing: '.04em' }}>{slot.time}</span>
                              <span style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: f, textDecoration: done ? 'line-through' : 'none', flex: 1 }}>{slot.text}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShareView() {
  const { token } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getSharedTrip(token)
      .then(data => { setTrip(data); setLoading(false); })
      .catch(() => { setError('Trip not found or this link has expired.'); setLoading(false); });
  }, [token]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-secondary)', fontFamily: f, fontSize: 13 }}>
        Loading itinerary…
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)', color: '#E63946', fontFamily: f, fontSize: 13 }}>
        {error || 'Trip not found.'}
      </div>
    );
  }

  const { t: gT, d: gD, pct: gP } = tripProgress(trip);
  const days = tripDays(trip);
  const dateStr = formatDateRange(trip.startDate, trip.endDate);
  const gradientColors = trip.cities.map(c => c.color).filter(Boolean).join(',');

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      {/* Shared badge */}
      <div style={{ textAlign: 'center', padding: '8px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: f }}>✈️ Shared itinerary · read only</span>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px 40px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '26px 0 8px' }}>
          <div style={{ fontSize: 40, marginBottom: 5 }}>{trip.coverEmoji || '✈️'}</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, fontFamily: pf, color: 'var(--text-primary)', margin: '0 0 3px', letterSpacing: '-0.02em' }}>{trip.name}</h1>
          <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontFamily: f }}>
            {dateStr}{days > 0 ? ` · ${trip.cities.length} cities · ${days} days` : ''}
          </div>
        </div>

        {/* Progress */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 13, padding: '14px 16px', margin: '14px 0 16px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12.5, fontFamily: f, color: 'var(--text-secondary)' }}>Trip Progress</span>
            <span style={{ fontSize: 20, fontWeight: 700, fontFamily: f, color: 'var(--text-primary)' }}>{gP}%</span>
          </div>
          <div style={{ width: '100%', height: 7, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${gP}%`, height: '100%', background: gradientColors ? `linear-gradient(90deg,${gradientColors})` : '#457B9D', borderRadius: 4 }} />
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 6, fontFamily: f }}>{gD} of {gT} items</div>
        </div>

        {/* Cities */}
        {trip.cities.map(city => {
          const dateRange = formatDateRange(city.startDate, city.endDate);
          return (
            <div key={city.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--bg-card)', borderRadius: 13, border: '1px solid var(--border)', marginBottom: 8 }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: `${city.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21, flexShrink: 0 }}>{city.flag || '📍'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)', fontFamily: f }}>{city.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: f }}>{dateRange || city.country}</div>
                {city.notes && <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: f, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: 0.75 }}>{city.notes.length > 72 ? city.notes.slice(0, 72) + '…' : city.notes}</div>}
              </div>
            </div>
          );
        })}

        {/* Read-only schedule */}
        <ReadOnlySchedule trip={trip} />

        {/* Crew */}
        {trip.crew?.length > 0 && (
          <div style={{ marginTop: 28, textAlign: 'center', paddingBottom: 20 }}>
            <div style={{ width: 40, height: 1, background: 'var(--border)', margin: '0 auto 16px', borderRadius: 1 }} />
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', fontFamily: f, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 12 }}>A trip by</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
              {trip.crew.map((name, i) => (
                <div key={i} style={{ fontSize: 15, fontWeight: 600, fontFamily: pf, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{name}</div>
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-secondary)', fontFamily: f }}>
              {dateStr}{days > 0 ? ` · ${days} days` : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
