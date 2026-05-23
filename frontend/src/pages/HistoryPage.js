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
  const [videos,           setVideos]           = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [search,           setSearch]           = useState('');
  const [filterFav,        setFilterFav]        = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [page,             setPage]             = useState(1);
  const [pagination,       setPagination]       = useState(null);

  const debouncedSearch = useDebounce(search, 350);

  const fetchVideos = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 12 };
      if (debouncedSearch) params.search   = debouncedSearch;
      if (filterFav)       params.favorite = true;
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

  useEffect(() => { fetchVideos(1); }, [fetchVideos]);

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

  const resetFilters = () => { setSearch(''); setFilterFav(false); setFilterDifficulty(''); };

  const hasFilters = search || filterFav || filterDifficulty;
  const displayed  = filterDifficulty
    ? videos.filter(v => v.analysis?.difficulty === filterDifficulty)
    : videos;

  return (
    <main className="main-content">
      <div className="container">

        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 'clamp(20px,3vw,32px)',
          flexWrap: 'wrap', gap: 16,
        }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 'clamp(22px,3.5vw,36px)', marginBottom: 6,
            }}>
              Video History
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(13px,1.6vw,15px)' }}>
              {pagination
                ? `${pagination.total} video${pagination.total !== 1 ? 's' : ''} analyzed`
                : 'Your AI-analyzed videos'}
            </p>
          </div>
          <Link to="/analyze" className="btn btn-primary" style={{ gap: 8, flexShrink: 0 }}>
            <Zap size={15} /> New Analysis
          </Link>
        </div>

        {/* ── Filter bar — grid layout on mobile ── */}
        <div className="filter-bar">
          {/* Search */}
          <div className="filter-search">
            <Search
              size={15}
              className="filter-search-icon"
            />
            <input
              type="text"
              className="input"
              style={{ paddingLeft: 42, width: '100%' }}
              placeholder="Search title, channel, tag…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search videos"
            />
          </div>

          {/* Difficulty select */}
          <select
            value={filterDifficulty}
            onChange={e => setFilterDifficulty(e.target.value)}
            className="input filter-select"
            aria-label="Filter by difficulty"
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          {/* Favorites + Clear — grouped */}
          <div className="filter-actions">
            <button
              onClick={() => setFilterFav(!filterFav)}
              className={`btn btn-sm ${filterFav ? 'btn-primary' : 'btn-secondary'}`}
              style={{ gap: 6 }}
              aria-pressed={filterFav}
            >
              <Star size={14} fill={filterFav ? 'currentColor' : 'none'} />
              <span style={{ whiteSpace: 'nowrap' }}>Favorites</span>
            </button>

            {hasFilters && (
              <button
                onClick={resetFilters}
                className="btn btn-ghost btn-sm"
                style={{ gap: 5 }}
                aria-label="Clear all filters"
              >
                <RotateCcw size={13} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Video grid ── */}
        {loading ? (
          <div className="grid-responsive">
            {[...Array(8)].map((_, i) => <VideoCardSkeleton key={i} />)}
          </div>
        ) : displayed.length === 0 ? (
          <EmptyState
            icon={Youtube}
            title={hasFilters ? 'No videos match your filters' : 'No videos yet'}
            description={
              hasFilters
                ? 'Try adjusting your search or clearing filters.'
                : 'Analyze your first YouTube video to see it here.'
            }
            actionLabel={hasFilters ? 'Clear Filters' : 'Analyze a Video'}
            actionTo={hasFilters ? undefined : '/analyze'}
            actionOnClick={hasFilters ? resetFilters : undefined}
          />
        ) : (
          <>
            <div className="grid-responsive">
              {displayed.map(video => (
                <VideoCard
                  key={video._id}
                  video={video}
                  onToggleFavorite={handleToggleFav}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* ── Pagination ── */}
            {pagination && pagination.pages > 1 && (
              <div className="pagination-row">
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page === 1}
                  onClick={() => fetchVideos(page - 1)}
                  aria-label="Previous page"
                >
                  ← Prev
                </button>

                {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => fetchVideos(p)}
                    className={`btn btn-sm ${page === p ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ minWidth: 40 }}
                    aria-label={`Page ${p}`}
                    aria-current={page === p ? 'page' : undefined}
                  >
                    {p}
                  </button>
                ))}

                <button
                  className="btn btn-secondary btn-sm"
                  disabled={!pagination.hasMore}
                  onClick={() => fetchVideos(page + 1)}
                  aria-label="Next page"
                >
                  Next →
                </button>
              </div>
            )}

            <p style={{
              textAlign: 'center', color: 'var(--text-muted)',
              fontSize: 13, marginTop: 12,
            }}>
              Showing {displayed.length} of {pagination?.total || displayed.length} videos
            </p>
          </>
        )}
      </div>
    </main>
  );
}
