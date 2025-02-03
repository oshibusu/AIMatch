import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Clipboard,
  SafeAreaView,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { supabase } from '../lib/supabase';
import Icon from 'react-native-vector-icons/Ionicons';

type Props = NativeStackScreenProps<RootStackParamList, 'GeneratedMessages'>;

export const GeneratedMessagesScreen: React.FC<Props> = ({ navigation, route }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // route.params から受け取るパラメータ
  const { recognizedText, tone, useDeepseek } = route.params || {};

  useEffect(() => {
    generateMessages(false);
  }, []);

  // Edge Function "generate-messages" 呼び出し
  const generateMessages = async (useDeepseekLocal: boolean) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('generate-messages', {
        body: {
          recognizedText,
          tone,
          useDeepseek: useDeepseekLocal,
        },
      });

      if (error) {
        console.error('Error from generate-messages:', error);
        throw error;
      }
      if (!data || !data.messages) {
        throw new Error('Edge Functionから有効なレスポンスがありません');
      }

      setMessages(data.messages.slice(0, 7)); // 7個まで
    } catch (err) {
      console.error('Error generating messages:', err);
      Alert.alert('エラー', `メッセージ生成に失敗しました: ${err instanceof Error ? err.message : '不明なエラー'}`);

      // 失敗時のダミーメッセージ
      setMessages([
        '（エラー）気軽に雑談しよう！',
        '（エラー）次の休みは何してるの？',
        '（エラー）一緒に遊びに行かない？',
      ]);
    } finally {
      setLoading(false);
    }
  };

  // メッセージ微調整
  const handleAdjust = (index: number) => {
    const message = messages[index];
    navigation.navigate('TextEdit', { message });
  };

  // 採用(コピー)
  const handleAdopt = async (message: string) => {
    try {
      await Clipboard.setString(message);
      navigation.navigate('CopyCompleted');
    } catch (error) {
      console.error('Error copying message:', error);
      Alert.alert('エラー', 'コピーに失敗しました');
    }
  };

  // "再生成"ボタン
  const handleRegenerate = () => {
    generateMessages(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back-outline" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>生成結果</Text>
        </View>
        <TouchableOpacity onPress={handleRegenerate} style={styles.regenerateButton}>
          <Icon name="refresh-outline" size={20} color="#333" style={{ marginRight: 5 }} />
          <Text style={styles.regenerateButtonText}>再生成</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E94C89" />
          <Text style={styles.loadingText}>メッセージを生成中です...</Text>
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.noMessageContainer}>
          <Text style={styles.noMessageText}>メッセージがありません</Text>
          <TouchableOpacity style={styles.noMessageRetryButton} onPress={handleRegenerate}>
            <Text style={styles.noMessageRetryText}>再生成</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 20 }}>
          {messages.map((message, index) => (
            <View key={index} style={styles.messageCard}>
              <Text style={styles.messageIndex}>提案 {index + 1}</Text>
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
                  <Text style={styles.buttonText}>採用(コピー)</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default GeneratedMessagesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  regenerateButton: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  regenerateButtonText: {
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
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  noMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMessageText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  noMessageRetryButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  noMessageRetryText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
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
    marginBottom: 6,
    color: '#E94C89',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
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
});
