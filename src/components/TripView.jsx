import { useState, useEffect } from 'react';
import { ChevRight, ChevDown, NoteIcon, DownloadIcon } from './common/Icons';
import Bookings from './Bookings';
import TripStats from './TripStats';
import RouteMap from './RouteMap';
import Checkbox from './common/Checkbox';
import { cityCounts, pct, tripProgress, formatDateRange, tripDays, findItem, slotDone } from '../utils/tripHelpers';
import { syncCityDiff, getTripMembers } from '../lib/api';
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
      <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card)', borderRadius: 13, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div
          onClick={() => setOpen(o => !o)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, padding: '12px 16px', cursor: 'pointer', color: 'var(--text-primary)', fontFamily: f, fontSize: 14, fontWeight: 600 }}
        >
          <span>🗓️ Full Schedule</span>
          <span style={{ fontSize: 11.5, fontWeight: 400, color: 'var(--text-secondary)' }}>{doneSlots}/{totalSlots} done</span>
          <div style={{ flex: 1 }} />
          <ChevDown up={!open} />
        </div>
        <button
          onClick={() => onExportICS(citiesWithSchedule)}
          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderLeft: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 11, fontFamily: f, cursor: 'pointer', height: '100%', transition: 'all .15s', flexShrink: 0 }}
          title="Export to calendar (.ics)"
        >
          <DownloadIcon /> .ics
        </button>
      </div>

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

function MemberAvatar({ member, size = 44 }) {
  const s = { width: size, height: size, borderRadius: size / 2, flexShrink: 0 };
  if (member.avatarUrl) {
    return <img src={member.avatarUrl} alt={member.displayName} style={{ ...s, objectFit: 'cover', border: '2px solid var(--border)' }} />;
  }
  const initials = (member.displayName || '?').charAt(0).toUpperCase();
  return (
    <div style={{ ...s, background: 'var(--bg-input)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 700, color: 'var(--text-secondary)', fontFamily: f }}>
      {initials}
    </div>
  );
}

function TripMembers({ trip }) {
  const [liveMembers, setLiveMembers] = useState(null);

  useEffect(() => {
    getTripMembers(trip.id)
      .then(setLiveMembers)
      .catch(() => {});
  }, [trip.id]);

  const members = liveMembers ?? (trip.members || []);
  const owner = trip.owner;
  const everyone = [
    ...(owner ? [{ ...owner, role: 'owner' }] : []),
    ...members,
  ];

  if (everyone.length === 0) return null;

  return (
    <div style={{ marginTop: 32, paddingBottom: 24 }}>
      <div style={{ width: 40, height: 1, background: 'var(--border)', margin: '0 auto 24px', borderRadius: 1 }} />

      {/* Avatar row */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        {everyone.map(m => (
          <div key={m.userId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <MemberAvatar member={m} size={48} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', fontFamily: f, letterSpacing: '-0.01em' }}>{m.displayName}</div>
              <div style={{ fontSize: 10, color: m.role === 'owner' ? '#457B9D' : 'var(--text-secondary)', fontFamily: f, textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 600 }}>{m.role}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TripView({ trip, updateTrip, onSelectCity }) {
  const { getCity } = useData();
  const { t: gT, d: gD, pct: gP } = tripProgress(trip);
  const days = tripDays(trip);
  const dateStr = formatDateRange(trip.startDate, trip.endDate);
  const hasGlobe = trip.cities.some(c => c.lat && c.lng);
  const gradientColors = trip.cities.map(c => c.color).join(',');
  const progressBg = trip.cities.length > 1 ? `linear-gradient(90deg,${gradientColors})` : (trip.cities[0]?.color || '#457B9D');

  // Unique countries
  const countryMap = new Map();
  for (const c of trip.cities) {
    const key = c.country || c.name;
    if (key && !countryMap.has(key)) countryMap.set(key, c.flag || '📍');
  }
  const uniqueCountries = [...countryMap.entries()];

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', paddingBottom: 48 }}>

      {/* ── Trip hero (title + flags + meta) ── */}
      <div style={{ textAlign: 'center', padding: '26px 16px 8px' }}>
        <div style={{ fontSize: 40, marginBottom: 6 }}>{trip.coverEmoji || '✈️'}</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: pf, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>{trip.name}</h1>
        {uniqueCountries.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginBottom: 8 }}>
            {uniqueCountries.map(([country, flag]) => (
              <span key={country} title={country} style={{ fontSize: 20 }}>{flag}</span>
            ))}
          </div>
        )}
        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontFamily: f }}>
          {dateStr}{days > 0 ? ` · ${days} days` : ''}
          {uniqueCountries.length > 0 ? ` · ${uniqueCountries.length} ${uniqueCountries.length === 1 ? 'country' : 'countries'}` : ''}
          {trip.cities.length > 0 ? ` · ${trip.cities.length} ${trip.cities.length === 1 ? 'city' : 'cities'}` : ''}
          {gT > 0 ? ` · ${gT} items` : ''}
        </div>
      </div>

      {/* ── Progress bar card ── */}
      {gT > 0 && (
        <div style={{ background: 'var(--bg-card)', borderRadius: 13, padding: '14px 16px', margin: '12px 16px 16px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12.5, fontFamily: f, color: 'var(--text-secondary)' }}>Trip Progress</span>
            <span style={{ fontSize: 20, fontWeight: 700, fontFamily: f, color: 'var(--text-primary)' }}>{gP}%</span>
          </div>
          <div style={{ width: '100%', height: 7, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${gP}%`, height: '100%', background: progressBg, borderRadius: 4, transition: 'width .4s ease' }} />
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 6, fontFamily: f }}>{gD} of {gT} items</div>
        </div>
      )}

      {/* ── Globe — zoomed to trip cities with labels ── */}
      {hasGlobe && (
        <div style={{ margin: '0 16px 16px' }}>
          <RouteMap trip={trip} height={280} showCityList={false} showLabels={true} />
        </div>
      )}

      {/* ── Cities ── compact tappable list */}
      <div style={{ padding: '14px 16px 0', marginTop: gT === 0 ? 8 : 0 }}>
        {trip.cities.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)', fontSize: 13, fontFamily: f }}>
            No cities yet — edit the trip to add some.
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {trip.cities.map((city, idx) => {
            const { t, d } = cityCounts(city);
            const p = pct(d, t);
            const dateRange = formatDateRange(city.startDate, city.endDate);
            const cityNotes = getCity(city.id)?.notes;
            return (
              <button
                key={city.id}
                onClick={() => onSelectCity(city.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', width: '100%', cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = city.color + '80'; e.currentTarget.style.background = city.color + '08'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
              >
                {/* Colored left accent */}
                <div style={{ width: 3, height: 34, borderRadius: 2, background: city.color, flexShrink: 0 }} />
                {/* Flag */}
                <span style={{ fontSize: 19, flexShrink: 0 }}>{city.flag || '📍'}</span>
                {/* Name + date */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', fontFamily: f }}>{city.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: f, marginTop: 1 }}>
                    {dateRange || city.country}
                    {cityNotes && <span style={{ opacity: 0.6 }}> · {cityNotes.slice(0, 40)}{cityNotes.length > 40 ? '…' : ''}</span>}
                  </div>
                </div>
                {/* Progress */}
                {t > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: p > 0 ? city.color : 'var(--text-secondary)', fontFamily: f }}>{p}%</span>
                    <div style={{ width: 36, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${p}%`, height: '100%', background: city.color, borderRadius: 2 }} />
                    </div>
                  </div>
                )}
                <ChevRight />
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Sections ── */}
      <div style={{ padding: '0 16px' }}>
        {/* Full Schedule */}
        <TripSchedule trip={trip} onExportICS={(cities) => downloadICS(trip, cities)} />

        {/* Bookings & Transport */}
        <Bookings trip={trip} updateTrip={updateTrip} />

        {/* Stats */}
        <div style={{ marginTop: 20 }}>
          <TripStats trip={trip} />
        </div>

        {/* Trip Journal */}
        <TripJournal trip={trip} updateTrip={updateTrip} />

        {/* Members */}
        <TripMembers trip={trip} />
      </div>
    </div>
  );
}
