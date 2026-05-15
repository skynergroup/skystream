import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function LiveTVScreen({ colors }) {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.navigate('LiveTVMode');
  }, [navigation]);

  // Render an empty view while the navigation redirect takes place
  return <View style={[styles.container, { backgroundColor: colors.bgPrimary }]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
