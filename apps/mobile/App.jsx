import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import useTheme from './src/hooks/useTheme';

export default function App() {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bgPrimary}
      />
      <RootNavigator colors={colors} />
    </SafeAreaProvider>
  );
}
