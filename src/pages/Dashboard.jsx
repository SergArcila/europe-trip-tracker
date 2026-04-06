import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TripList from '../components/TripList';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { deleteTrip, updateTripMeta, leaveTrip } from '../lib/api';
import { SunIcon, MoonIcon } from '../components/common/Icons';
import { f } from '../utils/constants';

function ProfileButton({ profile, onClick }) {
  if (profile?.avatar_url) {
    return (
      <button onClick={onClick} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center' }} title="Profile">
        <img src={profile.avatar_url} alt="Profile" style={{ width: 26, height: 26, borderRadius: 13, objectFit: 'cover', border: '1.5px solid var(--border)' }} />
      </button>
    );
  }
  return (
    <button onClick={onClick} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: 7, transition: 'color .15s' }}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
      title="Profile">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    </button>
  );
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { tripList, loadTrips, patchTripEntry, removeTripEntry } = useData();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // If tripList is already in cache, show it immediately (no spinner)
  const [trips, setTrips] = useState(tripList ?? []);
  const [loading, setLoading] = useState(tripList === null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Sync local state whenever cache updates (e.g. after coming back from TripDetail)
    if (tripList !== null) {
      setTrips(tripList);
      setLoading(false);
      return;
    }
    // Cache miss — fetch from Supabase
    let cancelled = false;
    setLoading(true);
    loadTrips(user.id)
      .then(data => { if (!cancelled) { setTrips(data); setLoading(false); } })
      .catch(e => { if (!cancelled) { setError('Failed to load trips. Check your connection.'); setLoading(false); console.error(e); } });
    return () => { cancelled = true; };
  }, [tripList]); // re-sync when cache changes (e.g. after new trip or archive from another page)

  const handleSelectTrip = (id) => navigate(`/trips/${id}`);
  const handleCreateTrip = () => navigate('/trips/new');

  const handleArchiveTrip = async (tripId) => {
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, archived: true } : t));
    patchTripEntry(tripId, { archived: true });
    try { await updateTripMeta(tripId, { archived: true }); } catch (e) { console.error(e); }
  };

  const handleUnarchiveTrip = async (tripId) => {
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, archived: false } : t));
    patchTripEntry(tripId, { archived: false });
    try { await updateTripMeta(tripId, { archived: false }); } catch (e) { console.error(e); }
  };

  const handleDeleteTrip = async (tripId) => {
    setTrips(prev => prev.filter(t => t.id !== tripId));
    removeTripEntry(tripId);
    try { await deleteTrip(tripId); } catch (e) { console.error(e); }
  };

  const handleLeaveTrip = async (tripId) => {
    setTrips(prev => prev.filter(t => t.id !== tripId));
    removeTripEntry(tripId);
    try { await leaveTrip(tripId); } catch (e) { console.error(e); }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: f }}>Loading trips…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: '#E63946', fontFamily: f, marginBottom: 16 }}>{error}</div>
        <button onClick={() => loadTrips(user.id)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 13, fontFamily: f, cursor: 'pointer' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Sticky header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--bg)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '11px 16px', display: 'flex', alignItems: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, fontFamily: f, letterSpacing: '.05em', color: 'var(--text-secondary)', textTransform: 'uppercase', flex: 1 }}>Trips</div>
          <button
            onClick={toggleTheme}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: 7, transition: 'color .15s', marginRight: 2 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
          <ProfileButton profile={profile} onClick={() => navigate('/profile')} />
        </div>
      </div>

      <TripList
        trips={trips}
        profile={profile}
        onSelectTrip={handleSelectTrip}
        onCreateTrip={handleCreateTrip}
        onArchiveTrip={handleArchiveTrip}
        onUnarchiveTrip={handleUnarchiveTrip}
        onDeleteTrip={handleDeleteTrip}
        onLeaveTrip={handleLeaveTrip}
      />
    </>
  );
}
