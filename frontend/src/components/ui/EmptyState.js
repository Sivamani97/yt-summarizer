import React from 'react';
import { Link } from 'react-router-dom';

export default function EmptyState({ icon: Icon, title, description, actionLabel, actionTo, actionOnClick }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '64px 32px' }}>
      {Icon && (
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <Icon size={28} color="var(--text-muted)" />
        </div>
      )}
      <h3 style={{
        fontFamily: 'var(--font-display)', fontWeight: 700,
        fontSize: 18, marginBottom: 8,
      }}>{title}</h3>
      {description && (
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24, lineHeight: 1.6, maxWidth: 320, margin: '0 auto 24px' }}>
          {description}
        </p>
      )}
      {actionLabel && (actionTo ? (
        <Link to={actionTo} className="btn btn-primary">{actionLabel}</Link>
      ) : actionOnClick ? (
        <button onClick={actionOnClick} className="btn btn-primary">{actionLabel}</button>
      ) : null)}
    </div>
  );
}
