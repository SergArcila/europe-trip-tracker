import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPublicProfile, getPublicTrips, getFollowCounts, checkIsFollowing } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import PassportView from '../components/PassportView';
import FollowButton from '../components/FollowButton';
import { ChevLeft } from '../components/common/Icons';
import { f, pf } from '../utils/constants';
import { ALL_COUNTRIES } from '../utils/countries';

function Avatar({ url, name, size = 72 }) {
  if (url) return <img src={url} alt={name} style={{ width: size, height: size, borderRadius: size / 2, objectFit: 'cover', border: '2px solid var(--border)' }} />;
  return <div style={{ width: size, height: size, borderRadius: size / 2, background: 'var(--bg-card)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.4 }}>👤</div>;
}

export default function PublicProfile() {
  const { username } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [trips, setTrips] = useState([]);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    getPublicProfile(username)
      .then(async (p) => {
        if (cancelled) return;
        setProfile(p);

        const [tripsData, countsData, followingState] = await Promise.all([
          getPublicTrips(p.id),
          getFollowCounts(p.id),
          user ? checkIsFollowing(p.id) : Promise.resolve(false),
        ]);

        if (cancelled) return;
        setTrips(tripsData);
        setCounts(countsData);
        setIsFollowing(followingState);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e.code === 'PGRST116' ? 'User not found.' : 'Failed to load profile.');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [username, user]);

  const homeCountryObj = profile?.home_country
    ? ALL_COUNTRIES.find(c => c.name === profile.home_country)
    : null;

  const isOwnProfile = user && profile && user.id === profile.id;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: f }}>Loading…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
        <div style={{ fontSize: 32 }}>🌎</div>
        <div style={{ fontSize: 15, color: 'var(--text-primary)', fontFamily: f, fontWeight: 600 }}>{error}</div>
        <button onClick={() => navigate('/')} style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: f, background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 16px', cursor: 'pointer' }}>Go home</button>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Nav */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--bg)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 9 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: '3px 0', fontSize: 12.5, fontFamily: f, gap: 3 }}>
            <ChevLeft /> Back
          </button>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: f }}>@{profile.username}</div>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px 60px' }}>
        {/* Hero */}
        <div style={{ padding: '28px 0 20px', textAlign: 'center' }}>
          <Avatar url={profile.avatar_url} name={profile.name} size={72} />
          <h1 style={{ fontSize: 22, fontWeight: 700, fontFamily: pf, color: 'var(--text-primary)', margin: '14px 0 4px', letterSpacing: '-0.02em' }}>
            {profile.name || profile.username}
          </h1>
          {homeCountryObj && (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: f, marginBottom: 2 }}>
              {homeCountryObj.flag} {profile.home_city?.name ? `${profile.home_city.name}, ` : ''}{homeCountryObj.name}
            </div>
          )}
          {profile.bio && (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: f, marginTop: 6, maxWidth: 320, margin: '6px auto 0' }}>
              {profile.bio}
            </div>
          )}

          {/* Follow counts */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 17, fontWeight: 700, fontFamily: pf, color: 'var(--text-primary)' }}>{counts.followers}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: f }}>Followers</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 17, fontWeight: 700, fontFamily: pf, color: 'var(--text-primary)' }}>{counts.following}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: f }}>Following</div>
            </div>
          </div>

          {/* Follow/Edit button */}
          <div style={{ marginTop: 14 }}>
            {isOwnProfile ? (
              <button
                onClick={() => navigate('/profile')}
                style={{ padding: '8px 20px', borderRadius: 20, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, fontFamily: f, cursor: 'pointer' }}
              >
                Edit Profile
              </button>
            ) : user ? (
              <FollowButton
                targetUserId={profile.id}
                initialIsFollowing={isFollowing}
                onFollowChange={(delta) => setCounts(c => ({ ...c, followers: c.followers + delta }))}
              />
            ) : (
              <button
                onClick={() => navigate('/login')}
                style={{ padding: '8px 20px', borderRadius: 20, border: 'none', background: 'var(--text-primary)', color: 'var(--bg)', fontSize: 13, fontWeight: 600, fontFamily: f, cursor: 'pointer' }}
              >
                Sign in to follow
              </button>
            )}
          </div>
        </div>

        {/* Passport view — reused exactly */}
        <PassportView trips={trips} profile={profile} />
      </div>
    </div>
  );
}
