import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getProfile, upsertProfile, uploadAvatar } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { ChevLeft } from '../components/common/Icons';
import { ALL_COUNTRIES, TOTAL_COUNTRIES } from '../utils/countries';
import { getPassportStats, buildCountryStatus } from '../utils/tripHelpers';
import { f, pf } from '../utils/constants';

function Avatar({ url, name, size = 80 }) {
  if (url) return <img src={url} alt={name} style={{ width: size, height: size, borderRadius: size / 2, objectFit: 'cover', border: '2px solid var(--border)' }} />;
  return <div style={{ width: size, height: size, borderRadius: size / 2, background: 'var(--bg-card)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.4 }}>👤</div>;
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
        style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 13.5, fontFamily: f, outline: 'none', boxSizing: 'border-box' }}
      />
      {open && filtered.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, marginTop: 4, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,.4)' }}>
          {filtered.map(c => (
            <button
              key={c.code}
              onMouseDown={e => { e.preventDefault(); onSelect(c); setQuery(''); setOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--text-primary)', fontFamily: f, fontSize: 13.5 }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
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

function CitySearch({ placeholder, onSelect, countryCodes = '' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const timerRef = useRef(null);

  const search = useCallback(async (q) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({ q, format: 'json', limit: 10, 'accept-language': 'en' });
      if (countryCodes) params.set('countrycodes', countryCodes);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
      const data = await res.json();
      const seen = new Set();
      const cities = data
        .filter(d => ['city', 'town', 'village', 'municipality', 'suburb', 'administrative'].includes(d.type) || d.class === 'place')
        .map(d => ({
          name: d.name || d.display_name.split(',')[0].trim(),
          display: d.display_name,
          lat: parseFloat(d.lat),
          lng: parseFloat(d.lon),
        }))
        .filter(c => c.name && !seen.has(c.name) && seen.add(c.name))
        .slice(0, 6);
      setResults(cities);
    } catch {}
    finally { setLoading(false); }
  }, [countryCodes]);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(query), 350);
    return () => clearTimeout(timerRef.current);
  }, [query, search]);

  useEffect(() => {
    const handleClick = (e) => { if (!ref.current?.contains(e.target)) setResults([]); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 13.5, fontFamily: f, outline: 'none', boxSizing: 'border-box' }}
        />
        {loading && (
          <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--text-secondary)', pointerEvents: 'none' }}>…</div>
        )}
      </div>
      {results.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, marginTop: 4, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,.4)' }}>
          {results.map((c, i) => (
            <button
              key={i}
              onMouseDown={e => { e.preventDefault(); onSelect(c); setQuery(''); setResults([]); }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 8, width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--text-primary)', fontFamily: f }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <span style={{ fontSize: 14, marginTop: 1 }}>📍</span>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>{c.display.split(',').slice(1, 3).join(',').trim()}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const { tripList, loadTrips, clearCache } = useData();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [homeCountry, setHomeCountry] = useState(null);
  const [homeCity, setHomeCity] = useState(null);      // { name, lat, lng }
  const [countriesVisited, setCountriesVisited] = useState([]);
  const [profileCities, setProfileCities] = useState([]); // [{ name, country, lat, lng }]
  const [trips, setTrips] = useState(tripList ?? []);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingCountries, setSavingCountries] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

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
      if (profile?.home_city) setHomeCity(profile.home_city);
      if (profile?.countries_visited?.length) {
        const visited = profile.countries_visited
          .map(n => ALL_COUNTRIES.find(c => c.name === n))
          .filter(Boolean);
        setCountriesVisited(visited);
      }
      if (profile?.profile_cities?.length) {
        setProfileCities(profile.profile_cities);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user.id]);

  const handleSaveName = async () => {
    setSaving(true); setError('');
    try {
      await upsertProfile(user.id, { name: name.trim() });
      await refreshProfile(user.id);
      setEditing(false);
    } catch { setError('Failed to save. Try again.'); }
    finally { setSaving(false); }
  };

  const saveAll = async (newHome, newHomeCity, newVisited, newCities) => {
    setSavingCountries(true);
    try {
      await upsertProfile(user.id, {
        home_country: newHome?.name || null,
        home_city: newHomeCity || null,
        countries_visited: newVisited.map(c => c.name),
        profile_cities: newCities,
      });
      await refreshProfile(user.id);
    } catch (e) {
      console.error('saveAll error:', e);
      setError('Failed to save. Try again.');
    }
    finally { setSavingCountries(false); }
  };

  const handleSetHome = (country) => {
    setHomeCountry(country);
    // Clear home city when country changes
    setHomeCity(null);
    saveAll(country, null, countriesVisited, profileCities);
  };

  const handleSetHomeCity = (city) => {
    setHomeCity(city);
    saveAll(homeCountry, city, countriesVisited, profileCities);
  };

  const handleAddVisited = (country) => {
    const next = [...countriesVisited.filter(c => c.name !== country.name), country];
    setCountriesVisited(next);
    saveAll(homeCountry, homeCity, next, profileCities);
  };

  const handleRemoveVisited = (cname) => {
    const next = countriesVisited.filter(c => c.name !== cname);
    // Also remove any cities for that country
    const nextCities = profileCities.filter(c => c.country !== cname);
    setCountriesVisited(next);
    setProfileCities(nextCities);
    saveAll(homeCountry, homeCity, next, nextCities);
  };

  const handleAddCity = (city, countryName, countryFlag) => {
    const newCity = {
      name: city.name,
      country: countryName,
      flag: countryFlag,
      lat: city.lat,
      lng: city.lng,
    };
    const next = [...profileCities.filter(c => !(c.name === city.name && c.country === countryName)), newCity];
    setProfileCities(next);
    saveAll(homeCountry, homeCity, countriesVisited, next);
  };

  const handleRemoveCity = (cityName, countryName) => {
    const next = profileCities.filter(c => !(c.name === cityName && c.country === countryName));
    setProfileCities(next);
    saveAll(homeCountry, homeCity, countriesVisited, next);
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
    } catch (e) { setError('Upload failed. Make sure the avatars storage bucket exists and is public.'); console.error(e); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const handleLogout = async () => { clearCache(); await supabase.auth.signOut(); navigate('/login'); };

  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 14, fontFamily: f, outline: 'none', boxSizing: 'border-box' };

  const excludeFromVisited = [
    ...(homeCountry ? [homeCountry.name] : []),
    ...countriesVisited.map(c => c.name),
  ];

  // Combine all sources for stats — only count past (already visited) trip countries
  const tripStats = getPassportStats(trips);
  const countryStatus = buildCountryStatus(trips); // date-aware: 'past' | 'upcoming'
  const pastTripCountries = tripStats.countries.filter(name => countryStatus[name] === 'past');

  const allVisitedNames = new Set([
    ...(homeCountry ? [homeCountry.name] : []),
    ...countriesVisited.map(c => c.name),
    ...pastTripCountries,
  ]);
  const totalVisited = allVisitedNames.size;
  const worldPct = Math.round((totalVisited / TOTAL_COUNTRIES) * 100);

  // Only count cities from past trips
  const pastTripCities = tripStats.cities.filter(c => countryStatus[c.country || c.name] === 'past');
  const allCityNames = new Set([
    ...(homeCity ? [homeCity.name] : []),
    ...profileCities.map(c => c.name),
    ...pastTripCities.map(c => c.name),
  ]);
  const totalCities = allCityNames.size;

  // Countries with cities breakdown
  const allCountriesWithCities = [
    ...(homeCountry ? [{ ...homeCountry, isHome: true }] : []),
    ...countriesVisited.map(c => ({ ...c, isHome: false })),
  ];

  return (
    <>
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--bg)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 9 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: '3px 0', fontSize: 12.5, fontFamily: f, gap: 3 }}>
            <ChevLeft /> Back
          </button>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 14, fontWeight: 700, fontFamily: f, letterSpacing: '.05em', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Profile</div>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px 60px' }}>
        {/* Avatar + name hero */}
        <div style={{ padding: '28px 0 20px', textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 14 }}>
            <Avatar url={avatarUrl} name={name} size={80} />
            <button onClick={handleAvatarClick} disabled={uploading} style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, background: 'var(--text-primary)', color: 'var(--bg)', border: '2px solid var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, cursor: 'pointer', opacity: uploading ? 0.5 : 1 }} title="Change photo">
              {uploading ? '…' : '+'}
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
          <h1 style={{ fontSize: 22, fontWeight: 700, fontFamily: pf, color: 'var(--text-primary)', margin: '0 0 2px', letterSpacing: '-0.02em' }}>
            {loading ? '…' : name || 'Traveler'}
          </h1>
          {homeCountry && (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: f, marginBottom: 2 }}>
              {homeCountry.flag} {homeCity ? `${homeCity.name}, ` : ''}{homeCountry.name}
            </div>
          )}
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: f }}>{user.email}</div>
          {uploading && <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: f, marginTop: 6 }}>Uploading…</div>}
        </div>

        {error && <div style={{ fontSize: 12, color: '#E63946', fontFamily: f, textAlign: 'center', marginBottom: 12 }}>{error}</div>}

        {/* Travel stats */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 13, border: '1px solid var(--border)', padding: '16px', marginBottom: 12 }}>
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 36, fontWeight: 800, fontFamily: pf, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>{worldPct}%</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontFamily: f, marginTop: 4 }}>of the world explored · {totalVisited} of {TOTAL_COUNTRIES} countries</div>
            <div style={{ marginTop: 10, height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${worldPct}%`, height: '100%', background: 'linear-gradient(90deg, #1a6aaa, #2e86de)', borderRadius: 3, transition: 'width .4s ease' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 14 }}>
            {[
              { label: 'Trips', value: tripStats.trips },
              { label: 'Countries', value: totalVisited },
              { label: 'Cities', value: totalCities },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: 'center', padding: '10px 0', background: 'var(--border)', borderRadius: 10 }}>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: pf, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{value}</div>
                <div style={{ fontSize: 10.5, color: 'var(--text-secondary)', fontFamily: f, marginTop: 2, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Display name */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 13, border: '1px solid var(--border)', padding: '16px', marginBottom: 12 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: f, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 10 }}>Display Name</div>
          {editing ? (
            <div>
              <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditing(false); }} style={inputStyle} autoFocus />
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button onClick={() => setEditing(false)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, fontFamily: f, cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSaveName} disabled={saving} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: 'var(--text-primary)', color: 'var(--bg)', fontSize: 13, fontWeight: 600, fontFamily: f, cursor: 'pointer' }}>{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, color: 'var(--text-primary)', fontFamily: f }}>{name || 'Not set'}</span>
              <button onClick={() => setEditing(true)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 7, padding: '5px 12px', cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)', fontFamily: f }}>Edit</button>
            </div>
          )}
        </div>

        {/* Home Country + Home City */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 13, border: '1px solid var(--border)', padding: '16px', marginBottom: 12 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: f, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 10 }}>Home</div>
          {homeCountry ? (
            <>
              {/* Country row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{homeCountry.flag}</span>
                  <div>
                    <div style={{ fontSize: 13.5, color: 'var(--text-primary)', fontFamily: f, fontWeight: 600 }}>{homeCountry.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: f }}>Home country</div>
                  </div>
                </div>
                <button onClick={() => { setHomeCountry(null); setHomeCity(null); saveAll(null, null, countriesVisited, profileCities); }} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 7, padding: '5px 12px', cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)', fontFamily: f }}>Change</button>
              </div>
              {/* Home city */}
              <div style={{ paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: f, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 8 }}>Hometown</div>
                {homeCity ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>🏠</span>
                      <span style={{ fontSize: 13.5, color: 'var(--text-primary)', fontFamily: f }}>{homeCity.name}</span>
                    </div>
                    <button onClick={() => { setHomeCity(null); saveAll(homeCountry, null, countriesVisited, profileCities); }} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 7, padding: '5px 12px', cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)', fontFamily: f }}>Change</button>
                  </div>
                ) : (
                  <CitySearch
                    placeholder={`Search a city in ${homeCountry.name}…`}
                    onSelect={handleSetHomeCity}
                    countryCodes={homeCountry.code.toLowerCase()}
                  />
                )}
              </div>
            </>
          ) : (
            <CountrySearch placeholder="Search your home country…" onSelect={handleSetHome} exclude={excludeFromVisited} />
          )}
        </div>

        {/* Countries visited */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 13, border: '1px solid var(--border)', padding: '16px', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: f, letterSpacing: '.04em', textTransform: 'uppercase' }}>
              Countries Visited
            </div>
            {savingCountries && <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: f }}>Saving…</span>}
          </div>
          {countriesVisited.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {countriesVisited.map(c => {
                const citiesForCountry = profileCities.filter(pc => pc.country === c.name);
                return (
                  <div key={c.code} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: 'var(--border)', borderRadius: 20, fontSize: 12.5, color: 'var(--text-primary)', fontFamily: f }}>
                    <span style={{ fontSize: 16 }}>{c.flag}</span>
                    <span>{c.name}</span>
                    {citiesForCountry.length > 0 && (
                      <span style={{ fontSize: 10.5, color: 'var(--text-secondary)', marginLeft: 2 }}>· {citiesForCountry.length}</span>
                    )}
                    <button onClick={() => handleRemoveVisited(c.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1, padding: '0 0 0 2px', display: 'flex', alignItems: 'center' }}>×</button>
                  </div>
                );
              })}
            </div>
          )}
          <CountrySearch placeholder="Add a country…" onSelect={handleAddVisited} exclude={excludeFromVisited} />
          {countriesVisited.length === 0 && (
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontFamily: f, marginTop: 10, textAlign: 'center', opacity: 0.6 }}>
              Add countries you've visited outside of your trips
            </div>
          )}
        </div>

        {/* Cities visited (per country) */}
        {allCountriesWithCities.length > 0 && (
          <div style={{ background: 'var(--bg-card)', borderRadius: 13, border: '1px solid var(--border)', padding: '16px', marginBottom: 12 }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: f, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 14 }}>
              Cities Visited
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {allCountriesWithCities.map(country => {
                const citiesForCountry = country.isHome
                  ? (homeCity ? [{ name: homeCity.name, country: country.name, lat: homeCity.lat, lng: homeCity.lng, isHome: true }] : [])
                  : profileCities.filter(c => c.country === country.name);
                const excludeNames = citiesForCountry.map(c => c.name);

                return (
                  <div key={country.code}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                      <span style={{ fontSize: 15 }}>{country.flag}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', fontFamily: f }}>{country.name}</span>
                      {country.isHome && <span style={{ fontSize: 10, color: '#22c55e', fontFamily: f, fontWeight: 600, background: '#22c55e22', padding: '2px 6px', borderRadius: 10 }}>HOME</span>}
                    </div>

                    {/* Existing cities */}
                    {citiesForCountry.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                        {citiesForCountry.map((city, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: country.isHome && city.isHome ? '#22c55e18' : 'var(--border)', border: country.isHome && city.isHome ? '1px solid #22c55e44' : 'none', borderRadius: 20, fontSize: 12.5, color: 'var(--text-primary)', fontFamily: f }}>
                            <span style={{ fontSize: 13 }}>{country.isHome && city.isHome ? '🏠' : '📍'}</span>
                            <span>{city.name}</span>
                            {!(country.isHome && city.isHome) && (
                              <button onClick={() => handleRemoveCity(city.name, country.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1, padding: '0 0 0 2px', display: 'flex', alignItems: 'center' }}>×</button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* City search for this country */}
                    {!country.isHome && (
                      <CitySearch
                        placeholder={`Add a city in ${country.name}…`}
                        onSelect={(city) => handleAddCity(city, country.name, country.flag)}
                        countryCodes={country.code.toLowerCase()}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Email */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 13, border: '1px solid var(--border)', padding: '16px', marginBottom: 12 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: f, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 8 }}>Email</div>
          <div style={{ fontSize: 14, color: 'var(--text-primary)', fontFamily: f }}>{user.email}</div>
        </div>

        {/* Appearance */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 13, border: '1px solid var(--border)', padding: '16px', marginBottom: 24 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: f, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 10 }}>Appearance</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, color: 'var(--text-primary)', fontFamily: f }}>{isDark ? '🌙 Dark mode' : '☀️ Light mode'}</span>
            <button onClick={toggleTheme} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 7, padding: '5px 12px', cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)', fontFamily: f }}>Toggle</button>
          </div>
        </div>

        <button onClick={handleLogout}
          style={{ width: '100%', padding: '13px', borderRadius: 12, border: '1px solid #E6394644', background: 'transparent', color: '#E63946', fontSize: 14, fontWeight: 600, fontFamily: f, cursor: 'pointer', transition: 'all .15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#E6394610'; e.currentTarget.style.borderColor = '#E63946'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#E6394644'; }}
        >Log Out</button>
      </div>
    </>
  );
}
