import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { streamingServices } from '@skystream/api';
import { spacing, fontSize, borderRadius } from '../theme';

export default function PlayerScreen({ colors }) {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    content,
    contentType,
    season: initialSeason,
    episode: initialEpisode,
  } = route.params;

  const [season, setSeason] = useState(initialSeason ?? 1);
  const [episode, setEpisode] = useState(initialEpisode ?? 1);
  const [loading, setLoading] = useState(true);

  const getUrl = useCallback(
    (s, e) => {
      if (contentType === 'movie') {
        return streamingServices.getVideasyMovieUrl(content.id);
      }
      return streamingServices.getVideasyTVUrl(content.id, s, e);
    },
    [content, contentType],
  );

  const [currentUrl, setCurrentUrl] = useState(() => getUrl(season, episode));
  const isTV = contentType === 'tv';

  const handleSeasonChange = useCallback(
    delta => {
      const newSeason = Math.max(1, season + delta);
      setSeason(newSeason);
      setEpisode(1);
      setCurrentUrl(getUrl(newSeason, 1));
      setLoading(true);
    },
    [season, getUrl],
  );

  const handleEpisodeChange = useCallback(
    delta => {
      const newEpisode = Math.max(1, episode + delta);
      setEpisode(newEpisode);
      setCurrentUrl(getUrl(season, newEpisode));
      setLoading(true);
    },
    [episode, season, getUrl],
  );

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.topBar, { backgroundColor: colors.bgSecondary }]}>
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={[styles.titleText, { color: colors.textPrimary }]} numberOfLines={1}>
            {content.title || content.name}
          </Text>

          <View style={styles.spacer} />
        </View>

        {isTV && (
          <View style={[styles.episodeBar, { backgroundColor: colors.bgTertiary }]}>
            <View style={styles.episodeControl}>
              <Text style={[styles.episodeLabel, { color: colors.textSecondary }]}>Season</Text>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={[styles.stepButton, { borderColor: colors.border }]}
                  onPress={() => handleSeasonChange(-1)}
                >
                  <Icon name="remove" size={16} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.stepValue, { color: colors.textPrimary }]}>{season}</Text>
                <TouchableOpacity
                  style={[styles.stepButton, { borderColor: colors.border }]}
                  onPress={() => handleSeasonChange(1)}
                >
                  <Icon name="add" size={16} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.episodeControl}>
              <Text style={[styles.episodeLabel, { color: colors.textSecondary }]}>Episode</Text>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={[styles.stepButton, { borderColor: colors.border }]}
                  onPress={() => handleEpisodeChange(-1)}
                >
                  <Icon name="remove" size={16} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.stepValue, { color: colors.textPrimary }]}>{episode}</Text>
                <TouchableOpacity
                  style={[styles.stepButton, { borderColor: colors.border }]}
                  onPress={() => handleEpisodeChange(1)}
                >
                  <Icon name="add" size={16} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <View style={styles.playerContainer}>
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          )}
          <WebView
            key={currentUrl}
            source={{ uri: currentUrl }}
            style={styles.webView}
            allowsFullscreenVideo
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback
            javaScriptEnabled
            domStorageEnabled
            scalesPageToFit
            bounces={false}
            scrollEnabled={false}
            onLoadEnd={() => setLoading(false)}
            userAgent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  closeButton: {
    padding: spacing.sm,
  },
  titleText: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '700',
    marginLeft: spacing.xs,
  },
  spacer: {
    width: 40,
  },
  episodeBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  episodeControl: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  episodeLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: {
    fontSize: fontSize.md,
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'center',
  },
  playerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  webView: {
    flex: 1,
    backgroundColor: '#000',
  },
});
