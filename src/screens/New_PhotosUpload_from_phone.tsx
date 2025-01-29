import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { launchImageLibrary } from 'react-native-image-picker';
import { supabase } from '../lib/supabase';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const New_PhotosUpload_from_phone = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'New_PhotosUpload_from_phone'>>();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const handleImageSelect = async (index: number) => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.assets && result.assets[0]?.uri) {
      const newImages = [...selectedImages];
      newImages[index] = result.assets[0].uri;
      setSelectedImages(newImages);
    }
  };

  const handleContinue = () => {
    if (selectedImages.length === 0) {
      Alert.alert('エラー', '少なくとも1枚の写真を選択してください');
      return;
    }

    navigation.navigate('TextToneAdjustment', {
      type: route.params.type,
      images: selectedImages.filter(Boolean)
    });
  };

  const renderPhotoSlot = (index: number) => {
    const isSelected = selectedImages[index] !== undefined;
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.photoSlot,
          isSelected && styles.photoSlotSelected
        ]}
        onPress={() => handleImageSelect(index)}
      >
        <Icon
          name={isSelected ? "checkmark-circle-outline" : "camera-outline"}
          size={30}
          color={isSelected ? "#E94C89" : "#999"}
        />
      </TouchableOpacity>
    );
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
        <Text style={styles.title}>Add more photos</Text>
        <TouchableOpacity style={styles.infoButton}>
          <Icon name="information-circle-outline" size={24} color="#999" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.photoGrid}>
          {[...Array(6)].map((_, index) => renderPhotoSlot(index))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.continueButton,
          selectedImages.length === 0 && styles.continueButtonDisabled
        ]}
        onPress={handleContinue}
        disabled={selectedImages.length === 0}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  backButton: {
    padding: 8,
  },
  infoButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
  },
  photoSlot: {
    width: '31%',
    aspectRatio: 0.75,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  photoSlotSelected: {
    borderStyle: 'solid',
    borderColor: '#E94C89',
  },
  continueButton: {
    backgroundColor: '#E94C89',
    marginHorizontal: 20,
    marginBottom: Platform.OS === 'ios' ? 30 : 20,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default New_PhotosUpload_from_phone;