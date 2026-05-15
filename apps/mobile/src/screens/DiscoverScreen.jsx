import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FeaturedHero from '../components/FeaturedHero';
import ContentRow from '../components/ContentRow';
import SkeletonLoader from '../components/SkeletonLoader';
import tmdbApi from '../utils/api';
import { spacing, fontSize, borderRadius } from '../theme';

const SECTIONS = [
  { key: 'trending', title: 'Trending Now' },
  { key: 'popularMovies', title: 'Popular Movies' },
  { key: 'popularTV', title: 'Popular TV Shows' },
  { key: 'topRated', title: 'Top Rated' },
  { key: 'popularAnime', title: 'Popular Anime' },
];

function DiscoverSkeleton({ colors }) {
  return (
    <View>
      <SkeletonLoader
        width="100%"
        height={300}
        borderRadius={0}
        colors={colors}
        style={styles.heroSkeleton}
      />
      {SECTIONS.map(section => (
        <View key={section.key} style={styles.rowSkeletonContainer}>
          <SkeletonLoader
            width={160}
            height={fontSize.lg + 4}
            colors={colors}
            style={styles.rowTitleSkeleton}
          />
          <View style={styles.rowSkeletonCards}>
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonLoader
                key={i}
                width={140}
                height={274}
                colors={colors}
                style={styles.cardSkeleton}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

export default function DiscoverScreen({ colors }) {
  const navigation = useNavigation();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchContent = useCallback(async () => {
    setError(null);
    try {
      const data = await tmdbApi.getHomePageContent();
      setContent(data);
    } catch (err) {
      setError('Failed to load content. Pull down to retry.');
    }
  }, []);

  useEffect(() => {
    fetchContent().finally(() => setLoading(false));
  }, [fetchContent]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchContent();
    setRefreshing(false);
  }, [fetchContent]);

  const handleItemPress = useCallback(
    item => {
      const screen = item.type === 'movie' ? 'MovieDetail' : 'TVDetail';
      navigation.navigate(screen, { content: item });
    },
    [navigation],
  );

  const handleHeroPlay = useCallback(
    item => {
      const screen = item.type === 'movie' ? 'MovieDetail' : 'TVDetail';
      navigation.navigate(screen, { content: item });
    },
    [navigation],
  );

  const handleHeroInfo = useCallback(
    item => {
      const screen = item.type === 'movie' ? 'MovieDetail' : 'TVDetail';
      navigation.navigate(screen, { content: item });
    },
    [navigation],
  );

  if (loading) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
        <DiscoverSkeleton colors={colors} />
      </ScrollView>
    );
  }

  if (error && !content) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.bgPrimary }]}>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
      </View>
    );
  }

  if (!content) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.bgPrimary }]}>
        <Text style={[styles.errorText, { color: colors.textPrimary }]}>No content available</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bgPrimary }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.accent}
          colors={[colors.accent]}
        />
      }
    >
      {content?.featured?.length > 0 && (
        <FeaturedHero
          items={content.featured}
          onPlay={handleHeroPlay}
          onInfo={handleHeroInfo}
          colors={colors}
        />
      )}

      <View style={styles.rows}>
        {SECTIONS.map(section => (
          <ContentRow
            key={section.key}
            title={section.title}
            items={content?.[section.key] ?? []}
            onItemPress={handleItemPress}
            colors={colors}
          />
        ))}
      </View>
    </ScrollView>
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
  errorText: {
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  rows: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  heroSkeleton: {
    width: '100%',
  },
  rowSkeletonContainer: {
    marginBottom: spacing.lg,
  },
  rowTitleSkeleton: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  rowSkeletonCards: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  cardSkeleton: {
    borderRadius: borderRadius.md,
  },
});
