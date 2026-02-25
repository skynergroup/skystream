'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StreamingPlayerModal from '../../../components/StreamingPlayerModal';
import { Loading } from '../../../components';
import tmdbApi from '../../../services/tmdbApi';
import streamingServices from '../../../services/streamingServices';
import { analytics } from '../../../utils';

function parseMovieSlug(slug) {
  const match = slug.match(/-(\d+)$/);
  if (!match) return null;
  return { type: 'movie', id: parseInt(match[1], 10) };
}

export default function MovieClient({ slug }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [playerModal, setPlayerModal] = useState({
    isOpen: false,
    content: null,
    platform: null,
    embedUrl: null,
    contentType: 'movie',
    season: null,
    episode: null,
  });

  useEffect(() => {
    const parsed = parseMovieSlug(slug);
    if (!parsed) {
      router.replace('/');
      return;
    }

    const fetchContent = async () => {
      try {
        const movieData = await tmdbApi.getMovieDetails(parsed.id);
        const content = tmdbApi.transformContent(movieData);

        const urls = streamingServices.getAllStreamingUrls(content, {
          season: 1,
          episode: 1,
        });

        setPlayerModal({
          isOpen: true,
          content,
          platform: 'server1',
          embedUrl: urls.server1,
          contentType: 'movie',
          season: null,
          episode: null,
        });
      } catch (err) {
        console.error('Failed to fetch movie for deep link:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [slug, router]);

  const handleClosePlayer = useCallback(() => {
    setPlayerModal({
      isOpen: false,
      content: null,
      platform: null,
      embedUrl: null,
      contentType: 'movie',
      season: null,
      episode: null,
    });
    router.push('/');
  }, [router]);

  if (loading && !playerModal.isOpen) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <Loading text="Loading movie..." />
      </div>
    );
  }

  return (
    <StreamingPlayerModal
      isOpen={playerModal.isOpen}
      onClose={handleClosePlayer}
      content={playerModal.content}
      platform={playerModal.platform}
      embedUrl={playerModal.embedUrl}
      contentType={playerModal.contentType}
      season={playerModal.season}
      episode={playerModal.episode}
    />
  );
}
