import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getTMDBImageUrl } from '@skystream/shared';
import { spacing, fontSize, borderRadius } from '../theme';

export default function ContentCard({ item, onPress, colors }) {
  const [imageError, setImageError] = useState(false);
  const posterUrl = getTMDBImageUrl(item.poster_path, 'w342');
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.bgCard }]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      {posterUrl && !imageError ? (
        <Image
          source={{ uri: posterUrl }}
          style={styles.poster}
          onError={() => setImageError(true)}
        />
      ) : (
        <View style={[styles.poster, styles.placeholder, { backgroundColor: colors.bgTertiary }]}>
          <Icon name="image-outline" size={32} color={colors.textMuted} />
        </View>
      )}
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
          {item.title || item.name}
        </Text>
        <View style={styles.meta}>
          {year ? <Text style={[styles.year, { color: colors.textSecondary }]}>{year}</Text> : null}
          {rating ? (
            <View style={styles.ratingContainer}>
              <Icon name="star" size={12} color="#f5c518" />
              <Text style={[styles.rating, { color: colors.textSecondary }]}>{rating}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  poster: {
    width: 140,
    height: 210,
    borderTopLeftRadius: borderRadius.md,
    borderTopRightRadius: borderRadius.md,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    padding: spacing.sm,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  year: {
    fontSize: fontSize.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rating: {
    fontSize: fontSize.xs,
  },
});
