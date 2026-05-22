import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { videoAPI } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import VideoCard from '../components/video/VideoCard';
import { VideoCardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { Search, Star, Zap, Youtube, RotateCcw } from 'lucide-react';

export default function HistoryPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterFav, setFilterFav] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const debouncedSearch = useDebounce(search, 350);

  const fetchVideos = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 12 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filterFav) params.favorite = true;
      const { data } = await videoAPI.getHistory(params);
      setVideos(data.videos);
      setPagination(data.pagination);
      setPage(pg);
    } catch {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterFav]);

  useEffect(() => {
    fetchVideos(1);
  }, [fetchVideos]);

  const handleToggleFav = async (id) => {
    try {
      const { data } = await videoAPI.toggleFavorite(id);
      setVideos(v => v.map(x => x._id === id ? { ...x, isFavorite: data.isFavorite } : x));
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    try {
      await videoAPI.deleteVideo(id);
      setVideos(v => v.filter(x => x._id !== id));
      toast.success('Removed from history');
    } catch { toast.error('Failed to delete'); }
  };

  const resetFilters = () => {
    setSearch('');
    setFilterFav(false);
    setFilterDifficulty('');
  };

  const hasFilters = search || filterFav || filterDifficulty;
  const displayed = filterDifficulty
    ? videos.filter(v => v.analysis?.difficulty === filterDifficulty)
    : videos;

  return (
    <main className="main-content">
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(24px,3.5vw,36px)', marginBottom: 6 }}>
              Video History
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
              {pagination ? `${pagination.total} video${pagination.total !== 1 ? 's' : ''} analyzed` : 'Your AI-analyzed videos'}
            </p>
          </div>
          <Link to="/analyze" className="btn btn-primary" style={{ gap: 8 }}>
            <Zap size={15} /> New Analysis
          </Link>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input type="text" className="input" style={{ paddingLeft: 40 }}
              placeholder="Search title, channel, tag…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)}
            className="input" style={{ width: 'auto', minWidth: 140, cursor: 'pointer' }}>
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <button onClick={() => setFilterFav(!filterFav)}
            className={`btn ${filterFav ? 'btn-primary' : 'btn-secondary'}`} style={{ gap: 7, flexShrink: 0 }}>
            <Star size={15} fill={filterFav ? 'currentColor' : 'none'} /> Favorites
          </button>
          {hasFilters && (
            <button onClick={resetFilters} className="btn btn-ghost btn-sm" style={{ gap: 6, flexShrink: 0 }}>
              <RotateCcw size={13} /> Clear
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
            {[...Array(8)].map((_, i) => <VideoCardSkeleton key={i} />)}
          </div>
        ) : displayed.length === 0 ? (
          <EmptyState
            icon={Youtube}
            title={hasFilters ? 'No videos match your filters' : 'No videos yet'}
            description={hasFilters ? 'Try adjusting your search or clearing filters.' : 'Analyze your first YouTube video to see it here.'}
            actionLabel={hasFilters ? 'Clear Filters' : 'Analyze a Video'}
            actionTo={hasFilters ? undefined : '/analyze'}
            actionOnClick={hasFilters ? resetFilters : undefined}
          />
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
              {displayed.map(video => (
                <VideoCard key={video._id} video={video} onToggleFavorite={handleToggleFav} onDelete={handleDelete} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 36 }}>
                <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => fetchVideos(page - 1)}>← Prev</button>
                {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => fetchVideos(p)}
                    className={`btn btn-sm ${page === p ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ minWidth: 36 }}>{p}</button>
                ))}
                <button className="btn btn-secondary btn-sm" disabled={!pagination.hasMore} onClick={() => fetchVideos(page + 1)}>Next →</button>
              </div>
            )}

            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: 16 }}>
              Showing {displayed.length} of {pagination?.total || displayed.length} videos
            </p>
          </>
        )}
      </div>
    </main>
  );
}
