import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { launchImageLibrary } from 'react-native-image-picker';
import { supabase } from '../lib/supabase';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PhotoUploadScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'PhotoUpload'>>();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageSelect = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.assets && result.assets[0]?.uri) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleUploadPress = async () => {
    if (!selectedImage) {
      Alert.alert('エラー', '画像を選択してください');
      return;
    }

    setIsUploading(true);

    try {
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const fileName = `${Date.now()}.jpg`;
      
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const timestamp = new Date().toISOString();

      // 新しい会話を作成（新しいプロフィールまたは新しいチャットの場合）
      if (route.params.type === 'newProfile' || route.params.type === 'newChat') {
        const { data: convData, error: convError } = await supabase
          .from('conversations')
          .insert([
            {
              user_id: userData.user.id,
              created_at: timestamp,
            }
          ])
          .select()
          .single();

        if (convError) throw convError;

        // メッセージを作成
        const { error: msgError } = await supabase
          .from('messages')
          .insert([
            {
              conversation_id: convData.conversation_id,
              sender_type: route.params.type === 'newProfile' ? 'profile' : 'chat',
              content: await blob.text(), // 画像をBase64エンコードされた文字列として保存
              created_at: timestamp,
            }
          ]);

        if (msgError) throw msgError;
      } else {
        // 既存の会話にメッセージを追加
        // TODO: 既存の会話IDを取得する処理を実装
        Alert.alert('注意', '既存の会話への追加は現在実装中です');
        return;
      }

      Alert.alert('成功', '画像のアップロードが完了しました');
      navigation.goBack();
    } catch (error) {
      Alert.alert('エラー', 'アップロードに失敗しました');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back-outline" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>写真をアップロード</Text>
      </View>
      
      <View style={styles.uploadArea}>
        <TouchableOpacity 
          style={[
            styles.circleContainer,
            selectedImage && styles.circleContainerSelected
          ]}
          onPress={handleImageSelect}
          disabled={isUploading}
        >
          {selectedImage ? (
            <Icon name="checkmark-circle-outline" size={40} color="#E94C89" />
          ) : (
            <Icon name="camera-outline" size={40} color="#999" />
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[
          styles.uploadButton,
          (!selectedImage || isUploading) && styles.uploadButtonDisabled
        ]}
        onPress={handleUploadPress}
        disabled={!selectedImage || isUploading}
      >
        {isUploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.uploadButtonText}>アップロード</Text>
        )}
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
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
    paddingHorizontal: 20,
    marginTop: Platform.OS === 'ios' ? 20 : 0,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginRight: 40,
  },
  uploadArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  circleContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleContainerSelected: {
    borderColor: '#E94C89',
    borderStyle: 'solid',
  },
  uploadButton: {
    backgroundColor: '#E94C89',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: Platform.OS === 'ios' ? 100 : 80,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    backgroundColor: '#ccc',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: Platform.OS === 'ios' ? 30 : 10,
  },
  backButton: {
    padding: 8,
  },
});

export default PhotoUploadScreen;