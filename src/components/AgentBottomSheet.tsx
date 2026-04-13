import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { CommandRouter } from '../services/router/CommandRouter';
import type { Command, CommandType } from '../types/commands';

type ChatMsg = { id: string; role: 'user' | 'assistant'; text: string; at: number };

type ActivityLine = { id: string; text: string; at: number };

const WINDOW_H = Dimensions.get('window').height;
/** Cap sheet chrome so the tab bar + agent block stays a predictable fraction of the screen */
const SHEET_MAX_H = Math.min(340, WINDOW_H * 0.38);

const CAPABILITIES = `I can:
• Navigate between Home, Explore, and Profile
• Adjust Explore category + sort (structured applyExploreFilter)
• Change preferences only after you confirm (setPreference)
• Open/close the agent flyout, show alerts, export the audit log to on-device documents via the native module

I only emit commands the router allowlists and validates; I never mutate the UI directly.`;

function interpretUserMessage(text: string): {
  assistant: string;
  commands: Array<{ type: CommandType; payload: Record<string, unknown> }>;
} {
  const t = text.trim();
  const lower = t.toLowerCase();
  if (!t) {
    return { assistant: 'Ask what I can do, or try “go to Explore”.', commands: [] };
  }
  if (/what can|capabilities|help\b/i.test(lower)) {
    return { assistant: CAPABILITIES, commands: [] };
  }
  if (/^go to home|^open home|^home$/i.test(lower)) {
    return { assistant: 'Proposing navigation to Home.', commands: [{ type: 'navigate', payload: { screen: 'Home' } }] };
  }
  if (/go to explore|open explore|^explore$/i.test(lower)) {
    return { assistant: 'Proposing navigation to Explore.', commands: [{ type: 'navigate', payload: { screen: 'Explore' } }] };
  }
  if (/go to profile|open profile|^profile$/i.test(lower)) {
    return { assistant: 'Proposing navigation to Profile.', commands: [{ type: 'navigate', payload: { screen: 'Profile' } }] };
  }
  if (/books/i.test(lower) && /filter|explore|show/i.test(lower)) {
    return {
      assistant: 'Proposing Explore filter: Books, sorted by name.',
      commands: [{ type: 'applyExploreFilter', payload: { category: 'Books', sortBy: 'name' } }],
    };
  }
  if (/(export|save).*(audit|log)|audit log/i.test(lower)) {
    return {
      assistant: 'Proposing exportAuditLog — writes JSON to the app documents directory through the native module.',
      commands: [{ type: 'exportAuditLog', payload: {} }],
    };
  }
  if (/(open|show).*(flyout|panel)/i.test(lower)) {
    return {
      assistant: 'Proposing openFlyout.',
      commands: [{ type: 'openFlyout', payload: { title: 'Agent' } }],
    };
  }
  if (/(close|dismiss).*(flyout|panel)/i.test(lower)) {
    return { assistant: 'Proposing closeFlyout.', commands: [{ type: 'closeFlyout', payload: {} }] };
  }
  if (/alert\b/i.test(lower)) {
    return {
      assistant: 'Proposing showAlert with your message snippet.',
      commands: [
        {
          type: 'showAlert',
          payload: { title: 'Agent', message: t.length > 120 ? `${t.slice(0, 120)}…` : t },
        },
      ],
    };
  }
  if (/dark mode|darkmode/i.test(lower)) {
    const off = /off|disable/i.test(lower);
    return {
      assistant: off
        ? 'Proposing setPreference(darkMode, false) — please confirm.'
        : 'Proposing setPreference(darkMode, true) — please confirm.',
      commands: [{ type: 'setPreference', payload: { key: 'darkMode', value: !off } }],
    };
  }
  return {
    assistant:
      'No matching safe command. Try “what can you do?”, “go to Profile”, “export audit log”, or “open flyout”.',
    commands: [],
  };
}

export const AgentBottomSheet = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [activity, setActivity] = useState<ActivityLine[]>([]);
  const [proposedCommand, setProposedCommand] = useState<Command | null>(null);
  const router = CommandRouter.getInstance();

  useEffect(() => {
    return router.subscribe(cmd => {
      const reason = cmd.rejectionReason ? ` — ${cmd.rejectionReason}` : '';
      const line = `[${cmd.status}] ${cmd.type}${reason}`;
      setActivity(prev => [...prev.slice(-14), { id: `${cmd.id}-${cmd.status}-${cmd.timestamp}`, text: line, at: cmd.timestamp }]);

      if (cmd.status === 'pending' && cmd.requiresConfirmation) {
        setProposedCommand(cmd);
      }
      if (cmd.status === 'executed' || cmd.status === 'rejected') {
        setProposedCommand(cur => (cur?.id === cmd.id ? null : cur));
      }
    });
  }, [router]);

  const pushMsg = (role: ChatMsg['role'], text: string) => {
    setMessages(prev => [...prev, { id: Math.random().toString(36).slice(2), role, text, at: Date.now() }]);
  };

  const send = async () => {
    const t = input.trim();
    if (!t) {
      return;
    }
    pushMsg('user', t);
    setInput('');
    const { assistant, commands } = interpretUserMessage(t);
    pushMsg('assistant', assistant);
    for (const c of commands) {
      try {
        await router.propose(c.type, c.payload);
      } catch (e) {
        pushMsg('assistant', `Command rejected by router: ${(e as Error).message}`);
      }
    }
  };

  const handleConfirm = () => {
    if (proposedCommand) {
      router.confirm(proposedCommand.id).catch(err => console.error(err));
    }
  };

  const handleReject = () => {
    if (proposedCommand) {
      router.reject(proposedCommand.id, 'User declined in agent sheet');
      setProposedCommand(null);
    }
  };

  const mockPreferenceDemo = () => {
    pushMsg('assistant', 'Demo: proposing setPreference(darkMode, true). Confirm below.');
    router.propose('setPreference', { key: 'darkMode', value: true }).catch(() => {});
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.wrap}
    >
      <View style={[styles.sheet, { maxHeight: SHEET_MAX_H }]}>
        <View style={styles.sheetTopAccent} />
        <View style={styles.headerBlock}>
          <Text style={styles.header}>Agent</Text>
          <Text style={styles.subheader}>Structured commands · confirm to change state</Text>
        </View>

        <ScrollView
          style={styles.chatScroll}
          contentContainerStyle={styles.chatContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {messages.map(m => (
            <View
              key={m.id}
              style={[styles.bubble, m.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant]}
            >
              <Text style={m.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextAssistant}>{m.text}</Text>
            </View>
          ))}

          {proposedCommand ? (
            <View style={styles.proposalCard}>
              <Text style={styles.proposalTitle}>Proposed action</Text>
              <Text style={styles.proposalText}>
                Update preference “{String(proposedCommand.payload.key)}” → {String(proposedCommand.payload.value)}
              </Text>
              <View style={styles.btnRow}>
                <TouchableOpacity style={[styles.btn, styles.confirmBtn]} onPress={handleConfirm}>
                  <Text style={styles.btnText}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.rejectBtn]} onPress={handleReject}>
                  <Text style={styles.btnText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          <View style={styles.activityCard}>
            <Text style={styles.activityHeading}>Command activity</Text>
            {activity.length === 0 ? (
              <Text style={styles.muted}>No router events yet — send a message or run the demo.</Text>
            ) : (
              activity.map(a => (
                <Text key={a.id} style={styles.activityLine}>
                  {new Date(a.at).toLocaleTimeString()} · {a.text}
                </Text>
              ))
            )}
          </View>

          <TouchableOpacity style={styles.mockBtn} onPress={mockPreferenceDemo} activeOpacity={0.85}>
            <Text style={styles.mockBtnText}>Demo: dark mode proposal</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Message the agent…"
            placeholderTextColor={colors.placeholder}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={send}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={send} activeOpacity={0.9}>
            <Text style={styles.sendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const colors = {
  bg: '#ffffff',
  pageBg: '#f1f3f5',
  text: '#212529',
  textMuted: '#495057',
  placeholder: '#868e96',
  border: '#dee2e6',
  accent: '#4c6ef5',
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    backgroundColor: colors.pageBg,
  },
  sheet: {
    width: '100%',
    backgroundColor: colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  sheetTopAccent: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#dee2e6',
    marginTop: 8,
    marginBottom: 4,
  },
  headerBlock: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subheader: {
    marginTop: 4,
    fontSize: 12,
    color: colors.placeholder,
    textAlign: 'center',
  },
  chatScroll: {
    maxHeight: SHEET_MAX_H - 130,
    minHeight: 120,
  },
  chatContent: {
    paddingBottom: 8,
    flexGrow: 1,
  },
  bubble: { maxWidth: '92%', padding: 10, borderRadius: 12, marginBottom: 8 },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: colors.accent },
  bubbleAssistant: { alignSelf: 'flex-start', backgroundColor: '#e7ebf0' },
  bubbleTextUser: { color: '#fff', fontSize: 15, lineHeight: 20 },
  bubbleTextAssistant: { color: colors.text, fontSize: 15, lineHeight: 20 },
  proposalCard: {
    padding: 14,
    backgroundColor: '#fff9db',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffe066',
    marginBottom: 12,
  },
  proposalTitle: { fontWeight: '700', color: '#1a1a1b', marginBottom: 6 },
  proposalText: { color: colors.textMuted, fontSize: 14, marginBottom: 12, lineHeight: 20 },
  btnRow: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  confirmBtn: { backgroundColor: '#37b24d' },
  rejectBtn: { backgroundColor: '#fa5252' },
  btnText: { color: '#fff', fontWeight: '700' },
  activityCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 10,
  },
  activityHeading: { fontWeight: '700', marginBottom: 8, color: colors.text, fontSize: 13 },
  activityLine: { fontSize: 11, color: colors.textMuted, marginBottom: 4, lineHeight: 16 },
  muted: { color: colors.placeholder, fontSize: 13, lineHeight: 18 },
  mockBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#e7f5ff',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a5d8ff',
  },
  mockBtnText: { color: '#1864ab', fontWeight: '600', fontSize: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 8, paddingBottom: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: '#fff',
  },
  sendBtn: {
    backgroundColor: '#212529',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  sendBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
