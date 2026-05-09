import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function StatCard({ label, value, icon: Icon, color = 'var(--amber)', trend, loading = false }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 'var(--radius-md)', flexShrink: 0,
        background: `${color}1a`, border: `1px solid ${color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {loading
          ? <div className="spinner" style={{ width: 18, height: 18 }} />
          : <Icon size={22} color={color} />}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 28, lineHeight: 1, color: 'var(--text-primary)',
        }}>
          {loading ? '—' : value}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
      </div>
      {trend != null && !loading && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 12, fontFamily: 'var(--font-mono)',
          color: trend >= 0 ? 'var(--emerald)' : 'var(--rose)',
        }}>
          <TrendingUp size={13} />
          {trend >= 0 ? '+' : ''}{trend}%
        </div>
      )}
    </div>
  );
}
