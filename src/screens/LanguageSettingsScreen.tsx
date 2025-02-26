import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const languages = [
  '日本語',      // Japanese
  'English',     // English
  'Français',    // French
  'Español',     // Spanish
  '简体中文',    // Simplified Chinese
  '繁體中文',    // Traditional Chinese
];

const LanguageSettingsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { currentLanguage, onSelect } = route.params as {
    currentLanguage: string;
    onSelect: (language: string) => void;
  };

  const handleLanguageSelect = (language: string) => {
    onSelect(language);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Languages</Text>
      </View>

      <ScrollView style={styles.content}>
        {languages.map((language) => (
          <TouchableOpacity
            key={language}
            style={styles.languageItem}
            onPress={() => handleLanguageSelect(language)}
          >
            <Text style={styles.languageText}>{language}</Text>
            {currentLanguage === language && (
              <Icon name="checkmark" size={24} color="#FF4B8C" />
            )}
          </TouchableOpacity>
        ))}
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
    padding: 16,
    backgroundColor: '#FF4B8C',
  },
  backButton: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFF',
  },
  content: {
    flex: 1,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  languageText: {
    fontSize: 16,
    color: '#333',
  },
});

export default LanguageSettingsScreen;