import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getBackdropUrl } from '@skystream/shared';
import ContentRow from '../components/ContentRow';
import SkeletonLoader from '../components/SkeletonLoader';
import tmdbApi from '../utils/api';
import { spacing, fontSize, borderRadius } from '../theme';

const { width } = Dimensions.get('window');
const BACKDROP_HEIGHT = width * 0.65;

function GenrePill({ name, colors }) {
  return (
    <View style={[styles.genrePill, { backgroundColor: colors.bgTertiary, borderColor: colors.border }]}>
      <Text style={[styles.genreText, { color: colors.textSecondary }]}>{name}</Text>
    </View>
  );
}

function DetailSkeleton({ colors }) {
  return (
    <ScrollView style={{ flex: 1 }} scrollEnabled={false}>
      <SkeletonLoader width={width} height={BACKDROP_HEIGHT} borderRadius={0} colors={colors} />
      <View style={styles.skeletonBody}>
        <SkeletonLoader width={width * 0.7} height={30} colors={colors} style={styles.skeletonRow} />
        <SkeletonLoader width={200} height={18} colors={colors} style={styles.skeletonRow} />
        <SkeletonLoader width={width - spacing.md * 2} height={80} colors={colors} style={styles.skeletonRow} />
      </View>
    </ScrollView>
  );
}

export default function MovieDetailScreen({ colors }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { content: routeContent, id: routeId } = route.params ?? {};

  const [details, setDetails] = useState(routeContent ?? null);
  const [loading, setLoading] = useState(!routeContent);
  const [error, setError] = useState(null);

  const contentId = routeContent?.id ?? routeId;

  useEffect(() => {
    if (routeContent && !routeId) return;
    if (!contentId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    tmdbApi
      .getMovieDetails(contentId)
      .then(data => {
        if (!cancelled) {
          setDetails(tmdbApi.transformContent({ ...data, media_type: 'movie' }));
        }
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load movie details.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [contentId, routeContent, routeId]);

  const handlePlay = useCallback(() => {
    navigation.navigate('Player', { content: details, contentType: 'movie' });
  }, [navigation, details]);

  const handleSimilarPress = useCallback(
    item => {
      navigation.push('MovieDetail', { content: item });
    },
    [navigation],
  );

  const handleBack = useCallback(() => navigation.goBack(), [navigation]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <DetailSkeleton colors={colors} />
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Icon name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  if (error || !details) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.bgPrimary }]}>
        <StatusBar barStyle="light-content" />
        <TouchableOpacity style={styles.backButtonAlt} onPress={handleBack}>
          <Icon name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          {error ?? 'Content not found.'}
        </Text>
      </View>
    );
  }

  const backdropUrl = getBackdropUrl(details.backdrop_path);
  const year = (details.release_date || details.first_air_date || '').slice(0, 4);
  const rating = details.vote_average ? details.vote_average.toFixed(1) : null;
  const genres = details.genres ?? [];
  const overview = details.overview;
  const similarItems = (details.similar?.results ?? details.recommendations?.results ?? [])
    .slice(0, 20)
    .map(item => tmdbApi.transformContent({ ...item, media_type: 'movie' }));

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} bounces>
        <ImageBackground
          source={backdropUrl ? { uri: backdropUrl } : undefined}
          style={styles.backdrop}
          imageStyle={styles.backdropImage}
        >
          <View style={[styles.backdropOverlay, { backgroundColor: colors.overlay }]} />
          <View style={styles.backdropContent}>
            <Text style={styles.backdropTitle} numberOfLines={3}>
              {details.title || details.name}
            </Text>
            <View style={styles.metaRow}>
              {year ? <Text style={styles.metaChip}>{year}</Text> : null}
              {rating ? (
                <View style={styles.ratingRow}>
                  <Icon name="star" size={13} color="#f5c518" />
                  <Text style={styles.metaChip}>{rating}</Text>
                </View>
              ) : null}
              <View style={[styles.typeBadge, { backgroundColor: colors.accent }]}>
                <Text style={styles.typeBadgeText}>Movie</Text>
              </View>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.body}>
          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: colors.accent }]}
            onPress={handlePlay}
            activeOpacity={0.85}
          >
            <Icon name="play" size={20} color="#fff" />
            <Text style={styles.playButtonText}>Play Movie</Text>
          </TouchableOpacity>

          {genres.length > 0 && (
            <View style={styles.genreRow}>
              {genres.map(genre => (
                <GenrePill key={genre.id} name={genre.name} colors={colors} />
              ))}
            </View>
          )}

          {overview ? (
            <View style={styles.overviewSection}>
              <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>Overview</Text>
              <Text style={[styles.overviewText, { color: colors.textSecondary }]}>{overview}</Text>
            </View>
          ) : null}
        </View>

        {similarItems.length > 0 && (
          <View style={styles.similarSection}>
            <ContentRow
              title="Similar Movies"
              items={similarItems}
              onItemPress={handleSimilarPress}
              colors={colors}
            />
          </View>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>

      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <View style={[styles.backButtonBg, { backgroundColor: colors.overlay }]}>
          <Icon name="chevron-back" size={22} color="#fff" />
        </View>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  backdrop: {
    width,
    height: BACKDROP_HEIGHT,
    justifyContent: 'flex-end',
  },
  backdropImage: {
    resizeMode: 'cover',
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropContent: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  backdropTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: '#fff',
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  metaChip: {
    color: '#ccc',
    fontSize: fontSize.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  playButtonText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  genrePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  genreText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  overviewSection: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  overviewText: {
    fontSize: fontSize.sm,
    lineHeight: 22,
  },
  similarSection: {
    marginTop: spacing.sm,
  },
  bottomPad: {
    height: spacing.xxl,
  },
  backButton: {
    position: 'absolute',
    top: StatusBar.currentHeight ? StatusBar.currentHeight + spacing.sm : spacing.xl,
    left: spacing.md,
    zIndex: 10,
  },
  backButtonBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonAlt: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.md,
  },
  errorText: {
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  skeletonBody: {
    padding: spacing.md,
  },
  skeletonRow: {
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
});
