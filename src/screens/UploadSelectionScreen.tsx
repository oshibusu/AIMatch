import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const UploadSelectionScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back-outline" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>何をアップロードしますか？</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('PhotoUpload', { type: 'newProfile' })}
        >
          <Icon name="person-add-outline" size={24} color="#007AFF" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>新しい相手のプロフィール</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('PhotoUpload', { type: 'newChat' })}
        >
          <Icon name="chatbubble-outline" size={24} color="#007AFF" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>新しい相手とのチャット</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('PhotoUpload', { type: 'existingChat' })}
        >
          <Icon name="add-circle-outline" size={24} color="#007AFF" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>既存のチャットに追加</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('PhotoUpload', { type: 'existingProfile' })}
        >
          <Icon name="person-outline" size={24} color="#007AFF" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>既存のプロフィールに追加</Text>
        </TouchableOpacity>
      </View>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    padding: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  buttonIcon: {
    marginRight: 16,
  },
  buttonText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
});

export default UploadSelectionScreen;