import { useState } from 'react';
import { tripProgress, formatDateRange, tripDays } from '../utils/tripHelpers';
import { f, pf } from '../utils/constants';

function MemberAvatar({ member, size = 26, overlap = false }) {
  const style = {
    width: size, height: size, borderRadius: size / 2,
    border: '2px solid var(--bg-card)',
    background: 'var(--bg-input)',
    objectFit: 'cover',
    flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: size * 0.4,
    marginLeft: overlap ? -(size * 0.35) : 0,
    overflow: 'hidden',
  };
  if (member.avatarUrl) {
    return <img src={member.avatarUrl} alt={member.displayName} title={member.displayName} style={{ ...style, display: 'block' }} />;
  }
  return (
    <div title={member.displayName} style={style}>
      👤
    </div>
  );
}

function AvatarStack({ members, maxShow = 4 }) {
  const visible = members.slice(0, maxShow);
  const rest = members.length - maxShow;
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {visible.map((m, i) => (
        <div key={m.userId} style={{ marginLeft: i === 0 ? 0 : -9, zIndex: visible.length - i, position: 'relative' }}>
          <MemberAvatar member={m} size={26} />
        </div>
      ))}
      {rest > 0 && (
        <div style={{ marginLeft: -9, width: 26, height: 26, borderRadius: 13, background: 'var(--border)', border: '2px solid var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'var(--text-secondary)', fontFamily: f }}>
          +{rest}
        </div>
      )}
    </div>
  );
}

export default function TripCard({ trip, onClick, archived = false, onArchive, onUnarchive, onDelete, onLeave }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { t, d, pct: progress } = tripProgress(trip);
  const dateStr = formatDateRange(trip.startDate, trip.endDate);
  const days = tripDays(trip);
  const hasCities = trip.cities.length > 0;

  // Unique countries (deduplicated by country name)
  const countryMap = new Map();
  for (const c of trip.cities) {
    const key = c.country || c.name;
    if (key && !countryMap.has(key)) countryMap.set(key, c.flag || '📍');
  }
  const countries = [...countryMap.entries()];
  const gradientColors = trip.cities.map(c => c.color).join(',');

  // All members: owner first, then collaborators
  const allMembers = [
    ...(trip.owner ? [trip.owner] : []),
    ...(trip.members || []),
  ];

  const closeMenu = () => { setMenuOpen(false); setConfirmDelete(false); };
  const handleMenuToggle = (e) => { e.stopPropagation(); menuOpen ? closeMenu() : setMenuOpen(true); };
  const handleDelete = (e) => { e.stopPropagation(); if (!confirmDelete) { setConfirmDelete(true); return; } onDelete?.(); closeMenu(); };
  const handleArchive = (e) => { e.stopPropagation(); archived ? onUnarchive?.() : onArchive?.(); closeMenu(); };

  return (
    <div style={{ position: 'relative' }}>
      <div onClick={onClick} style={{
        display: 'flex', flexDirection: 'column',
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 16, cursor: 'pointer', textAlign: 'left',
        transition: 'all .2s', overflow: 'hidden', width: '100%',
        opacity: archived ? 0.7 : 1, filter: archived ? 'saturate(0.5)' : 'none',
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'; e.currentTarget.style.opacity = '1'; e.currentTarget.style.filter = 'none'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.opacity = archived ? '0.7' : '1'; e.currentTarget.style.filter = archived ? 'saturate(0.5)' : 'none'; }}
      >
        {/* Top color strip */}
        <div style={{ height: 4, width: '100%', background: hasCities ? `linear-gradient(90deg,${gradientColors})` : 'var(--border)' }} />

        <div style={{ padding: '16px 18px 16px' }}>
          {/* Top row: emoji + name + badges + menu */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
            <div style={{ fontSize: 30, lineHeight: 1, flexShrink: 0 }}>{trip.coverEmoji || '✈️'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: pf, color: 'var(--text-primary)', letterSpacing: '-0.01em', marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trip.name}</div>
              {/* Stat line */}
              <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: f, lineHeight: 1.4 }}>
                {dateStr || 'No dates set'}
                {days > 0 ? ` · ${days}d` : ''}
                {countries.length > 0 ? ` · ${countries.length} ${countries.length === 1 ? 'country' : 'countries'}` : ''}
                {` · ${trip.cities.length} ${trip.cities.length === 1 ? 'city' : 'cities'}`}
                {t > 0 ? ` · ${t} items` : ''}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              {archived && <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--border)', padding: '3px 7px', borderRadius: 8, fontFamily: f }}>PAST</span>}
              {trip.isCollaborator && <span style={{ fontSize: 10, fontWeight: 600, color: '#457B9D', background: '#457B9D18', padding: '3px 7px', borderRadius: 8, fontFamily: f }}>👥</span>}
              <button onClick={handleMenuToggle} style={{ background: menuOpen ? 'var(--border)' : 'transparent', border: 'none', borderRadius: 7, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 16, flexShrink: 0, transition: 'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
                onMouseLeave={e => { if (!menuOpen) e.currentTarget.style.background = 'transparent'; }}>···</button>
            </div>
          </div>

          {/* Bottom row: country flags left · member avatars right */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {countries.map(([country, flag]) => (
                <span key={country} title={country} style={{ fontSize: 18, lineHeight: 1 }}>{flag}</span>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {t > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 52, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: hasCities ? `linear-gradient(90deg,${gradientColors})` : '#457B9D', borderRadius: 2, transition: 'width .35s ease' }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: trip.cities[0]?.color || 'var(--text-secondary)', fontFamily: f }}>{progress}%</span>
                </div>
              )}
              {allMembers.length > 0 && <AvatarStack members={allMembers} />}
            </div>
          </div>
        </div>
      </div>

      {/* Dropdown menu */}
      {menuOpen && (
        <>
          <div onClick={closeMenu} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
          <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.25)', minWidth: 160 }}>
            {trip.isCollaborator ? (
              !confirmDelete ? (
                <button onClick={e => { e.stopPropagation(); setConfirmDelete(true); }} style={{ display: 'block', width: '100%', padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13.5, fontFamily: f, color: '#E63946', transition: 'background .1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#E6394610'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>🚪 Leave Trip</button>
              ) : (
                <div style={{ padding: '10px 14px' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: f, marginBottom: 8 }}>Leave <strong style={{ color: 'var(--text-primary)' }}>{trip.name}</strong>?</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={e => { e.stopPropagation(); setConfirmDelete(false); }} style={{ flex: 1, padding: '6px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, fontFamily: f, cursor: 'pointer' }}>Cancel</button>
                    <button onClick={e => { e.stopPropagation(); onLeave?.(); closeMenu(); }} style={{ flex: 1, padding: '6px', borderRadius: 7, border: 'none', background: '#E63946', color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: f, cursor: 'pointer' }}>Leave</button>
                  </div>
                </div>
              )
            ) : (
              <>
                <button onClick={handleArchive} style={{ display: 'block', width: '100%', padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13.5, fontFamily: f, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', transition: 'background .1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>{archived ? '↩ Restore Trip' : '📦 Archive Trip'}</button>
                {!confirmDelete ? (
                  <button onClick={handleDelete} style={{ display: 'block', width: '100%', padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13.5, fontFamily: f, color: '#E63946', transition: 'background .1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#E6394610'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>🗑 Delete Trip</button>
                ) : (
                  <div style={{ padding: '10px 14px' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: f, marginBottom: 8 }}>Delete <strong style={{ color: 'var(--text-primary)' }}>{trip.name}</strong>?</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={e => { e.stopPropagation(); setConfirmDelete(false); }} style={{ flex: 1, padding: '6px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, fontFamily: f, cursor: 'pointer' }}>Cancel</button>
                      <button onClick={handleDelete} style={{ flex: 1, padding: '6px', borderRadius: 7, border: 'none', background: '#E63946', color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: f, cursor: 'pointer' }}>Delete</button>
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
