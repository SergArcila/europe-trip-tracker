import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CityPage from '../components/CityPage';
import { ChevLeft, ChevRight } from '../components/common/Icons';
import { getCityDetail, syncCityDiff, getTripById } from '../lib/api';
import { f } from '../utils/constants';

export default function CityDetail() {
  const { id: tripId, cityId } = useParams();
  const navigate = useNavigate();

  const [city, setCity] = useState(null);
  const [tripCities, setTripCities] = useState([]);
  const [tripName, setTripName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cityRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      getCityDetail(cityId),
      getTripById(tripId),
    ])
      .then(([cityData, tripData]) => {
        if (!cancelled) {
          setCity(cityData);
          cityRef.current = cityData;
          setTripCities(tripData.cities || []);
          setTripName(tripData.name || '');
          setLoading(false);
          window.scrollTo(0, 0);
        }
      })
      .catch(e => {
        if (!cancelled) {
          console.error(e);
          setError('Failed to load city.');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [tripId, cityId]);

  const updateCity = useCallback((updaterFn) => {
    setCity(prev => {
      if (!prev) return prev;
      const oldCity = prev;
      const newCity = updaterFn(prev);
      cityRef.current = newCity;
      // Fire async sync (fire and forget)
      syncCityDiff(oldCity, newCity, tripId).catch(console.error);
      return newCity;
    });
  }, [tripId]);

  // City navigation
  const cityIndex = tripCities.findIndex(c => c.id === cityId);
  const prevCity = cityIndex > 0 ? tripCities[cityIndex - 1] : null;
  const nextCity = cityIndex < tripCities.length - 1 ? tripCities[cityIndex + 1] : null;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: f }}>Loading…</div>
      </div>
    );
  }

  if (error || !city) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: '#E63946', fontFamily: f }}>{error || 'City not found.'}</div>
      </div>
    );
  }

  return (
    <>
      {/* Sticky header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--bg)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 9 }}>
          <button onClick={() => navigate(`/trips/${tripId}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: '3px 0', fontSize: 12.5, fontFamily: f, gap: 3 }}>
            <ChevLeft /> {tripName}
          </button>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 3 }}>
            {prevCity && (
              <button onClick={() => navigate(`/trips/${tripId}/cities/${prevCity.id}`)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 7, padding: '3px 9px', cursor: 'pointer', fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: f, display: 'flex', alignItems: 'center', gap: 2 }}>
                <ChevLeft />{prevCity.name}
              </button>
            )}
            {nextCity && (
              <button onClick={() => navigate(`/trips/${tripId}/cities/${nextCity.id}`)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 7, padding: '3px 9px', cursor: 'pointer', fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: f, display: 'flex', alignItems: 'center', gap: 2 }}>
                {nextCity.name}<ChevRight />
              </button>
            )}
          </div>
        </div>
      </div>

      <CityPage city={city} updateCity={updateCity} />
    </>
  );
}
