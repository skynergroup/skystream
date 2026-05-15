import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './BottomTabNavigator';

const linking = {
  prefixes: ['skystream://'],
  config: {
    screens: {
      DiscoverTab: {
        screens: {
          MovieDetail: 'movie/:id',
          TVDetail: 'tv/:id/:season?/:episode?',
        },
      },
    },
  },
};

export default function RootNavigator({ colors }) {
  return (
    <NavigationContainer
      linking={linking}
      theme={{
        dark: colors.bgPrimary === '#0a0a0f',
        colors: {
          primary: colors.accent,
          background: colors.bgPrimary,
          card: colors.bgSecondary,
          text: colors.textPrimary,
          border: colors.border,
          notification: colors.accent,
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' },
          medium: { fontFamily: 'System', fontWeight: '500' },
          bold: { fontFamily: 'System', fontWeight: '700' },
          heavy: { fontFamily: 'System', fontWeight: '800' },
        },
      }}
    >
      <BottomTabNavigator colors={colors} />
    </NavigationContainer>
  );
}
