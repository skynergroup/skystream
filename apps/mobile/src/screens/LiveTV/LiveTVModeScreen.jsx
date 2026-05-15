import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { spacing, fontSize, borderRadius } from '../../theme';

export default function LiveTVModeScreen({ colors }) {
  const navigation = useNavigation();

  const handleSelectMode = mode => {
    navigation.navigate('LiveTVFilter', { mode });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Live TV</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Choose how you want to explore channels
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[
            styles.optionCard,
            { backgroundColor: colors.bgCard, borderColor: colors.border },
          ]}
          onPress={() => handleSelectMode('country')}
          activeOpacity={0.8}
        >
          <View style={[styles.iconCircle, { backgroundColor: colors.bgTertiary }]}>
            <Icon name="globe-outline" size={40} color={colors.accent} />
          </View>
          <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>Browse by Country</Text>
          <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
            Explore channels from 168 countries worldwide
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionCard,
            { backgroundColor: colors.bgCard, borderColor: colors.border },
          ]}
          onPress={() => handleSelectMode('category')}
          activeOpacity={0.8}
        >
          <View style={[styles.iconCircle, { backgroundColor: colors.bgTertiary }]}>
            <Icon name="pricetag-outline" size={40} color={colors.accent} />
          </View>
          <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>
            Browse by Category
          </Text>
          <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
            Discover channels by genre: News, Sports, Movies, and more
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  optionsContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    gap: spacing.md,
  },
  optionCard: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  optionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});
