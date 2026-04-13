import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const HomeScreen = () => (
  <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
    <View style={styles.header}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.subtitle}>Command router + agent panel live below.</Text>
    </View>

    <View style={styles.card}>
      <View style={styles.cardAccent} />
      <Text style={styles.cardTitle}>Welcome</Text>
      <Text style={styles.text}>
        This app routes every agent action through structured commands. Use the tabs to explore screens, or ask the
        agent to navigate or change preferences.
      </Text>
    </View>

    <View style={styles.hintPill}>
      <Text style={styles.hintText}>Tip: try “what can you do?” in the agent</Text>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    backgroundColor: '#eef1f4',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#212529',
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: '#495057',
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 16,
    bottom: 16,
    width: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: '#4c6ef5',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4c6ef5',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 8,
  },
  text: {
    color: '#343a40',
    fontSize: 16,
    lineHeight: 24,
    marginLeft: 8,
  },
  hintPill: {
    alignSelf: 'flex-start',
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#e7f5ff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#a5d8ff',
  },
  hintText: {
    fontSize: 13,
    color: '#1864ab',
    fontWeight: '600',
  },
});
