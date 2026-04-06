import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ComposableMap, Geographies, Geography, Marker, Graticule, Sphere } from 'react-simple-maps';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { deleteTrip, updateTripMeta, leaveTrip } from '../lib/api';
import { PlusIcon } from '../components/common/Icons';
import { f, pf } from '../utils/constants';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Stable random stars
const STARS = Array.from({ length: 180 }, (_, i) => ({
  x: ((i * 137.508) % 100),
  y: ((i * 97.3) % 100),
  r: i % 5 === 0 ? 1.5 : i % 3 === 0 ? 1.1 : 0.7,
  o: 0.3 + (i % 7) * 0.1,
}));

function getTripStatus(trip) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (!trip.startDate) return { label: '—', sub: 'DAYS', type: 'upcoming' };
  const start = new Date(trip.startDate + 'T00:00:00');
  const end = trip.endDate ? new Date(trip.endDate + 'T00:00:00') : start;
  if (today < start) {
    const days = Math.round((start - today) / (86400 * 1000));
    return { label: String(days), sub: 'DAYS', type: 'upcoming', days };
  }
  if (today <= end) return { label: 'NOW', sub: '', type: 'active' };
  return { label: '✓', sub: 'DONE', type: 'past' };
}

function SpaceGlobe({ trips }) {
  const [rotation, setRotation] = useState([-10, -30, 0]);
  const [scale, setScale] = useState(220);
  const isDragging = useRef(false);
  const dragStart = useRef(null);
  const mapRef = useRef(null);

  // Auto-rotate slowly when not dragging
  const animRef = useRef(null);
  useEffect(() => {
    const tick = () => {
      if (!isDragging.current) {
        setRotation(r => [r[0] - 0.04, r[1], r[2]]);
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const onWheel = e => {
      e.preventDefault();
      setScale(s => Math.max(140, Math.min(900, s - e.deltaY * 0.5)));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const onMouseDown = useCallback(e => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, rotation: [...rotation] };
  }, [rotation]);
  const onMouseMove = useCallback(e => {
    if (!isDragging.current || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const sens = 180 / scale;
    const [lon, lat] = dragStart.current.rotation;
    setRotation([lon - dx * sens, Math.max(-90, Math.min(90, lat + dy * sens)), 0]);
  }, [scale]);
  const onMouseUp = useCallback(() => { isDragging.current = false; }, []);

  const onTouchStart = useCallback(e => {
    isDragging.current = true;
    dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, rotation: [...rotation] };
  }, [rotation]);
  const onTouchMove = useCallback(e => {
    if (!isDragging.current || !dragStart.current) return;
    const dx = e.touches[0].clientX - dragStart.current.x;
    const dy = e.touches[0].clientY - dragStart.current.y;
    const sens = 180 / scale;
    const [lon, lat] = dragStart.current.rotation;
    setRotation([lon - dx * sens, Math.max(-90, Math.min(90, lat + dy * sens)), 0]);
  }, [scale]);

  const markers = useMemo(() =>
    trips.flatMap(t => t.cities.filter(c => c.lat && c.lng).map(c => ({ ...c, tripColor: c.color || '#4fc3f7' }))),
  [trips]);

  return (
    <div
      ref={mapRef}
      onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onMouseUp}
      style={{ width: '100%', height: '100%', cursor: isDragging.current ? 'grabbing' : 'grab', userSelect: 'none', touchAction: 'none' }}
    >
      <ComposableMap
        projection="geoOrthographic"
        projectionConfig={{ rotate: rotation, scale }}
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <radialGradient id="earthGrad" cx="38%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#1a3a5c" />
            <stop offset="60%" stopColor="#0d1f35" />
            <stop offset="100%" stopColor="#050d1a" />
          </radialGradient>
          <radialGradient id="atmGrad" cx="50%" cy="50%" r="50%">
            <stop offset="78%" stopColor="transparent" stopOpacity="0" />
            <stop offset="92%" stopColor="#4a90d9" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6ab4ff" stopOpacity="0.15" />
          </radialGradient>
          <filter id="cityGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <Sphere fill="url(#earthGrad)" stroke="#1e3a5f" strokeWidth={0.5} />
        <Sphere fill="url(#atmGrad)" stroke="none" />
        <Graticule stroke="#0d2040" strokeWidth={0.4} />

        <Geographies geography={GEO_URL}>
          {({ geographies }) => geographies.map(geo => (
            <Geography key={geo.rsmKey} geography={geo}
              fill="#0f2238" stroke="#0d1e30" strokeWidth={0.4}
              style={{ default: { outline: 'none' }, hover: { outline: 'none' }, pressed: { outline: 'none' } }}
            />
          ))}
        </Geographies>

        {markers.map((city, i) => (
          <Marker key={i} coordinates={[city.lng, city.lat]}>
            <circle r={14} fill={city.tripColor + '15'} />
            <circle r={7} fill={city.tripColor + '35'} />
            <circle r={3.5} fill={city.tripColor} filter="url(#cityGlow)" opacity={0.95} />
            <circle r={1.5} fill="#fff" opacity={0.9} />
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
}

function TripRow({ trip, onSelect, onArchive, onUnarchive, onDelete, onLeave }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const status = getTripStatus(trip);

  const countryMap = new Map();
  for (const c of trip.cities) {
    const key = c.country || c.name;
    if (key && !countryMap.has(key)) countryMap.set(key, c.flag || '📍');
  }
  const flags = [...countryMap.values()];
  const accentColor = trip.cities[0]?.color || '#4fc3f7';

  const labelColor = status.type === 'active' ? '#34C759'
    : status.type === 'past' ? 'rgba(255,255,255,0.25)'
    : '#fff';

  return (
    <div style={{ position: 'relative' }}>
      <div
        onClick={() => onSelect(trip.id)}
        style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '18px 20px', cursor: 'pointer', transition: 'background .15s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        {/* Accent line */}
        <div style={{ width: 3, height: 52, borderRadius: 2, background: status.type === 'past' ? 'rgba(255,255,255,0.12)' : accentColor, marginRight: 18, flexShrink: 0, opacity: status.type === 'past' ? 0.4 : 1 }} />

        {/* Countdown */}
        <div style={{ width: 64, flexShrink: 0, textAlign: 'center', marginRight: 18 }}>
          <div style={{ fontSize: status.label.length > 3 ? 28 : 40, fontWeight: 800, fontFamily: pf, color: labelColor, lineHeight: 1, letterSpacing: '-0.03em' }}>
            {status.label}
          </div>
          {status.sub && (
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', fontFamily: f, letterSpacing: '.12em', marginTop: 2 }}>
              {status.sub}
            </div>
          )}
        </div>

        {/* Trip info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: pf, color: status.type === 'past' ? 'rgba(255,255,255,0.4)' : '#fff', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.01em' }}>
            {trip.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: f }}>
              {trip.startDate ? `${trip.startDate.slice(5).replace('-', '/')}` : 'No date'}
              {trip.endDate ? ` → ${trip.endDate.slice(5).replace('-', '/')}` : ''}
            </span>
            {flags.length > 0 && (
              <span style={{ fontSize: 14, letterSpacing: 1 }}>{flags.slice(0, 6).join('')}</span>
            )}
          </div>
        </div>

        {/* Menu button */}
        <button
          onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); setConfirmDelete(false); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', fontSize: 18, padding: '4px 8px', borderRadius: 6, flexShrink: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
        >···</button>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginLeft: 20 }} />

      {/* Dropdown */}
      {menuOpen && (
        <>
          <div onClick={() => { setMenuOpen(false); setConfirmDelete(false); }} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
          <div style={{ position: 'absolute', top: 8, right: 16, zIndex: 20, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.6)', minWidth: 170 }}>
            {trip.isCollaborator ? (
              !confirmDelete ? (
                <button onClick={e => { e.stopPropagation(); setConfirmDelete(true); }}
                  style={{ display: 'block', width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13.5, fontFamily: f, color: '#ff453a' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,69,58,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >🚪 Leave Trip</button>
              ) : (
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: f, marginBottom: 8 }}>Leave <strong style={{ color: '#fff' }}>{trip.name}</strong>?</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={e => { e.stopPropagation(); setConfirmDelete(false); }} style={{ flex: 1, padding: '7px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: f, cursor: 'pointer' }}>Cancel</button>
                    <button onClick={e => { e.stopPropagation(); onLeave?.(); setMenuOpen(false); }} style={{ flex: 1, padding: '7px', borderRadius: 8, border: 'none', background: '#ff453a', color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: f, cursor: 'pointer' }}>Leave</button>
                  </div>
                </div>
              )
            ) : (
              <>
                <button onClick={e => { e.stopPropagation(); trip.archived ? onUnarchive?.() : onArchive?.(); setMenuOpen(false); }}
                  style={{ display: 'block', width: '100%', padding: '12px 16px', background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', textAlign: 'left', fontSize: 13.5, fontFamily: f, color: '#fff' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >{trip.archived ? '↩ Restore' : '📦 Archive'}</button>
                {!confirmDelete ? (
                  <button onClick={e => { e.stopPropagation(); setConfirmDelete(true); }}
                    style={{ display: 'block', width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13.5, fontFamily: f, color: '#ff453a' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,69,58,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >🗑 Delete</button>
                ) : (
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: f, marginBottom: 8 }}>Delete <strong style={{ color: '#fff' }}>{trip.name}</strong>?</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={e => { e.stopPropagation(); setConfirmDelete(false); }} style={{ flex: 1, padding: '7px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: f, cursor: 'pointer' }}>Cancel</button>
                      <button onClick={e => { e.stopPropagation(); onDelete?.(); setMenuOpen(false); }} style={{ flex: 1, padding: '7px', borderRadius: 8, border: 'none', background: '#ff453a', color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: f, cursor: 'pointer' }}>Delete</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { tripList, loadTrips, patchTripEntry, removeTripEntry } = useData();

  const [trips, setTrips] = useState(tripList ?? []);
  const [loading, setLoading] = useState(tripList === null);

  useEffect(() => {
    if (tripList !== null) { setTrips(tripList); setLoading(false); return; }
    let cancelled = false;
    loadTrips(user.id)
      .then(data => { if (!cancelled) { setTrips(data); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tripList]);

  const handleArchive = async id => {
    setTrips(p => p.map(t => t.id === id ? { ...t, archived: true } : t));
    patchTripEntry(id, { archived: true });
    try { await updateTripMeta(id, { archived: true }); } catch {}
  };
  const handleUnarchive = async id => {
    setTrips(p => p.map(t => t.id === id ? { ...t, archived: false } : t));
    patchTripEntry(id, { archived: false });
    try { await updateTripMeta(id, { archived: false }); } catch {}
  };
  const handleDelete = async id => {
    setTrips(p => p.filter(t => t.id !== id));
    removeTripEntry(id);
    try { await deleteTrip(id); } catch {}
  };
  const handleLeave = async id => {
    setTrips(p => p.filter(t => t.id !== id));
    removeTripEntry(id);
    try { await leaveTrip(id); } catch {}
  };

  const activeTrips = trips.filter(t => !t.archived).sort((a, b) => {
    const sa = getTripStatus(a), sb = getTripStatus(b);
    const order = { active: 0, upcoming: 1, past: 2 };
    if (order[sa.type] !== order[sb.type]) return order[sa.type] - order[sb.type];
    return (a.startDate || '').localeCompare(b.startDate || '');
  });
  const archivedTrips = trips.filter(t => t.archived).sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));
  const [archiveOpen, setArchiveOpen] = useState(false);

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
      {/* Stars background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {STARS.map((s, i) => (
          <div key={i} style={{ position: 'absolute', left: `${s.x}%`, top: `${s.y}%`, width: s.r * 2, height: s.r * 2, borderRadius: '50%', background: '#fff', opacity: s.o }} />
        ))}
      </div>

      {/* Globe hero */}
      <div style={{ position: 'relative', zIndex: 1, height: '62vh', minHeight: 320, maxHeight: 520 }}>
        <SpaceGlobe trips={trips} />

        {/* Top bar: overlaid on globe */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: f, letterSpacing: '.1em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>
            {loading ? '…' : `${activeTrips.length} ${activeTrips.length === 1 ? 'Trip' : 'Trips'}`}
          </div>
          {/* Profile button */}
          <button
            onClick={() => navigate('/profile')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            title="Passport & Settings"
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile"
                style={{ width: 36, height: 36, borderRadius: 18, objectFit: 'cover', border: '2px solid rgba(255,255,255,0.25)' }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: 18, background: 'rgba(255,255,255,0.12)', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                👤
              </div>
            )}
          </button>
        </div>

        {/* Bottom gradient fade into list */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, background: 'linear-gradient(to bottom, transparent, #000)', pointerEvents: 'none' }} />
      </div>

      {/* Trip list */}
      <div style={{ position: 'relative', zIndex: 2, background: '#000' }}>
        {/* "My Trips" header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 16px' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: pf, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
            My Trips
          </h1>
          <button
            onClick={() => navigate('/trips/new')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 22, color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: f, cursor: 'pointer', transition: 'background .15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <PlusIcon /> New Trip
          </button>
        </div>

        {/* Top divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 4 }} />

        {/* Active trips */}
        {activeTrips.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✈️</div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: pf, color: '#fff', marginBottom: 8 }}>No trips yet</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: f, marginBottom: 28, lineHeight: 1.6 }}>Plan your next adventure</div>
            <button onClick={() => navigate('/trips/new')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', background: '#fff', color: '#000', border: 'none', borderRadius: 24, fontSize: 14, fontWeight: 700, fontFamily: f, cursor: 'pointer' }}>
              <PlusIcon /> Create a trip
            </button>
          </div>
        )}

        {activeTrips.map(trip => (
          <TripRow key={trip.id} trip={trip}
            onSelect={id => navigate(`/trips/${id}`)}
            onArchive={() => handleArchive(trip.id)}
            onUnarchive={() => handleUnarchive(trip.id)}
            onDelete={() => handleDelete(trip.id)}
            onLeave={() => handleLeave(trip.id)}
          />
        ))}

        {/* Past trips */}
        {archivedTrips.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <button onClick={() => setArchiveOpen(o => !o)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontFamily: f, fontSize: 12, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
            >
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              Past Trips ({archivedTrips.length})
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" style={{ transform: archiveOpen ? 'none' : 'rotate(-90deg)', transition: 'transform .2s' }}>
                <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            </button>
            {archiveOpen && archivedTrips.map(trip => (
              <TripRow key={trip.id} trip={trip}
                onSelect={id => navigate(`/trips/${id}`)}
                onUnarchive={() => handleUnarchive(trip.id)}
                onDelete={() => handleDelete(trip.id)}
              />
            ))}
          </div>
        )}

        <div style={{ height: 60 }} />
      </div>
    </div>
  );
}
