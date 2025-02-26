import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatBot'>;

type Message = {
  id: string;
  content: string;
  created_at: string;
  is_user: boolean;
};

type Partner = {
  partner_id: string;
  partner_name: string;
  created_at: string;
  profiles?: {
    recognized_text: string | null;
  }[];
  messages?: {
    recognized_text: string | null;
    created_at: string;
  }[];
};

const ChatBotScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [partner, setPartner] = useState<Partner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  
  const route = useRoute();
  const { partnerId } = route.params as { partnerId: string };
  const navigation = useNavigation();

  // 初期メッセージを設定
  const initialBotMessage: Message = {
    id: 'initial-message',
    content: 'こんにちは！マッチングアプリに関する質問や、相手とのやり取りについて何でも聞いてください。簡潔にお答えします。',
    created_at: new Date().toISOString(),
    is_user: false,
  };

  useEffect(() => {
    loadPartnerInfo();
    loadChatHistory();
  }, [partnerId]);

  const loadPartnerInfo = async () => {
    try {
      setIsLoading(true);
      
      // パートナー情報、プロフィール、メッセージ履歴を一度に取得
      const { data, error } = await supabase
        .from('partners')
        .select(`
          partner_id,
          partner_name,
          created_at,
          profiles (recognized_text),
          messages (recognized_text, created_at)
        `)
        .eq('partner_id', partnerId)
        .single();

      if (error) throw error;
      
      if (data) {
        setPartner(data as Partner);
        console.log('Partner data loaded:', data);
      }
    } catch (error) {
      console.error('Error loading partner info:', error);
      Alert.alert('エラー', 'パートナー情報の読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const loadChatHistory = async () => {
    try {
      // テーブルが存在するか確認
      const { error: tableCheckError } = await supabase
        .from('chatbot_messages')
        .select('id')
        .limit(1);
      
      // テーブルが存在しない場合は初期メッセージのみ表示
      if (tableCheckError) {
        console.log('chatbot_messages table might not exist yet:', tableCheckError);
        setMessages([initialBotMessage]);
        return;
      }
      
      // チャットボットとの会話履歴を取得
      const { data, error } = await supabase
        .from('chatbot_messages')
        .select('id, content, created_at, is_user')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching chat history:', error);
        setMessages([initialBotMessage]);
        return;
      }
      
      if (data && data.length > 0) {
        console.log('Chat history loaded:', data.length, 'messages');
        // データベースから取得したメッセージを設定
        setMessages(data.map(msg => ({
          id: msg.id,
          content: msg.content,
          created_at: msg.created_at,
          is_user: msg.is_user,
        })));
      } else {
        console.log('No chat history found, showing initial message');
        // 会話履歴がない場合は初期メッセージを表示
        setMessages([initialBotMessage]);
        
        // 初期メッセージをデータベースに保存
        try {
          const { data: savedInitialMessage, error: saveError } = await supabase
            .from('chatbot_messages')
            .insert({
              partner_id: partnerId,
              content: initialBotMessage.content,
              is_user: false,
            })
            .select()
            .single();
            
          if (saveError) {
            console.error('Error saving initial message:', saveError);
          } else {
            console.log('Initial message saved:', savedInitialMessage);
          }
        } catch (dbError) {
          console.error('Database error saving initial message:', dbError);
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // エラーが発生しても初期メッセージは表示
      setMessages([initialBotMessage]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    const userMessage = inputText.trim();
    setInputText('');
    setIsSending(true);
    
    // ユーザーメッセージをUIに追加
    const newUserMessage: Message = {
      id: `user-${Date.now()}`,
      content: userMessage,
      created_at: new Date().toISOString(),
      is_user: true,
    };
    
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    
    // スクロールを最下部に移動
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      console.log('User message added to local state:', userMessage);
      
      try {
        // ユーザーメッセージをデータベースに保存
        const { data: savedUserMessage, error: saveError } = await supabase
          .from('chatbot_messages')
          .insert({
            partner_id: partnerId,
            content: userMessage,
            is_user: true,
          })
          .select()
          .single();

        if (saveError) {
          console.error('Error saving user message:', saveError);
          // エラーがあっても処理を続行
        } else {
          console.log('User message saved:', savedUserMessage);
        }
      } catch (dbError) {
        console.error('Database error saving user message:', dbError);
        // エラーがあっても処理を続行
      }
      
      // ローディングメッセージを追加
      const loadingMessage: Message = {
        id: 'loading-message',
        content: '返信を考えています...',
        created_at: new Date().toISOString(),
        is_user: false,
      };
      
      setMessages(prevMessages => [...prevMessages, loadingMessage]);
      
      // スクロールを最下部に移動
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      // AIの応答を生成
      const botResponse = await generateBotResponse(userMessage);
      
      // ローディングメッセージを削除し、実際の応答を追加
      setMessages(prevMessages => {
        const filteredMessages = prevMessages.filter(msg => msg.id !== 'loading-message');
        return [
          ...filteredMessages,
          {
            id: `bot-${Date.now()}`,
            content: botResponse,
            created_at: new Date().toISOString(),
            is_user: false,
          }
        ];
      });
      
      console.log('Bot message added to local state:', botResponse);
      
      try {
        // ボットの応答をデータベースに保存
        const { data: savedBotMessage, error: botSaveError } = await supabase
          .from('chatbot_messages')
          .insert({
            partner_id: partnerId,
            content: botResponse,
            is_user: false,
          })
          .select()
          .single();

        if (botSaveError) {
          console.error('Error saving bot message:', botSaveError);
        } else {
          console.log('Bot message saved:', savedBotMessage);
        }
      } catch (dbError) {
        console.error('Database error saving bot message:', dbError);
      }
      
      // スクロールを最下部に移動
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
    } catch (error) {
      console.error('Error in message handling:', error);
      Alert.alert('エラー', 'メッセージの送信に失敗しました');
    } finally {
      setIsSending(false);
    }
  };

  const generateBotResponse = async (userMessage: string): Promise<string> => {
    try {
      // プロフィール情報とメッセージ履歴を取得
      const profileText = partner?.profiles?.[0]?.recognized_text || '';
      const messageHistory = partner?.messages?.map(msg => msg.recognized_text).filter(Boolean).join('\n') || '';
      
      console.log('Calling OpenAI API via Edge Function:', {
        userMessage,
        partnerName: partner?.partner_name || '',
        profileInfo: profileText,
        conversationHistory: messageHistory,
      });
      
      // Edge Functionを呼び出してAI応答を生成
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      const response = await fetch('https://wqnbawipmolofzivwixt.supabase.co/functions/v1/generate-chatbot-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          userMessage,
          partnerName: partner?.partner_name || '',
          profileInfo: profileText,
          conversationHistory: messageHistory,
        }),
      });

      if (!response.ok) {
        console.error('Edge Function error:', await response.text());
        throw new Error('AI応答の生成に失敗しました');
      }

      const data = await response.json();
      return data.response || '申し訳ありません、応答の生成に問題が発生しました。もう一度お試しください。';
      
    } catch (error) {
      console.error('Error generating bot response:', error);
      
      // エラー時のフォールバック応答
      if (userMessage.includes('自己紹介') || userMessage.includes('プロフィール')) {
        return `${partner?.partner_name || '相手'}のプロフィールを分析すると、趣味や興味に触れながら自己紹介するのが良いでしょう。共通の話題があれば、それを中心に会話を始めるのがおすすめです。`;
      } else if (userMessage.includes('デート') || userMessage.includes('誘い方')) {
        return `デートに誘う際は、${partner?.partner_name || '相手'}のプロフィールに書かれている興味や趣味に関連した場所を提案すると良いでしょう。「〇〇に興味があるようですが、今度一緒に行ってみませんか？」というアプローチが効果的です。`;
      } else if (userMessage.includes('返信') || userMessage.includes('返事')) {
        return `返信する際は、${partner?.partner_name || '相手'}の前回のメッセージの内容に触れつつ、新しい話題も提供すると会話が続きやすくなります。質問を1つ入れると返信がもらいやすくなりますよ。`;
      } else {
        return `${partner?.partner_name || '相手'}とのコミュニケーションでは、相手の興味や価値観を尊重し、共感を示すことが大切です。自然な会話の流れを心がけ、押し付けがましくならないようにしましょう。何か具体的なアドバイスが必要でしたら、もう少し詳しく教えてください。`;
      }
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-left" size={24} color="#000" />
      </TouchableOpacity>
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>
          {partner?.partner_name || 'チャットボット'}のアドバイザー
        </Text>
      </View>
      <TouchableOpacity
        style={styles.helpButton}
        onPress={() => Alert.alert(
          'チャットボットの使い方',
          'このチャットボットは、マッチングアプリでの会話や相手とのコミュニケーションについてアドバイスします。\n\n• プロフィールの書き方\n• メッセージの返信方法\n• デートへの誘い方\n• 会話の続け方\n\nなど、恋愛やマッチングに関する質問をしてみてください。'
        )}
      >
        <Icon name="help-circle-outline" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );

  const renderMessage = ({ item }: { item: Message }) => {
    // ローディング中のメッセージの場合
    if (item.id === 'loading-message') {
      return (
        <View style={[styles.messageContainer, styles.botMessage]}>
          <View style={styles.loadingBubble}>
            <ActivityIndicator size="small" color="#666" />
            <Text style={[styles.messageText, styles.botMessageText, styles.loadingText]}>
              返信を考えています...
            </Text>
          </View>
        </View>
      );
    }
    
    // 通常のメッセージの場合
    return (
      <View style={[
        styles.messageContainer,
        item.is_user ? styles.userMessage : styles.botMessage
      ]}>
        <Text style={[
          styles.messageText,
          item.is_user ? styles.userMessageText : styles.botMessageText
        ]}>
          {item.content}
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4B7BF5" />
          <Text style={styles.screenLoadingText}>読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="質問やアドバイスを求める内容を入力..."
            multiline
            editable={!isSending}
          />
          <TouchableOpacity 
            style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={isSending || !inputText.trim()}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Icon name="send" size={24} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  helpButton: {
    padding: 8,
    marginLeft: 8,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4B7BF5',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E9ECEF',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  botMessageText: {
    color: '#1A1A1A',
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  loadingText: {
    marginLeft: 8,
    fontStyle: 'italic',
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  input: {
    flex: 1,
    marginRight: 12,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 24,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4B7BF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#A0AEC0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenLoadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});

export default ChatBotScreen;