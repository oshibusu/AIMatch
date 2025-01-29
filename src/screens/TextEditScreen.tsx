import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Clipboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'TextEdit'>;

export const TextEditScreen: React.FC<Props> = ({ navigation, route }) => {
  const [editedMessage, setEditedMessage] = useState(route.params.message);

  const handleAdopt = async () => {
    try {
      await Clipboard.setString(editedMessage);
      navigation.navigate('CopyCompleted');
    } catch (error) {
      console.error('Error copying message:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back-outline" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>テキスト修正</Text>
        <View style={styles.headerRight} />
      </View>

      {/* 編集エリア */}
      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={editedMessage}
            onChangeText={setEditedMessage}
            multiline
            autoFocus
            textAlignVertical="top"
          />
          <TouchableOpacity style={styles.editIcon}>
            <Icon name="pencil" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* 採用ボタン */}
        <TouchableOpacity
          style={styles.adoptButton}
          onPress={handleAdopt}
        >
          <Text style={styles.adoptButtonText}>採用（コピー）</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    position: 'relative',
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    padding: 0,
    minHeight: 100,
  },
  editIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  adoptButton: {
    backgroundColor: '#333',
    paddingVertical: 15,
    borderRadius: 30,
    marginBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  adoptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default TextEditScreen;