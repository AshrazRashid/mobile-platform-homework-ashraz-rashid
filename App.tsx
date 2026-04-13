import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { HomeScreen } from './src/screens/HomeScreen';
import { ExploreScreen } from './src/screens/ExploreScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { AgentBottomSheet } from './src/components/AgentBottomSheet';
import { FlyoutPanel } from './src/components/FlyoutPanel';
import { CommandRouter } from './src/services/router/CommandRouter';
import { navigationRef } from './src/navigation/navigationRef';
import type { RootTabParamList } from './src/navigation/navigationRef';

const Tab = createBottomTabNavigator();

const tabGlyphStyles = StyleSheet.create({
  icon: { fontSize: 20 },
});

const TabIcon = ({ label }: { label: string; focused: boolean }) => (
  <Text style={tabGlyphStyles.icon}>
    {label === 'Home' ? '\u{1F3E0}' : label === 'Explore' ? '\u{1F50D}' : '\u{1F464}'}
  </Text>
);

const App = () => {
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const [flyoutTitle, setFlyoutTitle] = useState<string | undefined>();

  useEffect(() => {
    const router = CommandRouter.getInstance();
    return router.subscribe(cmd => {
      if (cmd.status !== 'executed') {
        return;
      }
      switch (cmd.type) {
        case 'navigate': {
          const screen = cmd.payload.screen as keyof RootTabParamList;
          if (navigationRef.isReady()) {
            navigationRef.navigate(screen);
          }
          break;
        }
        case 'showAlert':
          Alert.alert(String(cmd.payload.title), String(cmd.payload.message));
          break;
        case 'openFlyout':
          setFlyoutOpen(true);
          if (cmd.payload.title != null) {
            setFlyoutTitle(String(cmd.payload.title));
          }
          break;
        case 'closeFlyout':
          setFlyoutOpen(false);
          break;
        default:
          break;
      }
    });
  }, []);

  const closeFlyout = () => setFlyoutOpen(false);

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <View style={styles.root}>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              // eslint-disable-next-line react/no-unstable-nested-components -- @react-navigation/bottom-tabs passes render prop here
              tabBarIcon: ({ focused }: { focused: boolean }) => (
                <TabIcon label={route.name} focused={focused} />
              ),
              tabBarActiveTintColor: '#4c6ef5',
              tabBarInactiveTintColor: '#adb5bd',
              headerShown: false,
              tabBarStyle: {
                paddingBottom: 5,
                height: 60,
              },
            })}
          >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Explore" component={ExploreScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
          </Tab.Navigator>
          <AgentBottomSheet />
          <FlyoutPanel visible={flyoutOpen} title={flyoutTitle} onClose={closeFlyout} />
        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
