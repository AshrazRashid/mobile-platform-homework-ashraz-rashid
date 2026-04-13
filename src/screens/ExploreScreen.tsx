import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { CommandRouter } from '../services/router/CommandRouter';
import type { ExploreFilter } from '../types/commands';

const CATEGORIES = ['All', 'Books', 'Tech'] as const;
const SORTS: Array<{ label: string; value: ExploreFilter['sortBy'] }> = [
  { label: 'Name', value: 'name' },
  { label: 'Date', value: 'date' },
];

const ITEMS = [
  { id: '1', name: 'Agent Protocol', category: 'Tech' },
  { id: '2', name: 'Command Router', category: 'Tech' },
  { id: '3', name: 'Mobile UX', category: 'Books' },
];

export const ExploreScreen = () => {
  const [filter, setFilter] = useState<ExploreFilter>({ category: 'All', sortBy: 'name' });

  useEffect(() => {
    const router = CommandRouter.getInstance();
    const unsubscribe = router.subscribe(cmd => {
      if (cmd.type === 'applyExploreFilter' && cmd.status === 'executed') {
        setFilter({
          category: String(cmd.payload.category),
          sortBy: cmd.payload.sortBy === 'date' ? 'date' : 'name',
        });
      }
    });
    return unsubscribe;
  }, []);

  const apply = (category: string, sortBy: ExploreFilter['sortBy']) => {
    CommandRouter.getInstance()
      .propose('applyExploreFilter', { category, sortBy })
      .catch(() => {});
  };

  const filtered =
    filter.category === 'All'
      ? ITEMS
      : ITEMS.filter(i => i.category === filter.category);

  const sorted = [...filtered].sort((a, b) => {
    if (filter.sortBy === 'date') {
      return a.id.localeCompare(b.id);
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore</Text>

      <Text style={styles.sectionLabel}>Category</Text>
      <View style={styles.row}>
        {CATEGORIES.map(c => (
          <TouchableOpacity
            key={c}
            style={[styles.chip, filter.category === c && styles.chipActive]}
            onPress={() => apply(c, filter.sortBy)}
          >
            <Text style={[styles.chipText, filter.category === c && styles.chipTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Sort</Text>
      <View style={styles.row}>
        {SORTS.map(s => (
          <TouchableOpacity
            key={s.value}
            style={[styles.chip, filter.sortBy === s.value && styles.chipActive]}
            onPress={() => apply(filter.category, s.value)}
          >
            <Text style={[styles.chipText, filter.sortBy === s.value && styles.chipTextActive]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.filterBar}>
        <Text style={styles.filterText}>Active: {filter.category}</Text>
        <Text style={styles.filterText}>Sort: {filter.sortBy}</Text>
      </View>

      <FlatList
        data={sorted}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemMeta}>{item.category}</Text>
          </View>
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  sectionLabel: { fontSize: 13, color: '#868e96', marginBottom: 6, marginTop: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
  },
  chipActive: { backgroundColor: '#4c6ef5' },
  chipText: { color: '#495057', fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: '#fff' },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
    padding: 10,
    backgroundColor: '#f1f3f5',
    borderRadius: 8,
  },
  filterText: { fontWeight: '500', fontSize: 13 },
  item: { padding: 15, backgroundColor: '#fff', marginBottom: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e9ecef' },
  itemName: { fontWeight: '600' },
  itemMeta: { fontSize: 12, color: '#868e96', marginTop: 4 },
});
