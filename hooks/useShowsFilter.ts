'use client';

import { useState, useEffect } from 'react';
import type { Show } from '@/lib/data';

export const SHOW_FILTERS = ['All', 'House', 'Techno', 'Bass'];

export function useShowsFilter(initialShows: Show[] = []) {
  const [showsList, setShowsList] = useState<Show[]>(initialShows);
  const [loading, setLoading] = useState(initialShows.length === 0);
  const [activeFilter, setActiveFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [hoveredShow, setHoveredShow] = useState<Show | null>(null);

  useEffect(() => {
    fetch('/api/shows', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setShowsList(json.data);
        }
      })
      .catch((err) => console.warn('Shows live fetch failed:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredShows = showsList.filter((show) => {
    if (activeFilter === 'All') return true;
    return Array.isArray(show.tags) && show.tags.includes(activeFilter);
  });

  return {
    showsList,
    filteredShows,
    loading,
    activeFilter,
    setActiveFilter,
    viewMode,
    setViewMode,
    hoveredShow,
    setHoveredShow,
  };
}
