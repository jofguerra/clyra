import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Send, Bot, User, ScanLine } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AppHeader from '../../components/AppHeader';
import ProGate from '../../components/ProGate';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useStore } from '../../hooks/useStore';
import { useT } from '../../hooks/useT';
import { chatWithAI, ChatMessage as AIChatMessage } from '../../services/openai';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DisplayMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ item }: { item: DisplayMessage }) {
  const isAi = item.role === 'ai';
  return (
    <View style={[styles.messageWrapper, isAi ? styles.messageWrapperAi : styles.messageWrapperUser]}>
      {isAi && (
        <View style={[styles.avatar, styles.avatarAi]}>
          <Bot size={16} color={Colors.primary} />
        </View>
      )}
      <View style={[styles.bubble, isAi ? styles.bubbleAi : styles.bubbleUser]}>
        <Text style={[styles.messageText, isAi ? styles.messageTextAi : styles.messageTextUser]}>
          {item.text}
        </Text>
      </View>
      {!isAi && (
        <View style={[styles.avatar, styles.avatarUser]}>
          <User size={16} color={Colors.foreground} />
        </View>
      )}
    </View>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingBubble({ label }: { label: string }) {
  return (
    <View style={[styles.messageWrapper, styles.messageWrapperAi]}>
      <View style={[styles.avatar, styles.avatarAi]}>
        <Bot size={16} color={Colors.primary} />
      </View>
      <View style={[styles.bubble, styles.bubbleAi, styles.typingBubble]}>
        <ActivityIndicator size="small" color={Colors.primary} style={{ marginRight: 8 }} />
        <Text style={styles.typingText}>{label}</Text>
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function ChatScreen() {
  const router = useRouter();
  const t = useT();
  const biomarkers = useStore(s => s.biomarkers);
  const language = useStore(s => s.language);
  const age = useStore(s => s.age);
  const sex = useStore(s => s.sex);
  const healthGoals = useStore(s => s.healthGoals);
  const isPro = useStore(s => s.isPro);
  const hasBiomarkers = biomarkers.length > 0;

  // Build welcome message with disclaimer
  const disclaimer = t('disclaimerChat');
  const welcomeText = hasBiomarkers
    ? `${t('chatWelcome', { n: biomarkers.length })}\n\n⚕️ ${disclaimer}`
    : t('chatWelcomeNoData');

  const [messages, setMessages] = useState<DisplayMessage[]>([
    { id: '0', role: 'ai', text: welcomeText },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Keep a parallel history for the AI API (OpenAI format)
  const aiHistory = useRef<AIChatMessage[]>([]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 80);
  }, []);

  const handleSend = useCallback(async (text: string = inputText) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    // Add user message to display
    const userMsg: DisplayMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: trimmed,
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    scrollToBottom();

    // Add to AI history
    aiHistory.current = [...aiHistory.current, { role: 'user', content: trimmed }];

    try {
      const reply = await chatWithAI({
        messages: aiHistory.current,
        biomarkers,
        lang: language as 'en' | 'es',
        userAge: age,
        userSex: sex,
        healthGoals: healthGoals.length > 0 ? healthGoals : undefined,
      });

      // Add AI reply to history
      aiHistory.current = [...aiHistory.current, { role: 'assistant', content: reply }];

      const aiMsg: DisplayMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: reply,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errMsg: DisplayMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: t('chatErrorMsg'),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
      scrollToBottom();
    }
  }, [inputText, isTyping, biomarkers, language, age, sex, healthGoals, t, scrollToBottom]);

  const quickQuestions = [
    t('chatQuick1'),
    t('chatQuick2'),
    t('chatQuick3'),
    t('chatQuick4'),
  ];

  // Gate chat behind Pro (free users get a preview message only)
  if (!isPro && hasBiomarkers) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader title={t('chatTitle')} />
        <ProGate feature={language === 'es' ? 'Chat de Salud con IA' : 'AI Health Chat'} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title={t('chatTitle')} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <MessageBubble item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListFooterComponent={isTyping ? <TypingBubble label={t('chatTyping')} /> : null}
        />

        <View style={styles.inputArea}>
          {/* Quick question chips — only shown when there's biomarker data */}
          {hasBiomarkers && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
              <View style={styles.chipsContainer}>
                {quickQuestions.map((q, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.chip}
                    onPress={() => handleSend(q)}
                    disabled={isTyping}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.chipText}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}

          {/* No data CTA */}
          {!hasBiomarkers && (
            <TouchableOpacity
              style={styles.noDataCTA}
              onPress={() => router.push('/(tabs)/upload')}
              activeOpacity={0.85}
            >
              <ScanLine size={16} color={Colors.primary} />
              <Text style={styles.noDataCTAText}>{t('uploadResults')}</Text>
            </TouchableOpacity>
          )}

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder={t('chatPlaceholder')}
              placeholderTextColor={Colors.mutedForeground}
              multiline
              onSubmitEditing={() => handleSend()}
              blurOnSubmit={false}
              editable={!isTyping}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || isTyping) && styles.sendButtonDisabled]}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || isTyping}
              activeOpacity={0.85}
            >
              <Send size={18} color="white" style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimer}>{t('chatDisclaimer')}</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },

  listContent: {
    padding: 16, paddingBottom: 12, flexGrow: 1, justifyContent: 'flex-end',
  },

  // Messages
  messageWrapper: {
    flexDirection: 'row', alignItems: 'flex-end',
    marginBottom: 12, maxWidth: '88%',
  },
  messageWrapperAi: { alignSelf: 'flex-start' },
  messageWrapperUser: { alignSelf: 'flex-end' },
  avatar: {
    width: 28, height: 28, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarAi: { backgroundColor: Colors.primary10, marginRight: 8 },
  avatarUser: { backgroundColor: Colors.secondary, marginLeft: 8 },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleAi: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  bubbleUser: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  messageText: {
    fontFamily: Typography.families.body, fontSize: 14, lineHeight: 21,
  },
  messageTextAi: { color: Colors.foreground },
  messageTextUser: { color: 'white' },

  // Typing indicator
  typingBubble: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  typingText: {
    fontFamily: Typography.families.body,
    fontSize: 12, color: Colors.mutedForeground, fontStyle: 'italic',
  },

  // Input area
  inputArea: {
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border,
    backgroundColor: Colors.background, paddingVertical: 10,
  },
  chipsScroll: { maxHeight: 42, marginBottom: 10 },
  chipsContainer: {
    flexDirection: 'row', paddingHorizontal: 16, gap: 8, alignItems: 'center',
  },
  chip: {
    backgroundColor: Colors.primary10,
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: Colors.primary + '25',
  },
  chipText: {
    fontFamily: Typography.families.body,
    fontSize: 12, color: Colors.primary, fontWeight: '600',
  },

  // No data CTA
  noDataCTA: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: Colors.primary10, borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: Colors.primary + '25',
  },
  noDataCTAText: {
    fontFamily: Typography.families.body,
    fontSize: 13, fontWeight: '700', color: Colors.primary,
  },

  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 16, marginBottom: 6, gap: 10,
  },
  input: {
    flex: 1, backgroundColor: Colors.secondary,
    borderRadius: 20, paddingTop: 12, paddingBottom: 12, paddingHorizontal: 16,
    minHeight: 44, maxHeight: 120,
    fontFamily: Typography.families.body, fontSize: 14, color: Colors.foreground,
    borderWidth: 1, borderColor: Colors.border,
  },
  sendButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 3,
  },
  sendButtonDisabled: { opacity: 0.45, shadowOpacity: 0 },

  disclaimer: {
    fontFamily: Typography.families.body,
    fontSize: 10, color: Colors.mutedForeground,
    textAlign: 'center', paddingHorizontal: 16,
  },
});
