import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import ContentCard from './ContentCard';
import { spacing, fontSize } from '../theme';

export default function ContentRow({ title, items, onItemPress, colors }) {
  if (!items || items.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      <FlatList
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <ContentCard item={item} onPress={onItemPress} colors={colors} />
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.md,
  },
});
