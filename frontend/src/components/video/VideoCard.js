import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Trash2, ArrowRight, Clock } from 'lucide-react';

const DIFF_BADGE = {
  beginner: { bg: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'rgba(16,185,129,0.3)' },
  intermediate: { bg: 'rgba(6,182,212,0.1)', color: '#06b6d4', border: 'rgba(6,182,212,0.3)' },
  advanced: { bg: 'rgba(124,58,237,0.1)', color: '#a78bfa', border: 'rgba(124,58,237,0.3)' },
};

const STATUS_BADGE = {
  completed: { bg: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'rgba(16,185,129,0.3)' },
  failed: { bg: 'rgba(244,63,94,0.1)', color: '#f43f5e', border: 'rgba(244,63,94,0.3)' },
  processing: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  pending: { bg: 'rgba(90,90,120,0.1)', color: '#9090b0', border: 'rgba(90,90,120,0.3)' },
};

export default function VideoCard({ video, onToggleFavorite, onDelete }) {
  const diff = DIFF_BADGE[video.analysis?.difficulty];
  const status = STATUS_BADGE[video.status] || STATUS_BADGE.pending;
  const thumbSrc = video.thumbnailUrl || `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;

  const handleFav = (e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite?.(video._id); };
  const handleDel = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (window.confirm('Remove this video from history?')) onDelete?.(video._id);
  };

  return (
    <Link to={`/video/${video._id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <div
        className="card"
        style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', transition: 'all var(--transition-base)' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--amber-border)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-amber)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        {/* Thumbnail */}
        <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', background: 'var(--bg-elevated)', flexShrink: 0 }}>
          <img src={thumbSrc} alt={video.title} loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            onError={e => { e.target.src = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`; }}
          />
          {/* Status */}
          <div style={{ position: 'absolute', top: 8, left: 8 }}>
            <span style={{
              fontSize: 10, padding: '3px 8px', borderRadius: '9999px',
              fontFamily: 'var(--font-mono)', fontWeight: 600,
              background: status.bg, color: status.color, border: `1px solid ${status.border}`,
            }}>{video.status}</span>
          </div>
          {/* Actions */}
          <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 5 }}>
            {onToggleFavorite && (
              <button onClick={handleFav} style={{
                width: 28, height: 28, borderRadius: 6, cursor: 'pointer',
                background: 'rgba(10,10,18,0.85)', border: '1px solid rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all var(--transition-fast)',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--amber)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
              >
                <Star size={13} color={video.isFavorite ? 'var(--amber)' : 'var(--text-muted)'} fill={video.isFavorite ? 'var(--amber)' : 'none'} />
              </button>
            )}
            {onDelete && (
              <button onClick={handleDel} style={{
                width: 28, height: 28, borderRadius: 6, cursor: 'pointer',
                background: 'rgba(10,10,18,0.85)', border: '1px solid rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all var(--transition-fast)',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--rose)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
              >
                <Trash2 size={13} color="var(--rose)" />
              </button>
            )}
          </div>
          {/* Duration overlay */}
          {video.duration && (
            <div style={{
              position: 'absolute', bottom: 6, right: 6,
              background: 'rgba(0,0,0,0.8)', borderRadius: 4,
              padding: '2px 6px', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'white',
            }}>{video.duration}</div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            color: 'var(--text-primary)',
          }}>{video.title}</div>

          {video.channelName && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              {video.channelName}
            </div>
          )}

          <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Clock size={11} />
            {new Date(video.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {diff && (
                <span style={{
                  fontSize: 10, padding: '2px 8px', borderRadius: '9999px',
                  fontFamily: 'var(--font-mono)', fontWeight: 600,
                  background: diff.bg, color: diff.color, border: `1px solid ${diff.border}`,
                }}>{video.analysis.difficulty}</span>
              )}
              {video.analysis?.tags?.slice(0, 1).map(tag => (
                <span key={tag} style={{
                  fontSize: 10, padding: '2px 8px', borderRadius: '9999px',
                  fontFamily: 'var(--font-mono)', fontWeight: 500,
                  background: 'var(--amber-glow)', color: 'var(--amber)', border: '1px solid var(--amber-border)',
                }}>{tag}</span>
              ))}
            </div>
            <ArrowRight size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          </div>
        </div>
      </div>
    </Link>
  );
}
