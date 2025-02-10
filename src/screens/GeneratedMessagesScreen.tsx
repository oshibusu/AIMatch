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
            <Icon name="arrow-back-outline" size={22} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>生成結果</Text>
        </View>
        <TouchableOpacity onPress={handleRegenerate} style={styles.regenerateButton}>
          <Icon name="refresh-outline" size={18} color="#333" style={{ marginRight: 5 }} />
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
        /**
         * ここでポイント:
         *  - 短文の場合にページ内に収めたい→Card間のマージンや行間を小さくする
         *  - ScrollView自体は残し、入り切らない場合にスクロール可能にする
         */
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          {messages.map((message, index) => (
            <View key={index} style={styles.messageCard}>
              <Text style={styles.messageIndex}>提案 {index + 1}</Text>
              <Text style={styles.messageText}>{message}</Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.adjustButton]}
                  onPress={() => handleAdjust(index)}
                >
                  <Text style={styles.adjustButtonText}>微調整</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.adoptButton]}
                  onPress={() => handleAdopt(message)}
                >
                  {/* ボタンの文字を白などにして、黒背景でも見やすく */}
                  <Text style={styles.adoptButtonText}>コピーする</Text>
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
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  regenerateButton: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  regenerateButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  noMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMessageText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  noMessageRetryButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  noMessageRetryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 10,
    paddingBottom: 20,
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageIndex: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#E94C89',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    // iOS/Android両対応のためmarginRight/Leftよりgapを使用
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4, // gap代わり
  },
  adjustButton: {
    backgroundColor: '#f0f0f0',
  },
  adoptButton: {
    backgroundColor: '#333',
  },
  adjustButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  adoptButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff', // 黒背景でも文字が見やすいよう白に
  },
});
