import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COUNTRIES, CATEGORIES } from '@skystream/shared';
import { spacing, fontSize, borderRadius } from '../../theme';

const SEPARATOR_CODE = 'separator';

export default function LiveTVFilterScreen({ colors }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { mode } = route.params;

  const [query, setQuery] = useState('');

  const isCountry = mode === 'country';
  const sourceList = isCountry ? COUNTRIES : CATEGORIES;

  const filteredList = useMemo(() => {
    const normalised = query.trim().toLowerCase();
    if (!normalised) return sourceList.filter(item => item.code !== SEPARATOR_CODE);
    return sourceList.filter(
      item =>
        item.code !== SEPARATOR_CODE &&
        item.name.toLowerCase().includes(normalised)
    );
  }, [query, sourceList]);

  const handleSelect = item => {
    navigation.navigate('LiveTVChannelList', { mode, code: item.code });
  };

  const renderItem = ({ item }) => {
    const label = isCountry ? item.flag : item.icon;
    return (
      <TouchableOpacity
        style={[styles.item, { borderBottomColor: colors.border }]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.itemIcon}>{label}</Text>
        <Text style={[styles.itemName, { color: colors.textPrimary }]}>{item.name}</Text>
        <Icon name="chevron-forward" size={16} color={colors.textMuted} />
      </TouchableOpacity>
    );
  };

  const screenTitle = isCountry ? 'Select Country' : 'Select Category';
  const searchPlaceholder = isCountry ? 'Search countries…' : 'Search categories…';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{screenTitle}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.bgSecondary }]}>
        <Icon name="search-outline" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder={searchPlaceholder}
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          clearButtonMode="while-editing"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* List */}
      <FlatList
        data={filteredList}
        keyExtractor={item => item.code}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No results found.</Text>
          </View>
        }
      />
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
  headerSpacer: {
    width: 30,
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
  itemIcon: {
    fontSize: 22,
    marginRight: spacing.md,
    width: 32,
    textAlign: 'center',
  },
  itemName: {
    flex: 1,
    fontSize: fontSize.md,
  },
  emptyContainer: {
    paddingTop: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.md,
  },
});
