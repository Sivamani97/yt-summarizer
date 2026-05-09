import { useState, useCallback, useEffect } from 'react';
import { videoAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useVideos = (initialParams = {}) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [params, setParams] = useState({ page: 1, limit: 12, ...initialParams });

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await videoAPI.getHistory(params);
      setVideos(data.videos);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  const updateParams = useCallback((newParams) => {
    setParams(p => ({ ...p, ...newParams, page: 1 }));
  }, []);

  const toggleFavorite = useCallback(async (id) => {
    try {
      const { data } = await videoAPI.toggleFavorite(id);
      setVideos(v => v.map(x => x._id === id ? { ...x, isFavorite: data.isFavorite } : x));
      return data.isFavorite;
    } catch {
      toast.error('Failed to update favorite');
    }
  }, []);

  const deleteVideo = useCallback(async (id) => {
    try {
      await videoAPI.deleteVideo(id);
      setVideos(v => v.filter(x => x._id !== id));
      toast.success('Removed from history');
      return true;
    } catch {
      toast.error('Failed to delete');
      return false;
    }
  }, []);

  const nextPage = useCallback(() => {
    if (pagination?.hasMore) setParams(p => ({ ...p, page: p.page + 1 }));
  }, [pagination]);

  const prevPage = useCallback(() => {
    if (params.page > 1) setParams(p => ({ ...p, page: p.page - 1 }));
  }, [params.page]);

  return {
    videos, loading, pagination, params,
    updateParams, toggleFavorite, deleteVideo, nextPage, prevPage, refresh: fetchVideos,
  };
};
