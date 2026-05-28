import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';
import Video from 'react-native-video';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { spacing, fontSize } from '../../theme';

const YOUTUBE_EMBED_BASE = 'https://www.youtube.com/embed/';
const YOUTUBE_REGEX = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/;

function extractYouTubeId(url) {
  const match = url.match(YOUTUBE_REGEX);
  return match ? match[1] : null;
}

function isYouTubeUrl(url) {
  return typeof url === 'string' && (url.includes('youtube.com') || url.includes('youtu.be'));
}

function isHLSUrl(url) {
  return typeof url === 'string' && url.includes('.m3u8');
}

export default function LiveTVPlayerScreen({ colors }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { channel } = route.params;

  const streamUrl = channel?.stream_url ?? '';
  const channelName = channel?.name ?? 'Live TV';

  const youtubeEmbedUrl = useMemo(() => {
    if (!isYouTubeUrl(streamUrl)) return null;
    const videoId = extractYouTubeId(streamUrl);
    if (!videoId) return null;
    return `${YOUTUBE_EMBED_BASE}${videoId}?autoplay=1&playsinline=1`;
  }, [streamUrl]);

  const renderPlayer = () => {
    if (youtubeEmbedUrl) {
      return (
        <WebView
          source={{ uri: youtubeEmbedUrl }}
          style={styles.player}
          allowsFullscreenVideo
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback
          javaScriptEnabled
        />
      );
    }

    if (isHLSUrl(streamUrl)) {
      return (
        <Video
          source={{ uri: streamUrl }}
          style={styles.player}
          resizeMode="contain"
          controls
          fullscreen={false}
          ignoreSilentSwitch="ignore"
          onError={err => console.warn('[LiveTVPlayer] HLS error:', err)}
        />
      );
    }

    // Fallback: render via WebView for other stream types
    return (
      <WebView
        source={{ uri: streamUrl }}
        style={styles.player}
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        javaScriptEnabled
      />
    );
  };

  return (
    <View style={styles.fullScreen}>
      <StatusBar hidden />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: '#000' }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.bgSecondary }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.channelName, { color: colors.textPrimary }]} numberOfLines={1}>
            {channelName}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Player */}
        <View style={styles.playerContainer}>
          {streamUrl ? (
            renderPlayer()
          ) : (
            <View style={styles.noStreamContainer}>
              <Icon name="tv-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.noStreamText, { color: colors.textSecondary }]}>
                No stream available for this channel.
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  channelName: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 30,
  },
  playerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  player: {
    flex: 1,
    backgroundColor: '#000',
  },
  noStreamContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  noStreamText: {
    fontSize: fontSize.md,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
});
