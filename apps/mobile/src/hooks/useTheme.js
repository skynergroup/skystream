import { useState, useEffect, useCallback } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkTheme, lightTheme } from '../theme';

const STORAGE_KEY = 'skystream-theme';

export default function useTheme() {
  const [theme, setThemeState] = useState('dark');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(stored => {
      if (stored === 'light' || stored === 'dark') {
        setThemeState(stored);
      } else {
        const system = Appearance.getColorScheme() || 'dark';
        setThemeState(system);
      }
    });

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      AsyncStorage.getItem(STORAGE_KEY).then(stored => {
        if (!stored) {
          setThemeState(colorScheme || 'dark');
        }
      });
    });

    return () => subscription?.remove();
  }, []);

  const setTheme = useCallback(async newTheme => {
    setThemeState(newTheme);
    await AsyncStorage.setItem(STORAGE_KEY, newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return {
    theme,
    toggleTheme,
    setTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    colors: theme === 'dark' ? darkTheme : lightTheme,
  };
}
