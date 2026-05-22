import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { videoAPI } from '../services/api';
import StatCard from '../components/dashboard/StatCard';
import VideoCard from '../components/video/VideoCard';
import { StatCardSkeleton, VideoCardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { Youtube, Star, TrendingUp, ArrowRight, Zap, BookOpen } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentVideos, setRecentVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      videoAPI.getStats(),
      videoAPI.getHistory({ page: 1, limit: 4 }),
    ])
      .then(([statsRes, historyRes]) => {
        setStats(statsRes.data.stats);
        setRecentVideos(historyRes.data.videos);
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'there';

  const handleToggleFav = async (id) => {
    try {
      const { data } = await videoAPI.toggleFavorite(id);
      setRecentVideos(v => v.map(x => x._id === id ? { ...x, isFavorite: data.isFavorite } : x));
    } catch { toast.error('Failed to update'); }
  };

  const statCards = [
    { label: 'Total Analyzed', value: stats?.total    ?? 0, icon: Youtube,    color: 'var(--amber)'   },
    { label: 'Completed',      value: stats?.completed ?? 0, icon: TrendingUp, color: 'var(--emerald)' },
    { label: 'Favorites',      value: stats?.favorites ?? 0, icon: Star,       color: '#a78bfa'        },
  ];

  return (
    <main className="main-content">
      <div className="container">

        {/* Greeting */}
        <div style={{ marginBottom:'clamp(24px,4vw,40px)' }}>
          <p style={{
            color:'var(--text-muted)', fontSize:13, marginBottom:4,
            fontFamily:'var(--font-mono)', letterSpacing:'0.05em',
          }}>
            {greeting} ·{' '}
            <span style={{ color:'var(--amber)' }}>
              {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}
            </span>
          </p>
          <h1 style={{
            fontFamily:'var(--font-display)', fontWeight:800,
            fontSize:'clamp(26px,4vw,44px)', lineHeight:1.1, marginBottom:10,
          }}>
            Welcome back, {firstName} 👋
          </h1>
          <p style={{ color:'var(--text-secondary)', fontSize:'clamp(14px,1.8vw,16px)' }}>
            Here's your learning intelligence at a glance.
          </p>
        </div>

        {/* Hero CTA — uses .dashboard-cta class */}
        <div className="dashboard-cta">
          {/* Decorative glow */}
          <div style={{
            position:'absolute', right:-40, top:-40,
            width:180, height:180, borderRadius:'50%',
            background:'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)',
            pointerEvents:'none',
          }} />
          <div style={{ position:'relative', zIndex:1 }}>
            <h2 style={{
              fontFamily:'var(--font-display)', fontWeight:800,
              fontSize:'clamp(17px,2.5vw,24px)', marginBottom:8,
            }}>
              Analyze a New Video
            </h2>
            <p style={{ color:'var(--text-secondary)', fontSize:'clamp(13px,1.5vw,14px)' }}>
              Paste any YouTube URL → AI summary, concepts &amp; quiz in seconds
            </p>
          </div>
          <Link
            to="/analyze"
            className="btn btn-primary btn-lg"
            style={{ flexShrink:0, gap:9, position:'relative', zIndex:1 }}
          >
            <Zap size={18} /> Start Analyzing <ArrowRight size={17} />
          </Link>
        </div>

        {/* Stats grid */}
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
          gap:'clamp(10px,2vw,14px)',
          marginBottom:'clamp(24px,4vw,40px)',
        }}>
          {loading
            ? [1,2,3].map(i => <StatCardSkeleton key={i} />)
            : statCards.map(({ label, value, icon, color }) => (
                <StatCard key={label} label={label} value={value} icon={icon} color={color} />
              ))
          }
        </div>

        {/* Difficulty breakdown */}
        {!loading && stats?.byDifficulty?.length > 0 && (
          <div className="card" style={{ marginBottom:'clamp(20px,3vw,32px)', padding:'20px clamp(16px,3vw,24px)' }}>
            <h3 style={{
              fontFamily:'var(--font-display)', fontWeight:700,
              fontSize:15, marginBottom:16, color:'var(--text-secondary)',
            }}>
              Difficulty Breakdown
            </h3>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              {stats.byDifficulty.map(({ _id, count }) => {
                const colors = { beginner:'var(--emerald)', intermediate:'var(--cyan)', advanced:'#a78bfa' };
                const c = colors[_id] || 'var(--text-muted)';
                return (
                  <div key={_id} style={{
                    display:'flex', alignItems:'center', gap:8,
                    padding:'8px 16px',
                    background:`${c}10`, border:`1px solid ${c}30`,
                    borderRadius:'var(--radius-md)',
                  }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:c }} />
                    <span style={{
                      fontFamily:'var(--font-display)', fontWeight:600,
                      fontSize:14, textTransform:'capitalize', color:c,
                    }}>{_id}</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:13, color:c, fontWeight:700 }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Videos */}
        <div>
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            marginBottom:'clamp(14px,2vw,20px)', flexWrap:'wrap', gap:8,
          }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'clamp(17px,2.5vw,20px)' }}>
              Recent Videos
            </h2>
            <Link to="/history" className="btn btn-ghost btn-sm" style={{ gap:6 }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid-responsive">
              {[1,2,3,4].map(i => <VideoCardSkeleton key={i} />)}
            </div>
          ) : recentVideos.length > 0 ? (
            <div className="grid-responsive">
              {recentVideos.map(video => (
                <VideoCard key={video._id} video={video} onToggleFavorite={handleToggleFav} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No videos yet"
              description="Analyze your first YouTube video and it will appear here."
              actionLabel="Analyze First Video"
              actionTo="/analyze"
            />
          )}
        </div>
      </div>
    </main>
  );
}
