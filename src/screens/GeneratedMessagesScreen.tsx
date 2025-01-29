import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Clipboard,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { supabase } from '../lib/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'GeneratedMessages'>;

export const GeneratedMessagesScreen: React.FC<Props> = ({ navigation, route }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateMessages();
  }, []);

  const generateMessages = async (useDeepseek: boolean = false) => {
    try {
      setLoading(true);
      // Supabaseを使用してAIにメッセージを生成させる
      const { data, error } = await supabase.functions.invoke('generate-messages', {
        body: {
          images: route.params.images,
          tone: route.params.adjustedTone,
          useDeepseek,
        },
      });

      if (error) throw error;

      // 5-7個のメッセージを設定
      setMessages(data.messages.slice(0, 7));
    } catch (error) {
      console.error('Error generating messages:', error);
      // エラー時のデモメッセージ
      setMessages([
        'もし良ければ今度の月曜日デートに行かない？',
        '今度の日曜日は何してるの？',
        'それめっちゃ面白かったよね！',
        '一緒にカフェ巡りでもどう？',
        'お互いの趣味について話してみたいな！',
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjust = (index: number) => {
    const message = messages[index];
    navigation.navigate('TextEdit', { message });
  };

  const handleAdopt = async (message: string) => {
    try {
      await Clipboard.setString(message);
      navigation.navigate('CopyCompleted');
    } catch (error) {
      console.error('Error copying message:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>生成結果</Text>
        </View>
        <TouchableOpacity
          onPress={() => generateMessages(true)}
          style={styles.regenerateButton}
        >
          <Text style={styles.regenerateButtonText}>再生成</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>メッセージを生成中...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {messages.map((message, index) => (
            <View key={index} style={styles.messageCard}>
              <Text style={styles.messageIndex}>{index + 1}個目</Text>
              <Text style={styles.messageText}>{message}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.adjustButton]}
                  onPress={() => handleAdjust(index)}
                >
                  <Text style={styles.buttonText}>微調整</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.adoptButton]}
                  onPress={() => handleAdopt(message)}
                >
                  <Text style={styles.buttonText}>採用（コピー）</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  regenerateButton: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 8,
  },
  regenerateButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageIndex: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  adjustButton: {
    backgroundColor: '#f0f0f0',
  },
  adoptButton: {
    backgroundColor: '#333',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});

export default GeneratedMessagesScreen;