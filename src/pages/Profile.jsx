import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ComposableMap, Geographies, Geography, Marker, Graticule, Sphere } from 'react-simple-maps';
import { supabase } from '../lib/supabase';
import { getProfile, updateProfile, uploadAvatar } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { getPassportStats, getAllYears } from '../utils/tripHelpers';
import { ALL_COUNTRIES, TOTAL_COUNTRIES } from '../utils/countries';
import { f, pf } from '../utils/constants';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const STARS = Array.from({ length: 140 }, (_, i) => ({
  x: ((i * 137.508) % 100),
  y: ((i * 97.3) % 100),
  r: i % 5 === 0 ? 1.5 : i % 3 === 0 ? 1.1 : 0.7,
  o: 0.3 + (i % 7) * 0.1,
}));

function PassportGlobe({ trips }) {
  const [rotation, setRotation] = useState([20, -25, 0]);
  const [scale, setScale] = useState(200);
  const isDragging = useRef(false);
  const dragStart = useRef(null);
  const mapRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const tick = () => {
      if (!isDragging.current) setRotation(r => [r[0] - 0.03, r[1], r[2]]);
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
      setScale(s => Math.max(120, Math.min(800, s - e.deltaY * 0.5)));
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
      style={{ width: '100%', height: '100%', cursor: 'grab', userSelect: 'none', touchAction: 'none' }}
    >
      <ComposableMap
        projection="geoOrthographic"
        projectionConfig={{ rotate: rotation, scale }}
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <radialGradient id="pgEarthGrad" cx="38%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#1a3a5c" />
            <stop offset="60%" stopColor="#0d1f35" />
            <stop offset="100%" stopColor="#050d1a" />
          </radialGradient>
          <radialGradient id="pgAtmGrad" cx="50%" cy="50%" r="50%">
            <stop offset="78%" stopColor="transparent" stopOpacity="0" />
            <stop offset="92%" stopColor="#4a90d9" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6ab4ff" stopOpacity="0.15" />
          </radialGradient>
          <filter id="pgCityGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <Sphere fill="url(#pgEarthGrad)" stroke="#1e3a5f" strokeWidth={0.5} />
        <Sphere fill="url(#pgAtmGrad)" stroke="none" />
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
            <circle r={12} fill={city.tripColor + '12'} />
            <circle r={5} fill={city.tripColor + '30'} />
            <circle r={3} fill={city.tripColor} filter="url(#pgCityGlow)" opacity={0.9} />
            <circle r={1.2} fill="#fff" opacity={0.85} />
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
}

function CountrySearch({ placeholder, onSelect, exclude = [] }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const filtered = query.length < 1 ? [] : ALL_COUNTRIES
    .filter(c => !exclude.includes(c.name) && c.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 8);

  useEffect(() => {
    const handleClick = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: 13.5, fontFamily: f, outline: 'none', boxSizing: 'border-box' }}
      />
      {open && filtered.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, marginTop: 4, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,.7)' }}>
          {filtered.map(c => (
            <button
              key={c.code}
              onMouseDown={e => { e.preventDefault(); onSelect(c); setQuery(''); setOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: '#fff', fontFamily: f, fontSize: 13.5 }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <span style={{ fontSize: 18 }}>{c.flag}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const { tripList, loadTrips } = useData();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [trips, setTrips] = useState(tripList ?? []);
  const [selectedYear, setSelectedYear] = useState(null);

  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [homeCountry, setHomeCountry] = useState(null);
  const [countriesVisited, setCountriesVisited] = useState([]);
  const [editingName, setEditingName] = useState(false);
  const [showHomeSearch, setShowHomeSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingCountries, setSavingCountries] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tripList !== null) { setTrips(tripList); return; }
    loadTrips(user.id).then(setTrips).catch(() => {});
  }, [tripList]);

  useEffect(() => {
    getProfile(user.id).then(profile => {
      setName(profile?.name || '');
      setAvatarUrl(profile?.avatar_url || null);
      if (profile?.home_country) {
        const found = ALL_COUNTRIES.find(c => c.name === profile.home_country);
        if (found) setHomeCountry(found);
      }
      if (profile?.countries_visited?.length) {
        const visited = profile.countries_visited
          .map(n => ALL_COUNTRIES.find(c => c.name === n))
          .filter(Boolean);
        setCountriesVisited(visited);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user.id]);

  const saveCountries = async (newHome, newVisited) => {
    setSavingCountries(true);
    try {
      await updateProfile(user.id, {
        home_country: newHome?.name || null,
        countries_visited: newVisited.map(c => c.name),
      });
    } catch (e) { console.error(e); }
    finally { setSavingCountries(false); }
  };

  const handleSaveName = async () => {
    setSaving(true); setError('');
    try {
      await updateProfile(user.id, { name: name.trim() });
      await refreshProfile(user.id);
      setEditingName(false);
    } catch { setError('Failed to save.'); }
    finally { setSaving(false); }
  };

  const handleSetHome = (country) => {
    setHomeCountry(country);
    setShowHomeSearch(false);
    saveCountries(country, countriesVisited);
  };

  const handleAddVisited = (country) => {
    const next = [...countriesVisited.filter(c => c.name !== country.name), country];
    setCountriesVisited(next);
    saveCountries(homeCountry, next);
  };

  const handleRemoveVisited = (cname) => {
    const next = countriesVisited.filter(c => c.name !== cname);
    setCountriesVisited(next);
    saveCountries(homeCountry, next);
  };

  const handleAvatarClick = () => fileRef.current?.click();
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5 MB.'); return; }
    setUploading(true); setError('');
    try {
      const url = await uploadAvatar(user.id, file);
      setAvatarUrl(url);
      await refreshProfile(user.id);
    } catch (e) { setError('Upload failed.'); console.error(e); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/login'); };

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const years = getAllYears(trips);
  const stats = getPassportStats(trips, selectedYear);

  const totalVisited = new Set([
    ...(homeCountry ? [homeCountry.name] : []),
    ...countriesVisited.map(c => c.name),
    ...stats.countries,
  ]).size;
  const worldPct = Math.round((totalVisited / TOTAL_COUNTRIES) * 100);

  const excludeFromVisited = [
    ...(homeCountry ? [homeCountry.name] : []),
    ...countriesVisited.map(c => c.name),
  ];

  const sectionLabel = {
    fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)',
    fontFamily: f, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12,
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
      {/* Stars */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {STARS.map((s, i) => (
          <div key={i} style={{ position: 'absolute', left: `${s.x}%`, top: `${s.y}%`, width: s.r * 2, height: s.r * 2, borderRadius: '50%', background: '#fff', opacity: s.o }} />
        ))}
      </div>

      {/* Globe hero */}
      <div style={{ position: 'relative', zIndex: 1, height: '52vh', minHeight: 280, maxHeight: 440 }}>
        <PassportGlobe trips={trips} />

        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, padding: '6px 14px', color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: f, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, backdropFilter: 'blur(10px)' }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
        >
          ‹ Back
        </button>

        {/* Bottom gradient */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to bottom, transparent, #000)', pointerEvents: 'none' }} />

        {/* Avatar centered at bottom of globe */}
        <div style={{ position: 'absolute', bottom: -32, left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}>
          <div style={{ position: 'relative' }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={name}
                style={{ width: 72, height: 72, borderRadius: 36, objectFit: 'cover', border: '3px solid #000', display: 'block' }} />
            ) : (
              <div style={{ width: 72, height: 72, borderRadius: 36, background: 'rgba(255,255,255,0.1)', border: '3px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                👤
              </div>
            )}
            <button onClick={handleAvatarClick} disabled={uploading}
              style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, background: '#fff', color: '#000', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}
            >{uploading ? '…' : '+'}</button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
        </div>
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, paddingTop: 48 }}>
        {/* Name + email */}
        <div style={{ textAlign: 'center', padding: '0 20px 24px' }}>
          <div style={{ fontSize: 22, fontWeight: 800, fontFamily: pf, letterSpacing: '-0.02em', marginBottom: 3 }}>
            {loading ? '…' : name || 'Traveler'}
          </div>
          {homeCountry && (
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontFamily: f, marginBottom: 2 }}>
              {homeCountry.flag} {homeCountry.name}
            </div>
          )}
          <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.3)', fontFamily: f }}>{user.email}</div>
          {error && <div style={{ fontSize: 12, color: '#ff453a', fontFamily: f, marginTop: 6 }}>{error}</div>}
        </div>

        {/* Year tabs */}
        {years.length > 0 && (
          <div style={{ display: 'flex', gap: 6, padding: '0 20px 20px', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {[null, ...years].map(y => (
              <button key={y ?? 'all'} onClick={() => setSelectedYear(y)}
                style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 20, border: selectedYear === y ? 'none' : '1px solid rgba(255,255,255,0.15)', background: selectedYear === y ? '#fff' : 'transparent', color: selectedYear === y ? '#000' : 'rgba(255,255,255,0.55)', fontSize: 12.5, fontWeight: 600, fontFamily: f, cursor: 'pointer', transition: 'all .15s' }}
              >{y ?? 'All Time'}</button>
            ))}
          </div>
        )}

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, margin: '0 20px 24px', background: 'rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
          {[
            { label: 'Trips', value: stats.trips },
            { label: 'Countries', value: totalVisited },
            { label: 'Cities', value: stats.uniqueCities },
            { label: 'World', value: `${worldPct}%` },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.04)', padding: '16px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, fontFamily: pf, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.35)', fontFamily: f, marginTop: 4, letterSpacing: '.05em', textTransform: 'uppercase' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Countries visited */}
        <div style={{ padding: '0 20px 24px' }}>
          <div style={sectionLabel}>Countries Visited</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {homeCountry && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: 'rgba(255,255,255,0.12)', borderRadius: 20, fontSize: 12.5, fontFamily: f }}>
                <span style={{ fontSize: 15 }}>{homeCountry.flag}</span>
                <span>{homeCountry.name}</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginLeft: 2 }}>🏠</span>
              </div>
            )}
            {countriesVisited.map(c => (
              <div key={c.code} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: 'rgba(255,255,255,0.08)', borderRadius: 20, fontSize: 12.5, fontFamily: f }}>
                <span style={{ fontSize: 15 }}>{c.flag}</span>
                <span>{c.name}</span>
                <button onClick={() => handleRemoveVisited(c.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 14, lineHeight: 1, padding: '0 0 0 2px', display: 'flex', alignItems: 'center' }}>×</button>
              </div>
            ))}
            {savingCountries && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: f, alignSelf: 'center' }}>Saving…</span>}
          </div>
          <div style={{ marginTop: 10 }}>
            <CountrySearch placeholder="Add a country…" onSelect={handleAddVisited} exclude={excludeFromVisited} />
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 0 24px' }} />

        {/* Settings */}
        <div style={{ padding: '0 20px 80px' }}>
          <div style={sectionLabel}>Settings</div>

          {/* Display name */}
          <div style={{ marginBottom: 10 }}>
            {editingName ? (
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: f, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>Display Name</div>
                <input
                  value={name} onChange={e => setName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: 14, fontFamily: f, outline: 'none', boxSizing: 'border-box' }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button onClick={() => setEditingName(false)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 13, fontFamily: f, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={handleSaveName} disabled={saving} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: '#fff', color: '#000', fontSize: 13, fontWeight: 600, fontFamily: f, cursor: 'pointer' }}>{saving ? 'Saving…' : 'Save'}</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setEditingName(true)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 16px', cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: f, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 3 }}>Display Name</div>
                  <div style={{ fontSize: 14, color: '#fff', fontFamily: f }}>{name || 'Not set'}</div>
                </div>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: f }}>Edit ›</span>
              </button>
            )}
          </div>

          {/* Home country */}
          <div style={{ marginBottom: 10 }}>
            {showHomeSearch ? (
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: f, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>Home Country</div>
                <CountrySearch placeholder="Search country…" onSelect={handleSetHome} exclude={excludeFromVisited} />
                <button onClick={() => setShowHomeSearch(false)} style={{ marginTop: 8, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontFamily: f, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
              </div>
            ) : (
              <button onClick={() => setShowHomeSearch(true)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 16px', cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: f, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 3 }}>Home Country</div>
                  <div style={{ fontSize: 14, color: '#fff', fontFamily: f }}>
                    {homeCountry ? `${homeCountry.flag} ${homeCountry.name}` : 'Not set'}
                  </div>
                </div>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: f }}>Edit ›</span>
              </button>
            )}
          </div>

          {/* Theme toggle */}
          <div style={{ marginBottom: 10 }}>
            <button onClick={toggleTheme}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 16px', cursor: 'pointer', textAlign: 'left' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: f, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 3 }}>Appearance</div>
                <div style={{ fontSize: 14, color: '#fff', fontFamily: f }}>{isDark ? '🌙 Dark' : '☀️ Light'}</div>
              </div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: f }}>Toggle ›</span>
            </button>
          </div>

          {/* Log out */}
          <button onClick={handleLogout}
            style={{ width: '100%', padding: '14px', borderRadius: 14, border: '1px solid rgba(255,69,58,0.3)', background: 'transparent', color: '#ff453a', fontSize: 14, fontWeight: 600, fontFamily: f, cursor: 'pointer', marginTop: 8, transition: 'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,69,58,0.1)'; e.currentTarget.style.borderColor = '#ff453a'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,69,58,0.3)'; }}
          >Log Out</button>
        </div>
      </div>
    </div>
  );
}
