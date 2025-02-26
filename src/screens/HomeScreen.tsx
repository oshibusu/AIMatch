import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Partner = {
  partner_id: string;
  partner_name: string;
  created_at: string;
};

const HomeScreen = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // 初回マウント時のデータ取得
  useEffect(() => {
    loadPartners();
  }, []);

  // 画面にフォーカスが戻ったときにもデータを再取得する
  useFocusEffect(
    useCallback(() => {
      loadPartners();
    }, [])
  );

  const loadPartners = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) throw new Error('ユーザー情報が取得できません');

      console.log('Current user:', userData.user.id);

      const { data, error } = await supabase
        .from('partners')
        .select(`
          partner_id,
          partner_name,
          created_at
        `)
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Fetched partners:', data);
      if (!data || data.length === 0) {
        console.log('No partners found');
      }

      // "不明さん"という名前のパートナーを除外
      const filteredPartners = (data || []).filter(partner => partner.partner_name !== '不明さん');
      setPartners(filteredPartners);
    } catch (err) {
      console.error('Error loading partners:', err);
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  // パートナーIDに基づいて一貫した色とアイコンを生成する関数
  const getPartnerVisuals = (partnerId: string) => {
    // 色のリスト
    const colors = [
      '#4B7BF5', // 青
      '#F5724B', // オレンジ
      '#4BF57C', // 緑
      '#F54B7C', // ピンク
      '#7C4BF5', // 紫
      '#F5D14B', // 黄色
      '#4BF5D1', // ターコイズ
      '#F54BD1'  // マゼンタ
    ];
    
    // アイコンのリスト
    const icons = [
      'account',
      'robot',
      'face-agent',
      'emoticon',
      'account-voice',
      'account-star',
      'account-tie',
      'account-box'
    ];
    
    // パートナーIDの文字コードの合計を計算
    const sum = partnerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // 色とアイコンのインデックスを計算
    const colorIndex = sum % colors.length;
    const iconIndex = (sum + 3) % icons.length; // 少し異なる分布にするために+3
    
    return {
      color: colors[colorIndex],
      icon: icons[iconIndex]
    };
  };

  const renderPartnerItem = ({ item }: { item: Partner }) => {
    console.log('Rendering partner:', item);
    
    // パートナーの視覚的要素を取得
    const { color, icon } = getPartnerVisuals(item.partner_id);
    
    return (
      <TouchableOpacity
        style={styles.partnerItem}
        onPress={() => navigation.navigate('ChatBot', { partnerId: item.partner_id })}
      >
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: color }]}>
            <Icon name={icon} size={35} color="#fff" />
          </View>
        </View>
        <View style={styles.partnerInfo}>
          <Text style={styles.partnerName}>{item.partner_name || '名前なし'}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            新しい会話を始めましょう
          </Text>
        </View>
        <Text style={styles.timeStamp}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>チャットボット</Text>
      <View style={styles.headerRight}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('HowToUse')}>
          <Ionicons name="help-circle-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#4B7BF5" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadPartners}>
            <Text style={styles.retryButtonText}>再試行</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {partners.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>まだパートナーがいません</Text>
          <Text style={styles.emptySubText}>写真をアップロードして始めましょう</Text>
        </View>
      ) : (
        <FlatList
          data={partners}
          renderItem={renderPartnerItem}
          keyExtractor={(item) => item.partner_id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContainer: {
    paddingVertical: 8,
  },
  partnerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerInfo: {
    flex: 1,
    marginRight: 8,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  timeStamp: {
    fontSize: 12,
    color: '#999',
  },
  errorText: {
    fontSize: 16,
    color: '#FF4B4B',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4B7BF5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;
