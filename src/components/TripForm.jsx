import { useState } from 'react';
import { PlusIcon, TrashIcon, ChevLeft } from './common/Icons';
import { f, pf, COLOR_PALETTE } from '../utils/constants';

const EMOJI_OPTIONS = ['✈️','🌍','🗺️','🏖️','🏔️','🏛️','🎒','🚂','🚢','🌅','🗼','🌴'];

const emptyCity = () => ({
  _key: Date.now() + Math.random(),
  name: '',
  country: '',
  flag: '',
  startDate: '',
  endDate: '',
  color: COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)],
});

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
  const removeCity = (key) => setCities(p => p.filter(c => c._key !== key));
  const updateCity = (key, field, value) =>
    setCities(p => p.map(c => c._key === key ? { ...c, [field]: value } : c));

  const step1Valid = name.trim().length > 0;
  const step2Valid = cities.every(c => c.name.trim());

  const handleSubmit = () => {
    if (!step1Valid || !step2Valid) return;

    const newCities = cities.map(c => {
      const isNew = !existingTrip?.cities?.find(ec => ec.id === c.id);
      if (isNew) {
        return {
          id: c.id || `city-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: c.name.trim(),
          country: c.country.trim(),
          flag: c.flag.trim() || '📍',
          startDate: c.startDate,
          endDate: c.endDate,
          color: c.color,
          notes: '',
          categories: {
            packing: { icon: '🧳', label: 'Packing List', items: [] },
            food: { icon: '🍽️', label: 'Food & Drink', items: [] },
            sights: { icon: '👁️', label: 'Sights', items: [] },
            nightlife: { icon: '🎉', label: 'Nightlife', items: [] },
          },
          schedule: [],
        };
      }
      // Preserve existing city data, only update metadata
      const existing = existingTrip.cities.find(ec => ec.id === c.id);
      return { ...existing, name: c.name.trim(), country: c.country.trim(), flag: c.flag.trim() || existing.flag, startDate: c.startDate, endDate: c.endDate, color: c.color };
    });

    const trip = {
      ...(existingTrip || {}),
      id: existingTrip?.id || `trip-${Date.now()}`,
      name: name.trim(),
      coverEmoji: emoji,
      startDate,
      endDate,
      cities: newCities,
      bookings: existingTrip?.bookings || [],
      transport: existingTrip?.transport || [],
      tripNotes: existingTrip?.tripNotes || '',
    };

    onSave(trip);
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    borderRadius: 9, border: '1px solid var(--border)',
    background: 'var(--bg-input)',
    color: 'var(--text-primary)',
    fontSize: 14, fontFamily: f, outline: 'none',
    boxSizing: 'border-box',
  };

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
        {/* Step indicator */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 5 }}>
          {[1, 2].map(s => (
            <div key={s} style={{ width: 8, height: 8, borderRadius: 4, background: step >= s ? 'var(--text-primary)' : 'var(--border)', transition: 'background .2s' }} />
          ))}
        </div>
      </div>

      {/* Step 1: Trip basics */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={labelStyle}>Trip Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Europe Trip 2025" style={inputStyle} autoFocus />
          </div>

          <div>
            <label style={labelStyle}>Cover Emoji</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {EMOJI_OPTIONS.map(e => (
                <button key={e} onClick={() => setEmoji(e)} style={{
                  width: 44, height: 44, borderRadius: 10, fontSize: 20,
                  border: `2px solid ${emoji === e ? 'var(--text-primary)' : 'var(--border)'}`,
                  background: emoji === e ? 'var(--bg-card)' : 'transparent',
                  cursor: 'pointer', transition: 'all .15s',
                }}>{e}</button>
              ))}
              <input
                value={EMOJI_OPTIONS.includes(emoji) ? '' : emoji}
                onChange={e => setEmoji(e.target.value)}
                placeholder="or type"
                style={{ ...inputStyle, width: 80, textAlign: 'center', fontSize: 20, padding: '8px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <button onClick={() => step1Valid && setStep(2)} style={{
            padding: '13px', borderRadius: 12,
            background: step1Valid ? 'var(--text-primary)' : 'var(--border)',
            color: step1Valid ? 'var(--bg)' : 'var(--text-secondary)',
            border: 'none', fontSize: 14, fontWeight: 600, fontFamily: f,
            cursor: step1Valid ? 'pointer' : 'default',
            transition: 'all .15s',
          }}>
            Continue → Add Cities
          </button>
        </div>
      )}

      {/* Step 2: Cities */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: f }}>
            Add the cities you'll visit. You can add items and schedules from the trip view.
          </div>

          {cities.map((city, idx) => (
            <div key={city._key} style={{ background: 'var(--bg-card)', borderRadius: 13, padding: '14px 16px', border: `1px solid ${city.color}44` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600, fontFamily: f, color: 'var(--text-secondary)' }}>City {idx + 1}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* Color palette */}
                  <div style={{ display: 'flex', gap: 4 }}>
                    {COLOR_PALETTE.slice(0, 6).map(col => (
                      <button key={col} onClick={() => updateCity(city._key, 'color', col)} style={{
                        width: 18, height: 18, borderRadius: 5, background: col, border: `2px solid ${city.color === col ? 'var(--text-primary)' : 'transparent'}`, cursor: 'pointer', padding: 0,
                      }} />
                    ))}
                  </div>
                  {cities.length > 1 && (
                    <button onClick={() => removeCity(city._key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 2 }}>
                      <TrashIcon />
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={labelStyle}>City Name *</label>
                  <input value={city.name} onChange={e => updateCity(city._key, 'name', e.target.value)} placeholder="Paris" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Country</label>
                  <input value={city.country} onChange={e => updateCity(city._key, 'country', e.target.value)} placeholder="France" style={inputStyle} />
                </div>
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={labelStyle}>Flag Emoji</label>
                <input value={city.flag} onChange={e => updateCity(city._key, 'flag', e.target.value)} placeholder="🇫🇷" style={{ ...inputStyle, fontSize: 18 }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Arrival</label>
                  <input type="date" value={city.startDate} onChange={e => updateCity(city._key, 'startDate', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Departure</label>
                  <input type="date" value={city.endDate} onChange={e => updateCity(city._key, 'endDate', e.target.value)} style={inputStyle} />
                </div>
              </div>
            </div>
          ))}

          {/* Add city button */}
          <button onClick={addCity} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '11px', borderRadius: 12,
            background: 'transparent',
            border: '1px dashed var(--border)',
            color: 'var(--text-secondary)',
            fontSize: 13, fontWeight: 500, fontFamily: f,
            cursor: 'pointer',
          }}>
            <PlusIcon /> Add another city
          </button>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setStep(1)} style={{ flex: 1, padding: '13px', borderRadius: 12, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, fontFamily: f, cursor: 'pointer' }}>
              Back
            </button>
            <button onClick={handleSubmit} style={{
              flex: 2, padding: '13px', borderRadius: 12,
              background: step2Valid ? 'var(--text-primary)' : 'var(--border)',
              color: step2Valid ? 'var(--bg)' : 'var(--text-secondary)',
              border: 'none', fontSize: 14, fontWeight: 600, fontFamily: f,
              cursor: step2Valid ? 'pointer' : 'default',
            }}>
              {isEdit ? 'Save Changes' : 'Create Trip'}
            </button>
          </div>

          {/* Delete trip — edit mode only */}
          {isEdit && onDelete && (
            <div style={{ marginTop: 12, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
              {!confirmDelete ? (
                <button onClick={() => setConfirmDelete(true)} style={{
                  width: '100%', padding: '11px', borderRadius: 10,
                  background: 'transparent', border: '1px solid #E6394644',
                  color: '#E63946', fontSize: 13, fontWeight: 600, fontFamily: f,
                  cursor: 'pointer', transition: 'all .15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#E6394610'; e.currentTarget.style.borderColor = '#E63946'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#E6394644'; }}
                >
                  Delete Trip
                </button>
              ) : (
                <div style={{ background: '#E6394610', borderRadius: 10, padding: '12px 14px', border: '1px solid #E6394630' }}>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: f, fontWeight: 500, marginBottom: 10 }}>
                    Delete <strong>{existingTrip.name}</strong>? This cannot be undone.
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, fontFamily: f, cursor: 'pointer' }}>
                      Cancel
                    </button>
                    <button onClick={() => onDelete(existingTrip.id)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: '#E63946', color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: f, cursor: 'pointer' }}>
                      Yes, Delete
                    </button>
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
