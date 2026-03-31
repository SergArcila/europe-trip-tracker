import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getProfile, updateProfile } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { ChevLeft } from '../components/common/Icons';
import { f, pf } from '../utils/constants';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { clearCache } = useData();
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getProfile(user.id)
      .then(profile => {
        setName(profile?.name || '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user.id]);

  const handleSaveName = async () => {
    setSaving(true);
    setError('');
    try {
      await updateProfile(user.id, { name: name.trim() });
      setEditing(false);
    } catch (e) {
      setError('Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    clearCache();
    await supabase.auth.signOut();
    navigate('/login');
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 9,
    border: '1px solid var(--border)',
    background: 'var(--bg-input)',
    color: 'var(--text-primary)',
    fontSize: 14,
    fontFamily: f,
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--bg)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 9 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: '3px 0', fontSize: 12.5, fontFamily: f, gap: 3 }}>
            <ChevLeft /> Back
          </button>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 14, fontWeight: 700, fontFamily: f, letterSpacing: '.05em', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Profile
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px 60px' }}>
        <div style={{ padding: '28px 0 20px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 28 }}>
            👤
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, fontFamily: pf, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            {loading ? '…' : name || 'Traveler'}
          </h1>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: f }}>{user.email}</div>
        </div>

        {/* Name section */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 13, border: '1px solid var(--border)', padding: '16px', marginBottom: 12 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: f, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 10 }}>
            Display Name
          </div>
          {editing ? (
            <div>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditing(false); }}
                style={inputStyle}
                autoFocus
              />
              {error && <div style={{ fontSize: 11.5, color: '#E63946', fontFamily: f, marginTop: 6 }}>{error}</div>}
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button onClick={() => setEditing(false)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, fontFamily: f, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleSaveName} disabled={saving} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: 'var(--text-primary)', color: 'var(--bg)', fontSize: 13, fontWeight: 600, fontFamily: f, cursor: 'pointer' }}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, color: 'var(--text-primary)', fontFamily: f }}>{name || 'Not set'}</span>
              <button onClick={() => setEditing(true)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 7, padding: '5px 12px', cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)', fontFamily: f }}>
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Email section (read-only) */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 13, border: '1px solid var(--border)', padding: '16px', marginBottom: 24 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: f, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 8 }}>
            Email
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-primary)', fontFamily: f }}>{user.email}</div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '13px',
            borderRadius: 12,
            border: '1px solid #E6394644',
            background: 'transparent',
            color: '#E63946',
            fontSize: 14,
            fontWeight: 600,
            fontFamily: f,
            cursor: 'pointer',
            transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#E6394610'; e.currentTarget.style.borderColor = '#E63946'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#E6394644'; }}
        >
          Log Out
        </button>
      </div>
    </>
  );
}
