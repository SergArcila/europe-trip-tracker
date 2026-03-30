import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { upsertProfile } from '../lib/api';
import { f, pf } from '../utils/constants';

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // The trigger creates a profile row automatically.
    // Try to upsert here too in case trigger hasn't fired.
    if (data?.user) {
      try {
        await upsertProfile(data.user.id, { name });
      } catch {
        // Ignore — trigger will handle it
      }
      navigate('/');
    } else {
      // Email confirmation required
      setError('Check your email to confirm your account, then log in.');
    }

    setLoading(false);
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid var(--border)',
    background: 'var(--bg-input)',
    color: 'var(--text-primary)',
    fontSize: 14,
    fontFamily: f,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: 11.5,
    fontWeight: 600,
    color: 'var(--text-secondary)',
    fontFamily: f,
    letterSpacing: '.04em',
    textTransform: 'uppercase',
    marginBottom: 6,
    display: 'block',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🌍</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, fontFamily: pf, color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Create your account
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', fontFamily: f, margin: 0 }}>
            Start planning your adventures
          </p>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)', padding: '28px 24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={labelStyle}>Your Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Sergio"
                style={inputStyle}
                autoComplete="name"
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={inputStyle}
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
                autoComplete="new-password"
                minLength={6}
                required
              />
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: f, marginTop: 5 }}>
                At least 6 characters
              </div>
            </div>

            {error && (
              <div style={{ fontSize: 12.5, color: error.startsWith('Check') ? '#F4A261' : '#E63946', fontFamily: f, padding: '10px 12px', background: error.startsWith('Check') ? '#F4A26114' : '#E6394614', borderRadius: 8, border: `1px solid ${error.startsWith('Check') ? '#F4A26130' : '#E6394630'}` }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: 12,
                border: 'none',
                background: loading ? 'var(--border)' : 'var(--text-primary)',
                color: loading ? 'var(--text-secondary)' : 'var(--bg)',
                fontSize: 14,
                fontWeight: 600,
                fontFamily: f,
                cursor: loading ? 'default' : 'pointer',
                transition: 'all .15s',
              }}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-secondary)', fontFamily: f }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
