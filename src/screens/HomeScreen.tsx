import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const HomeScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Home</Text>
    <View style={styles.card}>
      <Text style={styles.text}>Welcome to the Agent-Mediated App.</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { padding: 20, backgroundColor: '#fff', borderRadius: 12, elevation: 2 },
  text: { color: '#6c757d' }
});
