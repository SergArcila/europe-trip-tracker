import { useState, useEffect, useRef, useCallback, useMemo, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { ComposableMap, Geographies, Geography, Marker, Graticule, Sphere } from 'react-simple-maps';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { deleteTrip, updateTripMeta, leaveTrip } from '../lib/api';
import { PlusIcon, ChevDown } from '../components/common/Icons';
import TripCard from '../components/TripCard';
import PassportView from '../components/PassportView';
import { f, pf } from '../utils/constants';
import { COUNTRY_NUMERIC_CODES } from '../utils/countries';
import { buildCountryStatus } from '../utils/tripHelpers';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';


function SpaceGlobe({ trips, profile }) {
  // Build date-aware code → status map (past / upcoming), plus profile countries as 'past'
  const codeStatus = useMemo(() => {
    const countryStatus = buildCountryStatus(trips); // { countryName → 'past'|'upcoming' }
    // Home country always shown as 'home' (green), manually visited as 'past'
    if (profile?.home_country) {
      countryStatus[profile.home_country] = 'home';
    }
    (profile?.countries_visited || []).forEach(n => {
      if (!countryStatus[n]) countryStatus[n] = 'past';
    });
    // Convert name→status to numericCode→status
    const result = {};
    for (const [name, s] of Object.entries(countryStatus)) {
      const code = COUNTRY_NUMERIC_CODES[name];
      if (code) result[code] = s;
    }
    return result;
  }, [trips, profile]);
  const [rotation, setRotation] = useState([-10, -30, 0]);
  const [scale, setScale] = useState(220);
  const isDragging = useRef(false);
  const dragStart = useRef(null);
  const mapRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const tick = () => {
      if (!isDragging.current) {
        startTransition(() => {
          setRotation(r => [r[0] - 0.04, r[1], r[2]]);
        });
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

  const markers = useMemo(() => [
    // Trip cities
    ...trips.flatMap(t => t.cities.filter(c => c.lat && c.lng).map(c => ({ ...c, tripColor: c.color || '#4fc3f7' }))),
    // Profile home city (green)
    ...(profile?.home_city?.lat ? [{ ...profile.home_city, tripColor: '#22c55e' }] : []),
    // Profile manually-added cities (light blue)
    ...(profile?.profile_cities || []).filter(c => c.lat && c.lng).map(c => ({ ...c, tripColor: '#4fc3f7' })),
  ], [trips, profile]);

  return (
    <div
      ref={mapRef}
      onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onMouseUp}
      style={{ width: '100%', height: '100%', cursor: 'grab', userSelect: 'none', touchAction: 'none', background: '#000' }}
    >
      <ComposableMap
        projection="geoOrthographic"
        projectionConfig={{ rotate: rotation, scale }}
        style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}
      >
        <defs>
          {/* Ocean: deep navy with lighter lit-side */}
          <radialGradient id="earthGrad" cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#1c3d6e" />
            <stop offset="40%" stopColor="#0e2347" />
            <stop offset="100%" stopColor="#04111f" />
          </radialGradient>
          {/* Atmospheric glow around edge */}
          <radialGradient id="atmGrad" cx="50%" cy="50%" r="50%">
            <stop offset="76%" stopColor="transparent" stopOpacity="0" />
            <stop offset="90%" stopColor="#4488cc" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#66aaff" stopOpacity="0.12" />
          </radialGradient>
          <filter id="cityGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <Sphere fill="url(#earthGrad)" stroke="#1e3f6a" strokeWidth={0.5} />
        <Sphere fill="url(#atmGrad)" stroke="none" />
        <Graticule stroke="#0a1e38" strokeWidth={0.35} />
        <Geographies geography={GEO_URL}>
          {({ geographies }) => geographies.map(geo => {
            const s = codeStatus[String(geo.id)];
            // home = green, past = bright blue, upcoming = muted blue, unvisited = dark land
            const fill = s === 'home' ? '#22c55e' : s === 'past' ? '#2e86de' : s === 'upcoming' ? '#1a4a7a' : '#0d2240';
            const stroke = s === 'home' ? '#2ed573' : s === 'past' ? '#3a9af0' : s === 'upcoming' ? '#1e508a' : '#0a1c34';
            return (
              <Geography key={geo.rsmKey} geography={geo}
                fill={fill}
                stroke={stroke}
                strokeWidth={s ? 0.5 : 0.3}
                style={{ default: { outline: 'none' }, hover: { outline: 'none' }, pressed: { outline: 'none' } }}
              />
            );
          })}
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

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { tripList, loadTrips, patchTripEntry, removeTripEntry } = useData();

  const [trips, setTrips] = useState(tripList ?? []);
  const [loading, setLoading] = useState(tripList === null);
  const [archiveOpen, setArchiveOpen] = useState(false);

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

  const ownedActive = trips.filter(t => !t.archived && !t.isCollaborator);
  const collaborating = trips.filter(t => !t.archived && t.isCollaborator);
  const archived = trips
    .filter(t => t.archived)
    .sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      {/* Globe hero */}
      <div style={{ position: 'relative', zIndex: 1, height: '58vh', minHeight: 300, maxHeight: 500 }}>
        <SpaceGlobe trips={trips} profile={profile} />
        {/* Bottom gradient fade into content */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to bottom, transparent, var(--bg))', pointerEvents: 'none' }} />
      </div>

      {/* Content — switches to theme-aware background */}
      <div style={{ position: 'relative', zIndex: 2, background: 'var(--bg)', paddingBottom: 60 }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px' }}>

          {/* Header: My Trips + avatar + New Trip */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0 20px' }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: pf, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>My Trips</h1>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: f, marginTop: 3 }}>
                {loading ? '…' : `${ownedActive.length} active${collaborating.length > 0 ? ` · ${collaborating.length} shared` : ''}${archived.length > 0 ? ` · ${archived.length} past` : ''}`}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Planning canvas */}
              <button
                onClick={() => navigate('/planning')}
                style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', padding: '7px 12px', flexShrink: 0, fontSize: 13, fontFamily: f, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}
                title="Trip Planning Canvas"
              >
                ✏️
              </button>
              {/* Social feed */}
              <button
                onClick={() => navigate('/feed')}
                style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', padding: '7px 12px', flexShrink: 0, fontSize: 13, fontFamily: f, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}
                title="Social Feed"
              >
                👥
              </button>
              {/* Profile avatar */}
              <button
                onClick={() => navigate('/profile')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
                title="Passport & Profile"
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile"
                    style={{ width: 36, height: 36, borderRadius: 18, objectFit: 'cover', border: '2px solid var(--border)' }} />
                ) : (
                  <div style={{ width: 36, height: 36, borderRadius: 18, background: 'var(--bg-card)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                    👤
                  </div>
                )}
              </button>
              {/* New Trip */}
              <button onClick={() => navigate('/trips/new')} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 16px',
                background: 'var(--text-primary)', color: 'var(--bg)',
                border: 'none', borderRadius: 10,
                fontSize: 13, fontWeight: 600, fontFamily: f,
                cursor: 'pointer', transition: 'opacity .15s', flexShrink: 0,
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <PlusIcon /> New Trip
              </button>
            </div>
          </div>

          {/* Active trips */}
          {ownedActive.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ownedActive.map(trip => (
                <TripCard
                  key={trip.id} trip={trip}
                  onClick={() => navigate(`/trips/${trip.id}`)}
                  onArchive={() => handleArchive(trip.id)}
                  onDelete={() => handleDelete(trip.id)}
                />
              ))}
            </div>
          ) : collaborating.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✈️</div>
              <div style={{ fontSize: 18, fontWeight: 600, fontFamily: pf, color: 'var(--text-primary)', marginBottom: 8 }}>No trips planned</div>
              <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', fontFamily: f, marginBottom: 28, lineHeight: 1.5 }}>
                Plan your next adventure with a beautiful,<br />interactive itinerary.
              </div>
              <button onClick={() => navigate('/trips/new')} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 24px',
                background: 'var(--text-primary)', color: 'var(--bg)',
                border: 'none', borderRadius: 12,
                fontSize: 14, fontWeight: 600, fontFamily: f, cursor: 'pointer',
              }}>
                <PlusIcon /> Create your first trip
              </button>
            </div>
          ) : null}

          {/* Shared / Collaborating trips */}
          {collaborating.length > 0 && (
            <div style={{ marginTop: ownedActive.length > 0 ? 32 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: 11.5, fontWeight: 600, fontFamily: f, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  👥 Shared with you
                </span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {collaborating.map(trip => (
                  <TripCard
                    key={trip.id} trip={trip}
                    onClick={() => navigate(`/trips/${trip.id}`)}
                    onLeave={() => handleLeave(trip.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Past Trips / Archive */}
          {archived.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <button onClick={() => setArchiveOpen(o => !o)} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', padding: '8px 0',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-secondary)', marginBottom: 12,
              }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: 11.5, fontWeight: 600, fontFamily: f, letterSpacing: '.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  Past Trips ({archived.length})
                </span>
                <ChevDown up={archiveOpen} />
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </button>
              {archiveOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {archived.map(trip => (
                    <TripCard
                      key={trip.id} trip={trip} archived
                      onClick={() => navigate(`/trips/${trip.id}`)}
                      onUnarchive={() => handleUnarchive(trip.id)}
                      onDelete={() => handleDelete(trip.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Passport section */}
          <PassportView trips={trips} profile={profile} />
        </div>
      </div>
    </div>
  );
}
