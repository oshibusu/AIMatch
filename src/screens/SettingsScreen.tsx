import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from '../lib/supabase';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedLanguage, setSelectedLanguage] = useState('日本語');
  const [userProfile, setUserProfile] = useState<{
    name: string;
    avatar_url: string | null;
    email: string | null;
  } | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // メールアドレスを含むユーザープロフィールを設定
    setUserProfile({
      name: user.user_metadata?.name || 'User',
      avatar_url: user.user_metadata?.avatar_url || null,
      email: user.email || null
    });
  };

  const SettingItem = ({ 
    icon, 
    title, 
    onPress, 
    showArrow = true,
    rightComponent
  }: {
    icon?: string;
    title: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      {icon && <Icon name={icon} size={24} color="#666" style={styles.itemIcon} />}
      <Text style={styles.itemText}>{title}</Text>
      <View style={styles.rightContainer}>
        {rightComponent}
        {showArrow && <Icon name="chevron-forward" size={20} color="#999" />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Icon name="settings-outline" size={24} color="#FFF" />
        <Text style={styles.headerTitle}>設定</Text>
      </View>

      <ScrollView style={styles.content}>
       {/* Profile Section */}
       <TouchableOpacity
         style={styles.profileSection}
         onPress={() => navigation.navigate('EditProfile')}
       >
         <Image
           source={
             userProfile?.avatar_url
               ? { uri: userProfile.avatar_url }
               : require('../assets/default-avatar.jpg')
           }
           style={styles.avatar}
         />
         <View style={styles.userInfo}>
           <Text style={styles.userName}>{userProfile?.name || 'User'}</Text>
           <Text style={styles.userEmail}>{userProfile?.email || ''}</Text>
         </View>
       </TouchableOpacity>

       {/* Settings */}
       <View style={styles.section}>
         <SettingItem
           title="メッセージ生成言語"
           onPress={() => {
             // 言語選択モーダルを表示
             navigation.navigate('LanguageSettings', {
               currentLanguage: selectedLanguage,
               onSelect: (language: string) => setSelectedLanguage(language)
             });
           }}
           rightComponent={
             <Text style={styles.languageText}>{selectedLanguage}</Text>
           }
         />
       </View>

        {/* More Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>その他</Text>
          <SettingItem
            title="使い方"
            onPress={() => navigation.navigate('HowToUse')}
          />
          <SettingItem
            title="運営会社"
            onPress={() => navigation.navigate('AboutUs')}
          />
          <SettingItem
            title="プライバシーポリシー"
            onPress={() => navigation.navigate('PrivacyPolicy')}
          />
        </View>
      </ScrollView>
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
    backgroundColor: '#FF4B8C',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    padding: 16,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E9ECEF',
  },
  sectionTitle: {
    fontSize: 14,
    color: '#999',
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  itemIcon: {
    marginRight: 12,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageText: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
});

export default SettingsScreen;