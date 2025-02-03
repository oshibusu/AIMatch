import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { launchImageLibrary } from 'react-native-image-picker';
import { supabase } from '../lib/supabase';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'PhotoUpload'>;

const PhotoUploadScreen = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'newProfile' | 'newChat' | 'existingChat' | null>(null);

  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();

  useEffect(() => {
    // 必要に応じて、route.params?.typeを反映
    if (route.params?.type) {
      setSelectedType(route.params.type);
    }
  }, [route.params]);

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

  // Edge Function(process-image)を呼び出してOCR
  const handleUploadPress = async () => {
    if (!selectedType) {
      setShowTypeModal(true);
      return;
    }
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

      // Blob → Base64
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

      // デバッグ用のログを追加
      console.log('Base64 data length:', base64Clean.length);
      console.log('Request payload:', {
        userId,
        timestamp,
        imageLength: base64Clean.length
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
        console.error('Image processing error:', {
          message: processError.message,
          cause: processError.cause,
          stack: processError.stack,
          details: processError
        });
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
          }
        }
      ]);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('エラー', `処理に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setIsUploading(false);
    }
  };

  // モーダル (アップロードタイプ選択)
  const renderTypeModal = () => (
    <Modal
      visible={showTypeModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowTypeModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>アップロードタイプを選択</Text>

          <TouchableOpacity
            style={styles.typeButton}
            onPress={() => {
              setSelectedType('newProfile');
              setShowTypeModal(false);
            }}
          >
            <Icon name="person-add-outline" size={24} color="#007AFF" style={styles.typeIcon} />
            <Text style={styles.typeButtonText}>新しい相手のプロフィール</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.typeButton}
            onPress={() => {
              setSelectedType('newChat');
              setShowTypeModal(false);
            }}
          >
            <Icon name="chatbubble-outline" size={24} color="#007AFF" style={styles.typeIcon} />
            <Text style={styles.typeButtonText}>新しい相手とのチャット</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.typeButton}
            onPress={() => {
              setSelectedType('existingChat');
              setShowTypeModal(false);
            }}
          >
            <Icon name="add-circle-outline" size={24} color="#007AFF" style={styles.typeIcon} />
            <Text style={styles.typeButtonText}>既存のチャットに追加</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowTypeModal(false)}
          >
            <Text style={styles.cancelButtonText}>キャンセル</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'newProfile':
        return '新しい相手のプロフィール';
      case 'newChat':
        return '新しい相手とのチャット';
      case 'existingChat':
        return '既存のチャットに追加';
      default:
        return 'アップロードタイプを選択';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>写真のアップロード</Text>
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
            <TouchableOpacity
              style={styles.changeImageButton}
              onPress={handleImageSelect}
            >
              <Text style={styles.changeImageText}>写真を変更</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleImageSelect}
            disabled={isUploading}
          >
            <Icon name="image-outline" size={40} color="#666" />
            <Text style={styles.uploadText}>写真を選択</Text>
          </TouchableOpacity>
        )}

        {/* 選択されたタイプ */}
        <TouchableOpacity
          style={styles.typeSelectButton}
          onPress={() => setShowTypeModal(true)}
        >
          <Icon name="list-outline" size={24} color="#007AFF" style={styles.typeIcon} />
          <Text style={styles.typeSelectText}>
            {selectedType ? getTypeLabel(selectedType) : 'アップロードタイプを選択'}
          </Text>
          <Icon name="chevron-forward-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedImage || !selectedType || isUploading) && styles.submitButtonDisabled
          ]}
          onPress={handleUploadPress}
          disabled={!selectedImage || !selectedType || isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>アップロード</Text>
          )}
        </TouchableOpacity>
      </View>

      {renderTypeModal()}
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  uploadText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  typeSelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  typeSelectText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 16,
  },
  typeIcon: {
    marginRight: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  submitButton: {
    backgroundColor: '#007AFF',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  typeButtonText: {
    fontSize: 16,
    color: '#000',
  },
  cancelButton: {
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});
