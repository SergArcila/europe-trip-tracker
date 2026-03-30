import { useState, useEffect, useCallback } from 'react';
import { ChevLeft, ChevRight, EditIcon } from './components/common/Icons';
import TripList from './components/TripList';
import TripView from './components/TripView';
import CityPage from './components/CityPage';
import TripForm from './components/TripForm';
import { DEFAULT_TRIPS } from './data/defaultTrips';
import { loadTrips, saveTrips } from './utils/storage';
import { f, pf } from './utils/constants';

export default function App() {
  const [trips, setTrips] = useState(() => loadTrips(DEFAULT_TRIPS));
  const [view, setView] = useState('list'); // 'list' | 'trip' | 'city' | 'create' | 'edit'
  const [activeTripId, setActiveTripId] = useState(null);
  const [activeCityId, setActiveCityId] = useState(null);

  // Persist on every change
  useEffect(() => { saveTrips(trips); }, [trips]);

  // Scroll to top on view change
  useEffect(() => { window.scrollTo(0, 0); }, [view, activeCityId]);

  const updateTrip = useCallback((tripId, updater) => {
    setTrips(prev => prev.map(t => t.id === tripId ? updater(t) : t));
  }, []);

  const activeTrip = trips.find(t => t.id === activeTripId);
  const activeCity = activeTrip?.cities.find(c => c.id === activeCityId);

  // City navigation
  const cityIndex = activeTrip?.cities.findIndex(c => c.id === activeCityId) ?? -1;
  const prevCity = cityIndex > 0 ? activeTrip.cities[cityIndex - 1] : null;
  const nextCity = cityIndex < (activeTrip?.cities.length ?? 0) - 1 ? activeTrip.cities[cityIndex + 1] : null;

  const updateCity = useCallback((cityId, tripId, updaterFn) => {
    setTrips(prev => prev.map(t => t.id === tripId
      ? { ...t, cities: t.cities.map(c => c.id === cityId ? updaterFn(c) : c) }
      : t
    ));
  }, []);

  const handleSaveTrip = (trip) => {
    setTrips(prev => {
      const exists = prev.find(t => t.id === trip.id);
      return exists ? prev.map(t => t.id === trip.id ? trip : t) : [...prev, trip];
    });
    setActiveTripId(trip.id);
    setView('trip');
  };

  const handleDeleteTrip = (tripId) => {
    setTrips(prev => prev.filter(t => t.id !== tripId));
    setView('list');
    setActiveTripId(null);
  };

  const handleArchiveTrip = (tripId) => {
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, archived: true } : t));
    setView('list');
    setActiveTripId(null);
  };

  const handleUnarchiveTrip = (tripId) => {
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, archived: false } : t));
  };

  const goToList = () => { setView('list'); setActiveTripId(null); setActiveCityId(null); };
  const goToTrip = () => { setView('trip'); setActiveCityId(null); };

  return (
    <>
      <style>{`
        :root {
          --bg: #0F1115;
          --bg-card: #1A1D23;
          --bg-input: #22252B;
          --text-primary: #F0EDE8;
          --text-secondary: #8B8A88;
          --border: #2A2D33;
          --border-light: #1F2228;
        }
        @media (prefers-color-scheme: light) {
          :root {
            --bg: #FAFAF8;
            --bg-card: #FFFFFF;
            --bg-input: #F5F5F3;
            --text-primary: #1A1A1A;
            --text-secondary: #777;
            --border: #E8E8E5;
            --border-light: #F0F0ED;
          }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
        input::placeholder { color: var(--text-secondary); opacity: .6; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
      `}</style>

      <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text-primary)', fontFamily: f }}>
        {/* Sticky header */}
        <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--bg)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(20px)' }}>
          <div style={{ maxWidth: 600, margin: '0 auto', padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 9 }}>

            {/* List view header */}
            {view === 'list' && (
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: f, letterSpacing: '.05em', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Trips</div>
            )}

            {/* Create/Edit header */}
            {(view === 'create' || view === 'edit') && (
              <div style={{ fontSize: 14, fontWeight: 600, fontFamily: f, color: 'var(--text-secondary)' }}>
                {view === 'create' ? 'New Trip' : 'Edit Trip'}
              </div>
            )}

            {/* Trip overview header */}
            {view === 'trip' && activeTrip && (
              <>
                <button onClick={goToList} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: '3px 0', fontSize: 12.5, fontFamily: f, gap: 3 }}>
                  <ChevLeft /> All Trips
                </button>
                <div style={{ flex: 1 }} />
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {activeTrip.archived ? (
                    <button onClick={() => handleUnarchiveTrip(activeTripId)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 7, padding: '4px 10px', cursor: 'pointer', fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: f }}>
                      Restore
                    </button>
                  ) : (
                    <button onClick={() => handleArchiveTrip(activeTripId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 12, fontFamily: f, padding: '3px 4px' }}>
                      Archive
                    </button>
                  )}
                  <button onClick={() => setView('edit')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5, fontFamily: f }}>
                    <EditIcon /> Edit
                  </button>
                </div>
              </>
            )}

            {/* City view header */}
            {view === 'city' && activeTrip && activeCity && (
              <>
                <button onClick={goToTrip} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: '3px 0', fontSize: 12.5, fontFamily: f, gap: 3 }}>
                  <ChevLeft /> {activeTrip.name}
                </button>
                <div style={{ flex: 1 }} />
                <div style={{ display: 'flex', gap: 3 }}>
                  {prevCity && (
                    <button onClick={() => setActiveCityId(prevCity.id)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 7, padding: '3px 9px', cursor: 'pointer', fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: f, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <ChevLeft />{prevCity.name}
                    </button>
                  )}
                  {nextCity && (
                    <button onClick={() => setActiveCityId(nextCity.id)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 7, padding: '3px 9px', cursor: 'pointer', fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: f, display: 'flex', alignItems: 'center', gap: 2 }}>
                      {nextCity.name}<ChevRight />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Views */}
        {view === 'list' && (
          <TripList
            trips={trips}
            onSelectTrip={id => { setActiveTripId(id); setView('trip'); }}
            onCreateTrip={() => setView('create')}
            onArchiveTrip={handleArchiveTrip}
            onUnarchiveTrip={handleUnarchiveTrip}
            onDeleteTrip={handleDeleteTrip}
          />
        )}

        {view === 'create' && (
          <TripForm onSave={handleSaveTrip} onCancel={goToList} />
        )}

        {view === 'edit' && activeTrip && (
          <TripForm
            existingTrip={activeTrip}
            onSave={handleSaveTrip}
            onCancel={goToTrip}
            onDelete={handleDeleteTrip}
          />
        )}

        {view === 'trip' && activeTrip && (
          <TripView
            trip={activeTrip}
            updateTrip={(updater) => updateTrip(activeTripId, updater)}
            onSelectCity={cityId => { setActiveCityId(cityId); setView('city'); }}
          />
        )}

        {view === 'city' && activeTrip && activeCity && (
          <CityPage
            city={activeCity}
            updateCity={(updaterFn) => updateCity(activeCityId, activeTripId, updaterFn)}
          />
        )}
      </div>
    </>
  );
}
