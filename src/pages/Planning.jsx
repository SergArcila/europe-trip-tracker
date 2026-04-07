import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyPlans, createPlan, deletePlan } from '../lib/api';
import { ChevLeft } from '../components/common/Icons';
import { f, pf } from '../utils/constants';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function Planning() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getMyPlans()
      .then(data => { setPlans(data); setLoading(false); })
      .catch(e => { console.error(e); setLoading(false); });
  }, []);

  const handleNew = async () => {
    setCreating(true);
    try {
      const id = await createPlan();
      navigate(`/planning/${id}`);
    } catch (e) {
      console.error(e);
      setCreating(false);
    }
  };

  const handleDelete = async (e, planId) => {
    e.stopPropagation();
    if (!confirm('Delete this plan?')) return;
    await deletePlan(planId);
    setPlans(ps => ps.filter(p => p.id !== planId));
  };

  return (
    <>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--bg)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 9 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: '3px 0', fontSize: 12.5, fontFamily: f, gap: 3 }}>
            <ChevLeft /> Home
          </button>
          <div style={{ flex: 1 }} />
          <button
            onClick={handleNew}
            disabled={creating}
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: 'none', borderRadius: 9, padding: '7px 16px', cursor: creating ? 'default' : 'pointer', color: '#fff', fontSize: 13, fontFamily: f, fontWeight: 600, opacity: creating ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {creating ? '…' : '+ New Plan'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>

        {/* Title */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, fontFamily: pf, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            ✏️ Trip Planning Canvas
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: f, marginTop: 4 }}>
            Your personal brainstorm space — notes, ideas, sketches, no app-switching needed.
          </p>
        </div>

        {loading && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)', fontFamily: f, fontSize: 13 }}>
            Loading…
          </div>
        )}

        {!loading && plans.length === 0 && (
          <div
            onClick={handleNew}
            style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--bg-card)', borderRadius: 16, border: '1px dashed var(--border)', cursor: 'pointer', transition: 'border-color .15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-secondary)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗺️</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: pf, marginBottom: 6 }}>Start your first plan</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: f }}>Headings, notes, bullets, sketches — all in one place</div>
          </div>
        )}

        {!loading && plans.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {plans.map(plan => (
              <div
                key={plan.id}
                onClick={() => navigate(`/planning/${plan.id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border)', cursor: 'pointer', transition: 'border-color .15s, background .15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.35)'; e.currentTarget.style.background = 'rgba(124,58,237,0.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
              >
                <span style={{ fontSize: 28, flexShrink: 0 }}>{plan.emoji || '🗺️'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)', fontFamily: f, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {plan.title || 'Untitled Plan'}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: f, marginTop: 2 }}>
                    Updated {timeAgo(plan.updated_at)}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(e, plan.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, padding: '4px 6px', borderRadius: 6, opacity: 0.6, fontFamily: f, transition: 'opacity .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#E63946'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  title="Delete plan"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
