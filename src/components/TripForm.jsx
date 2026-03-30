import { useState, useEffect, useRef } from 'react';
import { PlusIcon, TrashIcon, ChevLeft } from './common/Icons';
import { f, pf, COLOR_PALETTE } from '../utils/constants';

const EMOJI_OPTIONS = ['✈️','🌍','🗺️','🏖️','🏔️','🏛️','🎒','🚂','🚢','🌅','🗼','🌴'];

const emptyCity = () => {
  const id = crypto.randomUUID();
  return {
    _key: id,
    id,
    name: '', country: '', flag: '',
    startDate: '', endDate: '',
    lat: null, lng: null,
    color: COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)],
  };
};

const toFlag = code => {
  if (!code || code.length !== 2) return '📍';
  return Array.from(code.toUpperCase())
    .map(c => String.fromCodePoint(c.charCodeAt(0) - 65 + 0x1F1E6))
    .join('');
};

const fmtDate = d => {
  if (!d) return null;
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const nightsBetween = (s, e) => {
  if (!s || !e) return null;
  const n = Math.round((new Date(e + 'T00:00:00') - new Date(s + 'T00:00:00')) / 86400000);
  return n > 0 ? n : null;
};

/* ── Flight-style date range picker ── */
function DateRangePicker({ startDate, endDate, onStartChange, onEndChange, compact = false }) {
  const nights = nightsBetween(startDate, endDate);

  return (
    <div style={{ display: 'flex', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden', background: 'var(--bg-input)' }}>
      {/* Depart */}
      <div style={{ flex: 1, padding: compact ? '9px 12px' : '11px 14px', position: 'relative', cursor: 'pointer' }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 2, fontFamily: f }}>Depart</div>
        <div style={{ fontSize: compact ? 13 : 14, fontWeight: 600, color: startDate ? 'var(--text-primary)' : 'var(--text-secondary)', fontFamily: f, whiteSpace: 'nowrap' }}>
          {fmtDate(startDate) || 'Pick date'}
        </div>
        <input type="date" value={startDate} onChange={e => onStartChange(e.target.value)}
          style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 1 }} />
      </div>

      {/* Center */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 10px', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', minWidth: 44 }}>
        <span style={{ fontSize: 13 }}>✈️</span>
        {nights && <span style={{ fontSize: 9.5, color: 'var(--text-secondary)', fontFamily: f, marginTop: 1 }}>{nights}n</span>}
      </div>

      {/* Return */}
      <div style={{ flex: 1, padding: compact ? '9px 12px' : '11px 14px', position: 'relative', cursor: 'pointer' }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 2, fontFamily: f }}>Return</div>
        <div style={{ fontSize: compact ? 13 : 14, fontWeight: 600, color: endDate ? 'var(--text-primary)' : 'var(--text-secondary)', fontFamily: f, whiteSpace: 'nowrap' }}>
          {fmtDate(endDate) || 'Pick date'}
        </div>
        <input type="date" value={endDate} min={startDate || undefined} onChange={e => onEndChange(e.target.value)}
          style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 1 }} />
      </div>
    </div>
  );
}

/* ── City autocomplete (Nominatim) ── */
function CitySearch({ city, onUpdate, inputStyle, labelStyle }) {
  const [query, setQuery] = useState(city.name || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timer = useRef();
  const wrapRef = useRef();

  useEffect(() => {
    const handler = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = async q => {
    if (q.length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=7&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      // Prefer cities/towns, fall back to any place result
      const places = data.filter(r =>
        r.class === 'place' ||
        (r.class === 'boundary' && r.type === 'administrative' && parseFloat(r.importance) > 0.45)
      );
      setResults(places.slice(0, 6));
      setOpen(places.length > 0);
    } catch {}
    setLoading(false);
  };

  const handleChange = e => {
    const q = e.target.value;
    setQuery(q);
    onUpdate('name', q);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => search(q), 350);
  };

  const handleSelect = r => {
    const name = r.address?.city || r.address?.town || r.address?.village || r.address?.municipality || r.name;
    const country = r.address?.country || '';
    const code = r.address?.country_code || '';
    const flag = toFlag(code);
    setQuery(name);
    setResults([]);
    setOpen(false);
    onUpdate('name', name);
    onUpdate('country', country);
    onUpdate('flag', flag);
    onUpdate('lat', parseFloat(r.lat));
    onUpdate('lng', parseFloat(r.lon));
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <label style={labelStyle}>City *</label>
      <div style={{ position: 'relative' }}>
        <input value={query} onChange={handleChange} onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search city…" style={inputStyle} autoComplete="off" />
        {loading && (
          <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--text-secondary)', fontFamily: f }}>...</span>
        )}
      </div>

      {open && results.length > 0 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 200, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 12px 32px rgba(0,0,0,.45)' }}>
          {results.map((r, i) => {
            const name = r.address?.city || r.address?.town || r.address?.village || r.address?.municipality || r.name;
            const country = r.address?.country || '';
            const state = r.address?.state || r.address?.region || '';
            const sub = [state, country].filter(Boolean).join(', ');
            const flag = toFlag(r.address?.country_code || '');
            return (
              <button key={i}
                onMouseDown={e => { e.preventDefault(); handleSelect(r); }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', background: 'none', border: 'none', borderBottom: i < results.length - 1 ? '1px solid var(--border-light)' : 'none', cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{flag}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', fontFamily: f, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                  {sub && <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: f }}>{sub}</div>}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Main form ── */
export default function TripForm({ existingTrip, onSave, onCancel, onDelete }) {
  const isEdit = !!existingTrip;

  const [step, setStep] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [name, setName] = useState(existingTrip?.name || '');
  const [emoji, setEmoji] = useState(existingTrip?.coverEmoji || '✈️');
  const [startDate, setStartDate] = useState(existingTrip?.startDate || '');
  const [endDate, setEndDate] = useState(existingTrip?.endDate || '');
  const [cities, setCities] = useState(
    existingTrip?.cities?.map(c => ({ ...c, _key: c.id })) || [emptyCity()]
  );

  const addCity = () => setCities(p => [...p, emptyCity()]);
  const removeCity = key => setCities(p => p.filter(c => c._key !== key));
  const updateCity = (key, field, value) =>
    setCities(p => p.map(c => c._key === key ? { ...c, [field]: value } : c));

  const step1Valid = name.trim().length > 0;
  const step2Valid = cities.every(c => c.name.trim());

  const handleSubmit = () => {
    if (!step1Valid || !step2Valid) return;

    const today = new Date().toISOString().slice(0, 10);
    const shouldArchive = endDate && endDate < today;

    const newCities = cities.map(c => {
      const isNew = !existingTrip?.cities?.find(ec => ec.id === c.id);
      if (isNew) {
        return {
          id: c.id || crypto.randomUUID(),
          name: c.name.trim(),
          country: c.country.trim(),
          flag: c.flag || '📍',
          startDate: c.startDate,
          endDate: c.endDate,
          color: c.color,
          lat: c.lat || null,
          lng: c.lng || null,
          notes: '',
          categories: {
            packing:   { icon: '🧳', label: 'Packing List', items: [] },
            food:      { icon: '🍽️', label: 'Food & Drink', items: [] },
            sights:    { icon: '👁️', label: 'Sights', items: [] },
            nightlife: { icon: '🎉', label: 'Nightlife', items: [] },
          },
          schedule: [],
        };
      }
      const existing = existingTrip.cities.find(ec => ec.id === c.id);
      return { ...existing, name: c.name.trim(), country: c.country.trim(), flag: c.flag || existing.flag, startDate: c.startDate, endDate: c.endDate, color: c.color, lat: c.lat ?? existing.lat, lng: c.lng ?? existing.lng };
    });

    onSave({
      ...(existingTrip || {}),
      id: existingTrip?.id || `trip-${Date.now()}`,
      name: name.trim(),
      coverEmoji: emoji,
      startDate,
      endDate,
      archived: shouldArchive ? true : (existingTrip?.archived || false),
      cities: newCities,
      bookings: existingTrip?.bookings || [],
      transport: existingTrip?.transport || [],
      tripNotes: existingTrip?.tripNotes || '',
    });
  };

  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 14, fontFamily: f, outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: f, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 6, display: 'block' };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px 60px' }}>
      {/* Header */}
      <div style={{ padding: '20px 0 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: 0 }}>
          <ChevLeft />
        </button>
        <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: pf, color: 'var(--text-primary)', margin: 0 }}>
          {isEdit ? 'Edit Trip' : 'New Trip'}
        </h2>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 5 }}>
          {[1, 2].map(s => (
            <div key={s} style={{ width: 8, height: 8, borderRadius: 4, background: step >= s ? 'var(--text-primary)' : 'var(--border)', transition: 'background .2s' }} />
          ))}
        </div>
      </div>

      {/* ── Step 1: Trip basics ── */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={labelStyle}>Trip Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Europe Summer 2026" style={inputStyle} autoFocus
              onKeyDown={e => e.key === 'Enter' && step1Valid && setStep(2)} />
          </div>

          <div>
            <label style={labelStyle}>Cover</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {EMOJI_OPTIONS.map(e => (
                <button key={e} onClick={() => setEmoji(e)} style={{ width: 44, height: 44, borderRadius: 10, fontSize: 20, border: `2px solid ${emoji === e ? 'var(--text-primary)' : 'var(--border)'}`, background: emoji === e ? 'var(--bg-card)' : 'transparent', cursor: 'pointer', transition: 'all .15s' }}>{e}</button>
              ))}
              <input value={EMOJI_OPTIONS.includes(emoji) ? '' : emoji} onChange={e => setEmoji(e.target.value)} placeholder="✏️" style={{ ...inputStyle, width: 80, textAlign: 'center', fontSize: 20, padding: '8px' }} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Trip Dates</label>
            <DateRangePicker
              startDate={startDate} endDate={endDate}
              onStartChange={setStartDate} onEndChange={setEndDate}
            />
            {startDate && endDate && endDate < new Date().toISOString().slice(0,10) && (
              <div style={{ marginTop: 8, fontSize: 11.5, color: '#F4A261', fontFamily: f }}>
                📦 This trip will be auto-archived (dates are in the past)
              </div>
            )}
          </div>

          <button onClick={() => step1Valid && setStep(2)} style={{ padding: '13px', borderRadius: 12, background: step1Valid ? 'var(--text-primary)' : 'var(--border)', color: step1Valid ? 'var(--bg)' : 'var(--text-secondary)', border: 'none', fontSize: 14, fontWeight: 600, fontFamily: f, cursor: step1Valid ? 'pointer' : 'default', transition: 'all .15s' }}>
            Continue → Add Cities
          </button>
        </div>
      )}

      {/* ── Step 2: Cities ── */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: f }}>
            Search for each city — country, flag, and map pin will fill in automatically.
          </div>

          {cities.map((city, idx) => (
            <div key={city._key} style={{ background: 'var(--bg-card)', borderRadius: 13, padding: '14px 16px', border: `1px solid ${city.color}44` }}>
              {/* Card header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, fontFamily: f, color: 'var(--text-secondary)' }}>City {idx + 1}</span>
                  {city.flag && city.flag !== '📍' && <span style={{ fontSize: 16 }}>{city.flag}</span>}
                  {city.country && <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: f }}>{city.country}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {COLOR_PALETTE.slice(0, 6).map(col => (
                      <button key={col} onClick={() => updateCity(city._key, 'color', col)} style={{ width: 16, height: 16, borderRadius: 4, background: col, border: `2px solid ${city.color === col ? 'var(--text-primary)' : 'transparent'}`, cursor: 'pointer', padding: 0 }} />
                    ))}
                  </div>
                  {cities.length > 1 && (
                    <button onClick={() => removeCity(city._key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 2 }}>
                      <TrashIcon />
                    </button>
                  )}
                </div>
              </div>

              {/* City search */}
              <div style={{ marginBottom: 10 }}>
                <CitySearch
                  city={city}
                  onUpdate={(field, value) => updateCity(city._key, field, value)}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>

              {/* City dates */}
              <div>
                <label style={labelStyle}>City Dates <span style={{ textTransform: 'none', fontWeight: 400, opacity: 0.6 }}>(optional)</span></label>
                <DateRangePicker
                  compact
                  startDate={city.startDate} endDate={city.endDate}
                  onStartChange={v => updateCity(city._key, 'startDate', v)}
                  onEndChange={v => updateCity(city._key, 'endDate', v)}
                />
              </div>
            </div>
          ))}

          <button onClick={addCity} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px', borderRadius: 12, background: 'transparent', border: '1px dashed var(--border)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, fontFamily: f, cursor: 'pointer' }}>
            <PlusIcon /> Add another city
          </button>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setStep(1)} style={{ flex: 1, padding: '13px', borderRadius: 12, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, fontFamily: f, cursor: 'pointer' }}>
              Back
            </button>
            <button onClick={handleSubmit} style={{ flex: 2, padding: '13px', borderRadius: 12, background: step2Valid ? 'var(--text-primary)' : 'var(--border)', color: step2Valid ? 'var(--bg)' : 'var(--text-secondary)', border: 'none', fontSize: 14, fontWeight: 600, fontFamily: f, cursor: step2Valid ? 'pointer' : 'default' }}>
              {isEdit ? 'Save Changes' : 'Create Trip'}
            </button>
          </div>

          {isEdit && onDelete && (
            <div style={{ marginTop: 12, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
              {!confirmDelete ? (
                <button onClick={() => setConfirmDelete(true)} style={{ width: '100%', padding: '11px', borderRadius: 10, background: 'transparent', border: '1px solid #E6394644', color: '#E63946', fontSize: 13, fontWeight: 600, fontFamily: f, cursor: 'pointer', transition: 'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#E6394610'; e.currentTarget.style.borderColor = '#E63946'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#E6394644'; }}>
                  Delete Trip
                </button>
              ) : (
                <div style={{ background: '#E6394610', borderRadius: 10, padding: '12px 14px', border: '1px solid #E6394630' }}>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: f, fontWeight: 500, marginBottom: 10 }}>
                    Delete <strong>{existingTrip.name}</strong>? This cannot be undone.
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, fontFamily: f, cursor: 'pointer' }}>Cancel</button>
                    <button onClick={() => onDelete(existingTrip.id)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: '#E63946', color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: f, cursor: 'pointer' }}>Yes, Delete</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
