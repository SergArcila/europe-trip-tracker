import { useState } from 'react';
import { ChevRight, ChevDown, NoteIcon, DownloadIcon } from './common/Icons';
import Bookings from './Bookings';
import TripStats from './TripStats';
import RouteMap from './RouteMap';
import Checkbox from './common/Checkbox';
import { cityCounts, pct, tripProgress, formatDateRange, tripDays, findItem, slotDone } from '../utils/tripHelpers';
import { syncCityDiff } from '../lib/api';
import { useData } from '../context/DataContext';
import { downloadICS } from '../utils/icsExport';
import { f, pf } from '../utils/constants';

function TripJournal({ trip, updateTrip }) {
  const [showNotes, setShowNotes] = useState(false);
  const tripNotes = trip.tripNotes || '';
  const updateNotes = (val) => updateTrip(t => ({ ...t, tripNotes: val }));

  return (
    <div style={{ marginTop: 24 }}>
      <button onClick={() => setShowNotes(!showNotes)} style={{ display: 'flex', alignItems: 'center', gap: 7, width: '100%', padding: '12px 16px', background: 'var(--bg-card)', borderRadius: 13, border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-primary)', fontFamily: f, fontSize: 14, fontWeight: 600, transition: 'all .15s' }}>
        <NoteIcon /> Trip Journal {tripNotes && <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 400 }}>({tripNotes.length} chars)</span>}
        <div style={{ flex: 1 }} /><ChevDown up={!showNotes} />
      </button>
      {showNotes && (
        <textarea value={tripNotes} onChange={e => updateNotes(e.target.value)} placeholder="Trip memories, overall notes, things to remember..." style={{ width: '100%', minHeight: 150, padding: 14, marginTop: 6, borderRadius: 13, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 13, fontFamily: f, outline: 'none', resize: 'vertical', lineHeight: 1.5, boxSizing: 'border-box' }} />
      )}
    </div>
  );
}

function TripSchedule({ trip, onExportICS }) {
  const { getCity, persistCity } = useData();
  const [open, setOpen] = useState(true);

  // Collect cities that have full schedule data in cache
  const citiesWithSchedule = trip.cities
    .map(lc => getCity(lc.id))
    .filter(c => c?.schedule?.length > 0);

  if (!citiesWithSchedule.length) return null;

  const totalSlots = citiesWithSchedule.reduce((sum, c) =>
    sum + c.schedule.reduce((s, d) => s + d.slots.length, 0), 0);
  const doneSlots = citiesWithSchedule.reduce((sum, c) =>
    sum + c.schedule.reduce((s, d) => s + d.slots.filter(sl => slotDone(c, sl)).length, 0), 0);

  const toggleSlot = (city, dayIdx, slotIdx) => {
    const oldCity = city;
    const newCity = JSON.parse(JSON.stringify(city));
    const s = newCity.schedule[dayIdx].slots[slotIdx];
    if (s.ref) {
      const item = findItem(newCity, s.ref);
      if (item) item.done = !item.done;
    } else {
      s.done = !s.done;
    }
    persistCity(newCity);
    syncCityDiff(oldCity, newCity, trip.id).catch(console.error);
  };

  return (
    <div style={{ marginTop: 24 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '12px 16px', background: 'var(--bg-card)', borderRadius: 13, border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-primary)', fontFamily: f, fontSize: 14, fontWeight: 600, transition: 'all .15s' }}
      >
        <span>🗓️ Full Schedule</span>
        <span style={{ fontSize: 11.5, fontWeight: 400, color: 'var(--text-secondary)' }}>{doneSlots}/{totalSlots} done</span>
        <div style={{ flex: 1 }} />
        <button
          onClick={(e) => { e.stopPropagation(); onExportICS(citiesWithSchedule); }}
          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-secondary)', fontSize: 11, fontFamily: f, cursor: 'pointer', marginRight: 6, transition: 'all .15s' }}
          title="Export to calendar (.ics)"
        >
          <DownloadIcon /> .ics
        </button>
        <ChevDown up={!open} />
      </button>

      {open && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {citiesWithSchedule.map(city => (
            <div key={city.id}>
              {/* City header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: `${city.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{city.flag || '📍'}</div>
                <span style={{ fontSize: 13, fontWeight: 700, color: city.color, fontFamily: f }}>{city.name}</span>
                <div style={{ flex: 1, height: 1, background: `${city.color}20`, marginLeft: 4 }} />
              </div>

              {/* Days */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 4 }}>
                {city.schedule.map((day, dI) => {
                  const dc = day.slots.filter(s => slotDone(city, s)).length;
                  const allDone = dc === day.slots.length && day.slots.length > 0;
                  return (
                    <div key={dI} style={{ background: 'var(--bg-card)', borderRadius: 11, border: '1px solid var(--border)', overflow: 'hidden' }}>
                      {/* Day header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 13px', background: `${city.color}08`, borderBottom: '1px solid var(--border-light)' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: allDone ? `${city.color}20` : 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${allDone ? city.color + '40' : 'var(--border)'}`, flexShrink: 0 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: allDone ? city.color : 'var(--text-secondary)', fontFamily: f }}>{dc}/{day.slots.length}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', fontFamily: f }}>{day.day}</div>
                          {day.title && <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: f }}>{day.title}</div>}
                        </div>
                        {allDone && <span style={{ fontSize: 16 }}>✅</span>}
                      </div>

                      {/* Slots */}
                      <div style={{ padding: '2px 13px' }}>
                        {day.slots.map((slot, sI) => {
                          const done = slotDone(city, slot);
                          return (
                            <div
                              key={slot.id ?? sI}
                              style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 0', borderBottom: sI < day.slots.length - 1 ? '1px solid var(--border-light)' : 'none', opacity: done ? 0.5 : 1, transition: 'opacity .2s' }}
                            >
                              <Checkbox on={done} color={city.color} sz={19} onClick={() => toggleSlot(city, dI, sI)} />
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

export default function TripView({ trip, updateTrip, onSelectCity }) {
  const { getCity } = useData();
  const { t: gT, d: gD, pct: gP } = tripProgress(trip);
  const days = tripDays(trip);
  const countries = new Set(trip.cities.map(c => c.country || c.name)).size;
  const dateStr = formatDateRange(trip.startDate, trip.endDate);

  const gradientColors = trip.cities.map(c => c.color).join(',');

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px 40px' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '26px 0 8px' }}>
        <div style={{ fontSize: 40, marginBottom: 5 }}>{trip.coverEmoji || '✈️'}</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, fontFamily: pf, color: 'var(--text-primary)', margin: '0 0 3px', letterSpacing: '-0.02em' }}>{trip.name}</h1>
        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontFamily: f }}>
          {dateStr}{days > 0 ? ` · ${trip.cities.length} cities · ${days} days` : ''}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 13, padding: '14px 16px', margin: '14px 0 16px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12.5, fontFamily: f, color: 'var(--text-secondary)' }}>Trip Progress</span>
          <span style={{ fontSize: 20, fontWeight: 700, fontFamily: f, color: 'var(--text-primary)' }}>{gP}%</span>
        </div>
        <div style={{ width: '100%', height: 7, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${gP}%`, height: '100%', background: trip.cities.length > 1 ? `linear-gradient(90deg,${gradientColors})` : (trip.cities[0]?.color || '#457B9D'), borderRadius: 4, transition: 'width .4s ease' }} />
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 6, fontFamily: f }}>{gD} of {gT} items</div>
      </div>

      {/* Cities */}
      {trip.cities.map(city => {
        const { t, d } = cityCounts(city);
        const p = pct(d, t);
        const dateRange = formatDateRange(city.startDate, city.endDate);
        const cityNotes = getCity(city.id)?.notes;
        return (
          <button key={city.id} onClick={() => onSelectCity(city.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--bg-card)', borderRadius: 13, border: '1px solid var(--border)', width: '100%', cursor: 'pointer', marginBottom: 8, textAlign: 'left', transition: 'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = city.color; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: `${city.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21, flexShrink: 0 }}>{city.flag || '📍'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)', fontFamily: f }}>{city.name}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: f }}>{dateRange || city.country}</div>
              {cityNotes && <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: f, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: 0.75 }}>{cityNotes.length > 72 ? cityNotes.slice(0, 72) + '…' : cityNotes}</div>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: city.color, fontFamily: f }}>{p}%</span>
              <div style={{ width: 44, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${p}%`, height: '100%', background: city.color, borderRadius: 2, transition: 'width .35s ease' }} />
              </div>
            </div>
            <ChevRight />
          </button>
        );
      })}

      {trip.cities.length === 0 && (
        <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-secondary)', fontSize: 13, fontFamily: f }}>
          No cities yet. Edit the trip to add cities.
        </div>
      )}

      {/* Full Schedule */}
      <TripSchedule trip={trip} onExportICS={(cities) => downloadICS(trip, cities)} />

      {/* Bookings & Transport */}
      <Bookings trip={trip} updateTrip={updateTrip} />

      {/* Stats */}
      <div style={{ marginTop: 24, marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 600, fontFamily: f, color: 'var(--text-primary)', marginBottom: 10 }}>📊 Trip Stats</div>
        <TripStats trip={trip} />
      </div>

      {/* Route Map */}
      {trip.cities.some(c => c.lat && c.lng) && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, fontFamily: f, color: 'var(--text-primary)', marginBottom: 10 }}>🗺️ Trip Route</div>
          <RouteMap trip={trip} />
        </div>
      )}

      {/* Trip Journal */}
      <TripJournal trip={trip} updateTrip={updateTrip} />

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
          <div style={{ marginTop: 16, fontSize: 11, color: 'var(--text-secondary)', fontFamily: f }}>
            {dateStr} · {countries} {countries === 1 ? 'country' : 'countries'} · {trip.cities.length} cities{days > 0 ? ` · ${days} days` : ''}
          </div>
        </div>
      )}
    </div>
  );
}
