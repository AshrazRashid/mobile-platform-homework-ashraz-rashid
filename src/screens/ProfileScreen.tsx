import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { CommandRouter } from '../services/router/CommandRouter';
import type { Command } from '../types/commands';

export const ProfileScreen = () => {
  const [preferences, setPreferences] = useState({ darkMode: false });
  const [logs, setLogs] = useState<Command[]>([]);

  useEffect(() => {
    const router = CommandRouter.getInstance();
    setLogs(router.getLogs());

    const unsubscribe = router.subscribe(cmd => {
      if (cmd.type === 'setPreference' && cmd.status === 'executed') {
        setPreferences(prev => ({ ...prev, [String(cmd.payload.key)]: cmd.payload.value }));
      }
      setLogs(router.getLogs());
    });
    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.row}>
          <Text>Dark mode</Text>
          <Switch
            value={!!preferences.darkMode}
            onValueChange={v => setPreferences(p => ({ ...p, darkMode: v }))}
          />
        </View>
        <Text style={styles.hint}>Agent-driven changes use the command router and confirmation.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity log</Text>
        <ScrollView style={styles.logContainer}>
          {logs.length === 0 ? (
            <Text style={styles.empty}>No commands yet.</Text>
          ) : (
            logs.map(log => (
              <View key={`${log.id}-${log.status}`} style={styles.logEntry}>
                <Text style={styles.logType}>{log.type}</Text>
                <Text style={styles.logStatus}>{log.status}</Text>
                {log.status === 'rejected' && log.rejectionReason ? (
                  <Text style={styles.logReason}>{log.rejectionReason}</Text>
                ) : null}
                <Text style={styles.logTime}>{new Date(log.timestamp).toLocaleString()}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: '#fff', borderRadius: 8 },
  hint: { fontSize: 12, color: '#868e96', marginTop: 8 },
  logContainer: { maxHeight: 280, backgroundColor: '#f1f3f5', borderRadius: 8, padding: 10 },
  empty: { color: '#868e96', fontStyle: 'italic' },
  logEntry: { borderBottomWidth: 1, borderBottomColor: '#dee2e6', paddingVertical: 8 },
  logType: { fontWeight: 'bold' },
  logStatus: { fontSize: 12, color: '#495057' },
  logReason: { fontSize: 12, color: '#c92a2a', marginTop: 4 },
  logTime: { fontSize: 10, color: '#adb5bd', marginTop: 2 },
});
