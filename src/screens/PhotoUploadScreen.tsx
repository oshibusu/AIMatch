import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { supabase } from '../lib/supabase';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

// 型定義
type NavigationProps = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'PhotoUpload'>;

const PhotoUploadScreen = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<RouteProps>();

  // 画面がフォーカスされた時のリセット処理
  useFocusEffect(
    React.useCallback(() => {
      setSelectedImage(null);
      setIsUploading(false);
    }, [])
  );

  // 画面遷移前のリセット処理
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      setSelectedImage(null);
      setIsUploading(false);
    });
    return unsubscribe;
  }, [navigation]);

  // 画像選択
  const handleImageSelect = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });
      if (result.assets && result.assets[0]?.uri) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('エラー', '画像の選択中にエラーが発生しました。');
    }
  };

  // Edge Function(process-image)を呼び出してOCRなどの処理
  const handleUploadPress = async () => {
    if (!selectedImage) {
      Alert.alert('エラー', '画像を選択してください。');
      return;
    }

    try {
      setIsUploading(true);
      console.log('Starting image upload process...');

      // 画像をBlob化
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      console.log('Image blob created, size:', blob.size);

      // ユーザー情報取得
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        console.error('User authentication error:', userError);
        throw new Error('ユーザー情報を取得できません');
      }

      const userId = userData.user.id;
      const timestamp = new Date().toISOString();
      console.log('Current user ID:', userId);

      // Blob → Base64変換
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('画像のBase64変換に失敗'));
          }
        };
        reader.onerror = () => reject(reader.error);
      });
      reader.readAsDataURL(blob);
      const base64Data = await base64Promise;
      const base64Clean = base64Data.split(',')[1]; // プレフィックスを除去

      console.log('Base64 data length:', base64Clean.length);
      console.log('Request payload:', {
        userId,
        timestamp,
        imageLength: base64Clean.length,
      });

      // Edge Function "process-image" を呼び出してOCR/DB保存などを実行
      console.log('Calling Edge Function for image processing...');
      const { data: processedData, error: processError } = await supabase.functions.invoke('process-image', {
        body: {
          image: base64Clean,
          userId,
          timestamp,
        },
      });

      if (processError) {
        console.error('Image processing error:', processError);
        throw processError;
      }
      if (!processedData) {
        throw new Error('Edge Functionから有効なレスポンスがありません');
      }

      console.log('Image processed successfully:', processedData);

      // 次画面(TextToneAdjustment)へ遷移 + OCR結果などを渡す
      Alert.alert('成功', '画像の処理が完了しました。次の画面でトーンを設定してください。', [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('TextToneAdjustment', {
              partnerId: processedData.partnerId,
              recognizedText: processedData.recognizedText,
              screenType: processedData.screenType,
              partnerName: processedData.partnerName,
            });
          },
        },
      ]);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('エラー', `処理に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>写真のアップロード</Text>
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => navigation.navigate('HowToUse')}
        >
          <Icon name="help-circle-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {selectedImage ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.selectedImage}
              resizeMode="contain"
            />
            <TouchableOpacity style={styles.changeImageButton} onPress={handleImageSelect}>
              <Text style={styles.changeImageText}>写真を変更</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleImageSelect}
            disabled={isUploading}
          >
            <Icon name="image-outline" size={40} color="#FF655B" />
            <Text style={styles.uploadText}>写真を選択</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedImage || isUploading) && styles.submitButtonDisabled,
          ]}
          onPress={handleUploadPress}
          disabled={!selectedImage || isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>アップロード</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PhotoUploadScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  helpButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  imageContainer: {
    width: '80%', // Reduced from 100% to 80%
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center', // Center the container
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 16,
    backgroundColor: 'rgba(255, 101, 91, 0.8)', // Semi-transparent Tinder-like red
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changeImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadButton: {
    width: '80%', // Match the image container width
    aspectRatio: 1,
    backgroundColor: '#FFF5F5', // Lighter shade of red
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFCCCB', // Light red border
    borderStyle: 'dashed',
    marginBottom: 20,
    alignSelf: 'center', // Center the button
  },
  uploadText: {
    marginTop: 12,
    fontSize: 16,
    color: '#FF655B', // Match the icon color
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  submitButton: {
    backgroundColor: '#FF655B',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
