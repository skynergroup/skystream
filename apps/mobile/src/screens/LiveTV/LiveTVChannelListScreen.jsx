import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getCountryName, getCategoryName } from '@skystream/shared';
import { spacing, fontSize, borderRadius } from '../../theme';

const TV_GARDEN_BASE =
  'https://raw.githubusercontent.com/TVGarden/tv-garden-channel-list/refs/heads/main/channels/raw';

export default function LiveTVChannelListScreen({ colors }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { mode, code } = route.params;

  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  const isCountry = mode === 'country';

  const screenTitle = useMemo(
    () => (isCountry ? getCountryName(code) : getCategoryName(code)),
    [isCountry, code]
  );

  useEffect(() => {
    let cancelled = false;
    const segment = isCountry ? 'countries' : 'categories';
    const url = `${TV_GARDEN_BASE}/${segment}/${code}.json`;

    setLoading(true);
    setError(null);

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (!cancelled) {
          // TV Garden returns an array of channel objects
          setChannels(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message ?? 'Failed to load channels');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [code, isCountry]);

  const filteredChannels = useMemo(() => {
    const normalised = query.trim().toLowerCase();
    if (!normalised) return channels;
    return channels.filter(ch =>
      (ch.name ?? '').toLowerCase().includes(normalised)
    );
  }, [query, channels]);

  const handleSelectChannel = channel => {
    navigation.navigate('LiveTVPlayer', { channel });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.item, { borderBottomColor: colors.border }]}
      onPress={() => handleSelectChannel(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.channelIconPlaceholder, { backgroundColor: colors.bgTertiary }]}>
        <Icon name="tv-outline" size={18} color={colors.textMuted} />
      </View>
      <View style={styles.channelInfo}>
        <Text style={[styles.channelName, { color: colors.textPrimary }]} numberOfLines={1}>
          {item.name}
        </Text>
        {item.languages && item.languages.length > 0 && (
          <Text style={[styles.channelLanguage, { color: colors.textMuted }]} numberOfLines={1}>
            {item.languages.join(', ')}
          </Text>
        )}
      </View>
      <Icon name="chevron-forward" size={16} color={colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {screenTitle}
        </Text>
        {!loading && !error && (
          <Text style={[styles.channelCount, { color: colors.textMuted }]}>
            {filteredChannels.length}
          </Text>
        )}
      </View>

      {/* Search bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.bgSecondary }]}>
        <Icon name="search-outline" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Search channels…"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          clearButtonMode="while-editing"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.stateText, { color: colors.textSecondary }]}>
            Loading channels…
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centeredState}>
          <Icon name="alert-circle-outline" size={40} color={colors.textMuted} />
          <Text style={[styles.stateText, { color: colors.textSecondary }]}>
            Could not load channels
          </Text>
          <Text style={[styles.errorDetail, { color: colors.textMuted }]}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredChannels}
          keyExtractor={(item, index) => item.stream_url ?? String(index)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.centeredState}>
              <Text style={[styles.stateText, { color: colors.textMuted }]}>
                No channels found.
              </Text>
            </View>
          }
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  channelCount: {
    fontSize: fontSize.sm,
    marginLeft: spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    paddingVertical: 0,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  channelIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  channelInfo: {
    flex: 1,
  },
  channelName: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  channelLanguage: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxl,
    gap: spacing.sm,
  },
  stateText: {
    fontSize: fontSize.md,
    marginTop: spacing.sm,
  },
  errorDetail: {
    fontSize: fontSize.sm,
  },
});
