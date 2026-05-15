import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LiveTVScreen from '../../screens/LiveTVScreen';
import LiveTVModeScreen from '../../screens/LiveTV/LiveTVModeScreen';
import LiveTVFilterScreen from '../../screens/LiveTV/LiveTVFilterScreen';
import LiveTVChannelListScreen from '../../screens/LiveTV/LiveTVChannelListScreen';
import LiveTVPlayerScreen from '../../screens/LiveTV/LiveTVPlayerScreen';

const Stack = createNativeStackNavigator();

export default function LiveTVStack({ colors }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bgPrimary },
      }}
    >
      <Stack.Screen name="LiveTV">{props => <LiveTVScreen {...props} colors={colors} />}</Stack.Screen>
      <Stack.Screen name="LiveTVMode">{props => <LiveTVModeScreen {...props} colors={colors} />}</Stack.Screen>
      <Stack.Screen name="LiveTVFilter">{props => <LiveTVFilterScreen {...props} colors={colors} />}</Stack.Screen>
      <Stack.Screen name="LiveTVChannelList">{props => <LiveTVChannelListScreen {...props} colors={colors} />}</Stack.Screen>
      <Stack.Screen
        name="LiveTVPlayer"
        options={{
          presentation: 'fullScreenModal',
          orientation: 'landscape',
        }}
      >
        {props => <LiveTVPlayerScreen {...props} colors={colors} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
