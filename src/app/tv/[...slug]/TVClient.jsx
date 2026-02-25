'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StreamingPlayerModal from '../../../components/StreamingPlayerModal';
import { Loading } from '../../../components';
import tmdbApi from '../../../services/tmdbApi';
import streamingServices from '../../../services/streamingServices';

function parseTVSlug(slugSegments) {
  if (!slugSegments || slugSegments.length === 0) return null;

  const firstSegment = slugSegments[0];
  const match = firstSegment.match(/-(\d+)$/);
  if (!match) return null;

  const id = parseInt(match[1], 10);
  let season = 1;
  let episode = 1;

  if (slugSegments.length >= 2) {
    const seasonMatch = slugSegments[1].match(/^s(\d+)$/);
    if (seasonMatch) season = parseInt(seasonMatch[1], 10);
  }

  if (slugSegments.length >= 3) {
    const episodeMatch = slugSegments[2].match(/^e(\d+)$/);
    if (episodeMatch) episode = parseInt(episodeMatch[1], 10);
  }

  return { type: 'tv', id, season, episode };
}

export default function TVClient({ slugSegments }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [playerModal, setPlayerModal] = useState({
    isOpen: false,
    content: null,
    platform: null,
    embedUrl: null,
    contentType: 'tv',
    season: null,
    episode: null,
  });

  useEffect(() => {
    const parsed = parseTVSlug(slugSegments);
    if (!parsed) {
      router.replace('/');
      return;
    }

    const fetchContent = async () => {
      try {
        const tvData = await tmdbApi.getTVDetails(parsed.id);
        const content = tmdbApi.transformContent(tvData);

        const urls = streamingServices.getAllStreamingUrls(content, {
          season: parsed.season,
          episode: parsed.episode,
        });

        setPlayerModal({
          isOpen: true,
          content,
          platform: 'server1',
          embedUrl: urls.server1,
          contentType: 'tv',
          season: parsed.season,
          episode: parsed.episode,
        });
      } catch (err) {
        console.error('Failed to fetch TV show for deep link:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [slugSegments, router]);

  const handleClosePlayer = useCallback(() => {
    setPlayerModal({
      isOpen: false,
      content: null,
      platform: null,
      embedUrl: null,
      contentType: 'tv',
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
        <Loading text="Loading TV show..." />
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
