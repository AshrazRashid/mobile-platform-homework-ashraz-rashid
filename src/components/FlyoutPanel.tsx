import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';

type Props = {
  visible: boolean;
  title?: string;
  onClose: () => void;
};

export const FlyoutPanel = ({ visible, title, onClose }: Props) => (
  <Modal visible={visible} animationType="slide" transparent>
    <View style={styles.backdrop}>
      <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={onClose} />
      <View style={styles.panel}>
        <Text style={styles.title}>{title ?? 'Agent flyout'}</Text>
        <Text style={styles.body}>
          Opened via structured command. Tap outside or use closeFlyout.
        </Text>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  backdropTouch: { flex: 1 },
  panel: {
    backgroundColor: '#fff',
    padding: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    minHeight: 180,
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  body: { color: '#495057', marginBottom: 16 },
  closeBtn: { alignSelf: 'flex-start', paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#4c6ef5', borderRadius: 8 },
  closeText: { color: '#fff', fontWeight: '600' },
});
