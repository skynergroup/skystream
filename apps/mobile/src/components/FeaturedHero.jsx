import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getBackdropUrl } from '@skystream/shared';
import { spacing, fontSize, borderRadius } from '../theme';

const { width } = Dimensions.get('window');

export default function FeaturedHero({ items, onPlay, onInfo, colors }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!items || items.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % items.length);
    }, 8000);
    return () => clearInterval(timerRef.current);
  }, [items]);

  if (!items || items.length === 0) return null;

  const item = items[currentIndex];
  const backdropUrl = getBackdropUrl(item.backdrop_path);

  return (
    <ImageBackground
      source={backdropUrl ? { uri: backdropUrl } : undefined}
      style={styles.hero}
      imageStyle={styles.heroImage}
    >
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title || item.name}
        </Text>
        <View style={styles.meta}>
          {item.release_date ? (
            <Text style={styles.metaText}>{item.release_date.slice(0, 4)}</Text>
          ) : null}
          {item.vote_average ? (
            <View style={styles.ratingBadge}>
              <Icon name="star" size={12} color="#f5c518" />
              <Text style={styles.metaText}>{item.vote_average.toFixed(1)}</Text>
            </View>
          ) : null}
          <View style={[styles.typeBadge, { backgroundColor: colors.accent }]}>
            <Text style={styles.typeText}>{item.type === 'movie' ? 'Movie' : 'TV'}</Text>
          </View>
        </View>
        {item.overview ? (
          <Text style={styles.overview} numberOfLines={3}>
            {item.overview}
          </Text>
        ) : null}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: colors.accent }]}
            onPress={() => onPlay(item)}
          >
            <Icon name="play" size={18} color="#fff" />
            <Text style={styles.playText}>Play</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.infoButton, { borderColor: colors.textSecondary }]}
            onPress={() => onInfo(item)}
          >
            <Icon name="information-circle-outline" size={18} color={colors.textPrimary} />
            <Text style={[styles.infoText, { color: colors.textPrimary }]}>More Info</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.indicators}>
          {items.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === currentIndex ? colors.accent : colors.textMuted },
              ]}
            />
          ))}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  hero: {
    width,
    height: width * 0.75,
    justifyContent: 'flex-end',
  },
  heroImage: {
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: '#fff',
    marginBottom: spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  metaText: {
    color: '#ccc',
    fontSize: fontSize.sm,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  typeText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  overview: {
    color: '#ccc',
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  playText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: spacing.xs,
  },
  infoText: {
    fontWeight: '600',
    fontSize: fontSize.md,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
