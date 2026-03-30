import { useState } from 'react';
import { tripProgress, formatDateRange, tripDays } from '../utils/tripHelpers';
import { f, pf } from '../utils/constants';

export default function TripCard({ trip, onClick, archived = false, onArchive, onUnarchive, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { t, d, pct: progress } = tripProgress(trip);
  const dateStr = formatDateRange(trip.startDate, trip.endDate);
  const days = tripDays(trip);
  const gradientColors = trip.cities.map(c => c.color).join(',');
  const hasCities = trip.cities.length > 0;

  const closeMenu = () => { setMenuOpen(false); setConfirmDelete(false); };

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    if (menuOpen) { closeMenu(); } else { setMenuOpen(true); }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (!confirmDelete) { setConfirmDelete(true); return; }
    onDelete?.();
    closeMenu();
  };

  const handleArchive = (e) => {
    e.stopPropagation();
    archived ? onUnarchive?.() : onArchive?.();
    closeMenu();
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Card */}
      <div onClick={onClick} style={{
        display: 'flex', flexDirection: 'column',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all .2s',
        overflow: 'hidden',
        width: '100%',
        opacity: archived ? 0.7 : 1,
        filter: archived ? 'saturate(0.5)' : 'none',
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'; e.currentTarget.style.opacity = '1'; e.currentTarget.style.filter = 'none'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.opacity = archived ? '0.7' : '1'; e.currentTarget.style.filter = archived ? 'saturate(0.5)' : 'none'; }}
      >
        {/* Top color strip */}
        <div style={{ height: 4, width: '100%', background: hasCities ? `linear-gradient(90deg,${gradientColors})` : 'var(--border)' }} />

        <div style={{ padding: '18px 18px 16px' }}>
          {/* Emoji + name + menu button */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 32, lineHeight: 1, flexShrink: 0 }}>{trip.coverEmoji || '✈️'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: pf, color: 'var(--text-primary)', letterSpacing: '-0.01em', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trip.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: f }}>
                {dateStr || 'No dates set'}{days > 0 ? ` · ${days}d` : ''}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              {archived && (
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--border)', padding: '3px 7px', borderRadius: 8, fontFamily: f }}>PAST</span>
              )}
              {/* ··· menu trigger */}
              <button
                onClick={handleMenuToggle}
                style={{ background: menuOpen ? 'var(--border)' : 'transparent', border: 'none', borderRadius: 7, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 16, flexShrink: 0, transition: 'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
                onMouseLeave={e => { if (!menuOpen) e.currentTarget.style.background = 'transparent'; }}
              >
                ···
              </button>
            </div>
          </div>

          {/* City flags row */}
          {hasCities && (
            <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
              {trip.cities.map(c => (
                <span key={c.id} title={c.name} style={{ fontSize: 15 }}>{c.flag || '📍'}</span>
              ))}
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: f, alignSelf: 'center', marginLeft: 2 }}>{trip.cities.length} {trip.cities.length === 1 ? 'city' : 'cities'}</span>
            </div>
          )}

          {/* Progress */}
          {t > 0 ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 11, fontFamily: f, color: 'var(--text-secondary)' }}>
                <span>{d}/{t} items</span>
                <span style={{ fontWeight: 700, color: trip.cities[0]?.color || 'var(--text-primary)' }}>{progress}%</span>
              </div>
              <div style={{ width: '100%', height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: hasCities ? `linear-gradient(90deg,${gradientColors})` : '#457B9D', borderRadius: 2, transition: 'width .35s ease' }} />
              </div>
            </>
          ) : (
            <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: f }}>No items yet — tap to add</div>
          )}
        </div>
      </div>

      {/* Dropdown menu */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div onClick={closeMenu} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
          <div style={{
            position: 'absolute', top: 12, right: 12, zIndex: 20,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            minWidth: 160,
          }}>
            <button onClick={handleArchive} style={{
              display: 'block', width: '100%', padding: '11px 16px',
              background: 'none', border: 'none', cursor: 'pointer',
              textAlign: 'left', fontSize: 13.5, fontFamily: f,
              color: 'var(--text-primary)', borderBottom: '1px solid var(--border)',
              transition: 'background .1s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              {archived ? '↩ Restore Trip' : '📦 Archive Trip'}
            </button>

            {!confirmDelete ? (
              <button onClick={handleDelete} style={{
                display: 'block', width: '100%', padding: '11px 16px',
                background: 'none', border: 'none', cursor: 'pointer',
                textAlign: 'left', fontSize: 13.5, fontFamily: f, color: '#E63946',
                transition: 'background .1s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#E6394610'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                🗑 Delete Trip
              </button>
            ) : (
              <div style={{ padding: '10px 14px' }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: f, marginBottom: 8 }}>
                  Delete <strong style={{ color: 'var(--text-primary)' }}>{trip.name}</strong>?
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={e => { e.stopPropagation(); setConfirmDelete(false); }} style={{ flex: 1, padding: '6px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, fontFamily: f, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button onClick={handleDelete} style={{ flex: 1, padding: '6px', borderRadius: 7, border: 'none', background: '#E63946', color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: f, cursor: 'pointer' }}>
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
