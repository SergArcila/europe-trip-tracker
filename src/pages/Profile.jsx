import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getProfile, updateProfile, uploadAvatar } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { ChevLeft } from '../components/common/Icons';
import { f, pf } from '../utils/constants';

function Avatar({ url, name, size = 80 }) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        style={{ width: size, height: size, borderRadius: size / 2, objectFit: 'cover', border: '2px solid var(--border)' }}
      />
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: size / 2, background: 'var(--bg-card)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.4 }}>
      👤
    </div>
  );
}

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { clearCache } = useData();
  const fileRef = useRef(null);

  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getProfile(user.id)
      .then(profile => {
        setName(profile?.name || '');
        setAvatarUrl(profile?.avatar_url || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user.id]);

  const handleSaveName = async () => {
    setSaving(true);
    setError('');
    try {
      await updateProfile(user.id, { name: name.trim() });
      await refreshProfile(user.id);
      setEditing(false);
    } catch {
      setError('Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => fileRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5 MB.'); return; }
    setUploading(true);
    setError('');
    try {
      const url = await uploadAvatar(user.id, file);
      setAvatarUrl(url);
      await refreshProfile(user.id);
    } catch (e) {
      setError('Upload failed. Make sure the avatars storage bucket exists and is public.');
      console.error(e);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleLogout = async () => {
    clearCache();
    await supabase.auth.signOut();
    navigate('/login');
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 9,
    border: '1px solid var(--border)', background: 'var(--bg-input)',
    color: 'var(--text-primary)', fontSize: 14, fontFamily: f,
    outline: 'none', boxSizing: 'border-box',
  };

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
        <div style={{ padding: '28px 0 20px', textAlign: 'center' }}>
          {/* Avatar with upload overlay */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 14 }}>
            <Avatar url={avatarUrl} name={name} size={80} />
            <button
              onClick={handleAvatarClick}
              disabled={uploading}
              style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, background: 'var(--text-primary)', color: 'var(--bg)', border: '2px solid var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, cursor: 'pointer', transition: 'opacity .15s', opacity: uploading ? 0.5 : 1 }}
              title="Change photo"
            >
              {uploading ? '…' : '+'}
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

          <h1 style={{ fontSize: 22, fontWeight: 700, fontFamily: pf, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            {loading ? '…' : name || 'Traveler'}
          </h1>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: f }}>{user.email}</div>
          {uploading && <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: f, marginTop: 6 }}>Uploading…</div>}
        </div>

        {error && <div style={{ fontSize: 12, color: '#E63946', fontFamily: f, textAlign: 'center', marginBottom: 12 }}>{error}</div>}

        {/* Name section */}
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

        {/* Email (read-only) */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 13, border: '1px solid var(--border)', padding: '16px', marginBottom: 24 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: f, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 8 }}>Email</div>
          <div style={{ fontSize: 14, color: 'var(--text-primary)', fontFamily: f }}>{user.email}</div>
        </div>

        <button onClick={handleLogout} style={{ width: '100%', padding: '13px', borderRadius: 12, border: '1px solid #E6394644', background: 'transparent', color: '#E63946', fontSize: 14, fontWeight: 600, fontFamily: f, cursor: 'pointer', transition: 'all .15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#E6394610'; e.currentTarget.style.borderColor = '#E63946'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#E6394644'; }}
        >Log Out</button>
      </div>
    </>
  );
}
