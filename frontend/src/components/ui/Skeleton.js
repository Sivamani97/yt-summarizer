import React from 'react';

const shimmer = `
  @keyframes shimmer {
    0% { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
`;

const skeletonStyle = {
  background: 'linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-hover) 50%, var(--bg-elevated) 75%)',
  backgroundSize: '800px 100%',
  animation: 'shimmer 1.4s ease infinite',
  borderRadius: 'var(--radius-sm)',
};

export const Skeleton = ({ width = '100%', height = 16, style = {}, rounded = false }) => (
  <>
    <style>{shimmer}</style>
    <div style={{
      ...skeletonStyle,
      width,
      height,
      borderRadius: rounded ? '9999px' : 'var(--radius-sm)',
      ...style,
    }} />
  </>
);

export const VideoCardSkeleton = () => (
  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
    <Skeleton height={160} style={{ borderRadius: 0 }} />
    <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Skeleton height={16} width="85%" />
      <Skeleton height={14} width="50%" />
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        <Skeleton height={20} width={60} rounded />
        <Skeleton height={20} width={50} rounded />
      </div>
    </div>
  </div>
);

export const StatCardSkeleton = () => (
  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
    <Skeleton width={46} height={46} style={{ borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Skeleton height={28} width="40%" />
      <Skeleton height={12} width="60%" />
    </div>
  </div>
);

export const VideoDetailSkeleton = () => (
  <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr' }}>
        <Skeleton height={140} style={{ borderRadius: 0 }} />
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Skeleton height={22} width="80%" />
          <Skeleton height={14} width="40%" />
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <Skeleton height={22} width={80} rounded />
            <Skeleton height={22} width={70} rounded />
            <Skeleton height={22} width={90} rounded />
          </div>
        </div>
      </div>
    </div>
    <div className="card" style={{ padding: 24 }}>
      <Skeleton height={20} width="30%" style={{ marginBottom: 20 }} />
      {[100, 90, 95, 80, 88].map((w, i) => (
        <Skeleton key={i} height={14} width={`${w}%`} style={{ marginBottom: 10 }} />
      ))}
    </div>
  </div>
);

export default Skeleton;
