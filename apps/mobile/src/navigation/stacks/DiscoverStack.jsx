import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DiscoverScreen from '../../screens/DiscoverScreen';
import MovieDetailScreen from '../../screens/MovieDetailScreen';
import TVDetailScreen from '../../screens/TVDetailScreen';
import PlayerScreen from '../../screens/PlayerScreen';

const Stack = createNativeStackNavigator();

export default function DiscoverStack({ colors }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bgPrimary },
      }}
    >
      <Stack.Screen name="Discover">
        {props => <DiscoverScreen {...props} colors={colors} />}
      </Stack.Screen>
      <Stack.Screen name="MovieDetail">
        {props => <MovieDetailScreen {...props} colors={colors} />}
      </Stack.Screen>
      <Stack.Screen name="TVDetail">
        {props => <TVDetailScreen {...props} colors={colors} />}
      </Stack.Screen>
      <Stack.Screen
        name="Player"
        options={{
          presentation: 'fullScreenModal',
          orientation: 'landscape',
        }}
      >
        {props => <PlayerScreen {...props} colors={colors} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
