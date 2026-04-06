import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFeed, searchUsers, checkIsFollowing, followUser, unfollowUser } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import FeedEventCard from '../components/FeedEventCard';
import { ChevLeft } from '../components/common/Icons';
import { f, pf } from '../utils/constants';
import { ALL_COUNTRIES } from '../utils/countries';

function Avatar({ url, name, size = 44 }) {
  if (url) return <img src={url} alt={name} style={{ width: size, height: size, borderRadius: size / 2, objectFit: 'cover', border: '1.5px solid var(--border)', flexShrink: 0 }} />;
  return <div style={{ width: size, height: size, borderRadius: size / 2, background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, flexShrink: 0 }}>👤</div>;
}

function UserResult({ user: u, currentUserId }) {
  const navigate = useNavigate();
  const [following, setFollowing] = useState(null);
  const [loading, setLoading] = useState(false);
  const homeCountry = u.home_country ? ALL_COUNTRIES.find(c => c.name === u.home_country) : null;

  useEffect(() => {
    if (u.id === currentUserId) return;
    checkIsFollowing(u.id).then(setFollowing).catch(() => setFollowing(false));
  }, [u.id, currentUserId]);

  const toggle = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      if (following) { await unfollowUser(u.id); setFollowing(false); }
      else { await followUser(u.id); setFollowing(true); }
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <div
      onClick={() => u.username && navigate(`/u/${u.username}`)}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-card)', borderRadius: 13, border: '1px solid var(--border)', cursor: u.username ? 'pointer' : 'default' }}
    >
      <Avatar url={u.avatar_url} name={u.name} size={44} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', fontFamily: f, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name || u.username}</div>
        {u.username && <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: f }}>@{u.username}</div>}
        {homeCountry && <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: f }}>{homeCountry.flag} {homeCountry.name}</div>}
      </div>
      {u.id !== currentUserId && following !== null && (
        <button
          onClick={toggle}
          disabled={loading}
          style={{ padding: '6px 14px', borderRadius: 20, border: following ? '1px solid var(--border)' : 'none', background: following ? 'transparent' : 'var(--text-primary)', color: following ? 'var(--text-secondary)' : 'var(--bg)', fontSize: 12, fontWeight: 600, fontFamily: f, cursor: 'pointer', opacity: loading ? 0.5 : 1, flexShrink: 0 }}
        >
          {loading ? '…' : following ? 'Following' : 'Follow'}
        </button>
      )}
    </div>
  );
}

export default function Feed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('feed'); // 'feed' | 'discover'
  const [events, setEvents] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const loadFeed = useCallback(async (before = null) => {
    const isInitial = !before;
    if (isInitial) setLoadingFeed(true);
    else setLoadingMore(true);
    try {
      const data = await getFeed({ limit: 20, before });
      if (isInitial) {
        setEvents(data);
      } else {
        setEvents(prev => [...prev, ...data]);
      }
      setHasMore(data.length === 20);
    } catch (e) {
      console.error('Feed error:', e);
    } finally {
      if (isInitial) setLoadingFeed(false);
      else setLoadingMore(false);
    }
  }, []);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchUsers(searchQuery.trim());
        setSearchResults(results);
      } catch {}
      finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadMore = () => {
    if (!hasMore || loadingMore || !events.length) return;
    loadFeed(events[events.length - 1]?.created_at);
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Nav */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--bg)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 9 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: '3px 0', fontSize: 12.5, fontFamily: f, gap: 3 }}>
            <ChevLeft /> Back
          </button>
          <div style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 700, fontFamily: pf, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Social</div>
          <div style={{ width: 40 }} />
        </div>
        {/* Tabs */}
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', borderTop: '1px solid var(--border)' }}>
          {[['feed', '📰 Feed'], ['discover', '🔍 Find People']].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{ flex: 1, padding: '10px', background: 'none', border: 'none', borderBottom: tab === id ? '2px solid var(--text-primary)' : '2px solid transparent', color: tab === id ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: 13, fontWeight: 600, fontFamily: f, cursor: 'pointer', transition: 'all .15s' }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '16px 16px 60px' }}>

        {/* ── FEED TAB ── */}
        {tab === 'feed' && (
          <>
            {loadingFeed ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)', fontSize: 13, fontFamily: f }}>Loading feed…</div>
            ) : events.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: 40, marginBottom: 14 }}>👥</div>
                <div style={{ fontSize: 15, fontWeight: 700, fontFamily: pf, color: 'var(--text-primary)', marginBottom: 6 }}>Your feed is empty</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: f, marginBottom: 20 }}>Follow travelers to see their trips and adventures here</div>
                <button onClick={() => setTab('discover')} style={{ padding: '9px 20px', borderRadius: 20, border: 'none', background: 'var(--text-primary)', color: 'var(--bg)', fontSize: 13, fontWeight: 600, fontFamily: f, cursor: 'pointer' }}>Find people to follow</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {events.map(event => (
                  <FeedEventCard key={event.id} event={event} />
                ))}
                {hasMore && (
                  <button onClick={loadMore} disabled={loadingMore} style={{ marginTop: 8, padding: '10px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, fontFamily: f, cursor: 'pointer', opacity: loadingMore ? 0.5 : 1 }}>
                    {loadingMore ? 'Loading…' : 'Load more'}
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* ── DISCOVER TAB ── */}
        {tab === 'discover' && (
          <>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name or @username…"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 11, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 14, fontFamily: f, outline: 'none', boxSizing: 'border-box' }}
              />
              {searching && <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--text-secondary)' }}>…</div>}
            </div>

            {searchResults.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {searchResults.map(u => (
                  <UserResult key={u.id} user={u} currentUserId={user?.id} />
                ))}
              </div>
            ) : searchQuery.length >= 2 && !searching ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)', fontSize: 13, fontFamily: f }}>No users found for "{searchQuery}"</div>
            ) : searchQuery.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontFamily: f }}>Search for travelers by name or username</div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
