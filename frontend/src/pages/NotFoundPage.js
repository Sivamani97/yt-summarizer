import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-void)', padding: 24, textAlign: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative glow */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '60vw', height: '40vh',
        background: 'radial-gradient(ellipse, rgba(245,158,11,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Giant 404 */}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 'clamp(80px,20vw,180px)',
          lineHeight: 1,
          background: 'linear-gradient(135deg, rgba(245,158,11,0.3), rgba(245,158,11,0.05))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: 8,
          userSelect: 'none',
        }}>404</div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(22px,3vw,32px)', marginBottom: 12,
        }}>Page not found</h1>

        <p style={{
          color: 'var(--text-secondary)', fontSize: 16,
          maxWidth: 380, margin: '0 auto 36px', lineHeight: 1.65,
        }}>
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/dashboard" className="btn btn-primary" style={{ gap: 8 }}>
            <Home size={16} /> Go to Dashboard
          </Link>
          <button onClick={() => window.history.back()} className="btn btn-secondary" style={{ gap: 8 }}>
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
