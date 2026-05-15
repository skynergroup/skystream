import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import DiscoverStack from './stacks/DiscoverStack';
import SearchStack from './stacks/SearchStack';
import LiveTVStack from './stacks/LiveTVStack';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator({ colors }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgSecondary,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen
        name="DiscoverTab"
        options={{
          tabBarLabel: 'Discover',
          tabBarIcon: ({ color, size }) => (
            <Icon name="compass-outline" size={size} color={color} />
          ),
        }}
      >
        {() => <DiscoverStack colors={colors} />}
      </Tab.Screen>
      <Tab.Screen
        name="SearchTab"
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, size }) => (
            <Icon name="search-outline" size={size} color={color} />
          ),
        }}
      >
        {() => <SearchStack colors={colors} />}
      </Tab.Screen>
      <Tab.Screen
        name="LiveTVTab"
        options={{
          tabBarLabel: 'Live TV',
          tabBarIcon: ({ color, size }) => (
            <Icon name="tv-outline" size={size} color={color} />
          ),
        }}
      >
        {() => <LiveTVStack colors={colors} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
