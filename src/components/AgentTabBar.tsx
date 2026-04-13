import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { AgentBottomSheet } from './AgentBottomSheet';

/**
 * Renders the agent panel above the real tab bar so tabs stay visible and
 * layout reserves space for both (no overlay covering the tab bar).
 */
export function AgentTabBar(props: BottomTabBarProps) {
  return (
    <View style={styles.column} collapsable={false}>
      <AgentBottomSheet />
      <BottomTabBar {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    width: '100%',
    backgroundColor: '#f1f3f5',
  },
});
