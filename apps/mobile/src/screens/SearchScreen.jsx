import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import ContentCard from '../components/ContentCard';
import SkeletonLoader from '../components/SkeletonLoader';
import tmdbApi from '../utils/api';
import { spacing, fontSize, borderRadius } from '../theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.md * 2 - spacing.sm) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.5 + 64;
const DEBOUNCE_MS = 300;

function SearchSkeleton({ colors }) {
  const items = Array.from({ length: 6 });
  return (
    <View style={styles.skeletonGrid}>
      {items.map((_, i) => (
        <SkeletonLoader
          key={i}
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          colors={colors}
          style={styles.skeletonCard}
        />
      ))}
    </View>
  );
}

export default function SearchScreen({ colors }) {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  const handleSearch = useCallback(async text => {
    if (!text.trim()) {
      setResults([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await tmdbApi.search(text.trim());
      const filtered = (data.results || []).filter(
        item => item.media_type === 'movie' || item.media_type === 'tv'
      );
      const transformed = filtered.map(item => tmdbApi.transformContent(item));
      setResults(transformed);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const onChangeText = useCallback(
    text => {
      setQuery(text);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        handleSearch(text);
      }, DEBOUNCE_MS);
    },
    [handleSearch]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleCardPress = useCallback(
    item => {
      const screen = item.type === 'movie' ? 'MovieDetail' : 'TVDetail';
      navigation.navigate(screen, { content: item });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.gridItem}>
        <ContentCard item={item} onPress={handleCardPress} colors={colors} />
      </View>
    ),
    [handleCardPress, colors]
  );

  const keyExtractor = useCallback(item => String(item.id), []);

  const renderEmptyState = () => {
    if (loading) return null;
    if (!query.trim()) {
      return (
        <View style={styles.emptyState}>
          <Icon name="search-outline" size={56} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
            Find movies and TV shows
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Search by title, genre, or keyword
          </Text>
        </View>
      );
    }
    if (results.length === 0 && !error) {
      return (
        <View style={styles.emptyState}>
          <Icon name="film-outline" size={56} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>No results found</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Try a different search term
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Search</Text>
      </View>

      <View
        style={[
          styles.inputWrapper,
          { backgroundColor: colors.bgSecondary, borderColor: colors.border },
        ]}
      >
        <Icon name="search-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          placeholder="Movies, TV shows..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={onChangeText}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setQuery('');
              setResults([]);
              setError(null);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Icon name="alert-circle-outline" size={16} color={colors.accent} />
          <Text style={[styles.errorText, { color: colors.accent }]}>{error}</Text>
        </View>
      )}

      {loading ? (
        <SearchSkeleton colors={colors} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    height: 44,
  },
  inputIcon: {
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    paddingVertical: 0,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: fontSize.sm,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  columnWrapper: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  gridItem: {
    flex: 1,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  skeletonCard: {
    borderRadius: borderRadius.md,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxl,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
  },
});
