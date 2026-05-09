import React from 'react';

export default function ProgressBar({ value, max, color = 'var(--amber)', height = 6, showLabel = false, animated = false }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div>
      <div style={{
        width: '100%', height, borderRadius: 999,
        background: 'var(--bg-elevated)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 999,
          transition: animated ? 'width 0.8s cubic-bezier(0.4,0,0.2,1)' : 'none',
        }} />
      </div>
      {showLabel && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: 6,
          fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
        }}>
          <span>{value} / {max}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
    </div>
  );
}
