import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const AboutUsScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.aboutContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/default-avatar.jpg')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          <Text style={styles.appName}>AIMatch</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.aboutText}>
            AIMatchは、AIを活用して人々のコミュニケーションをサポートし、より良い関係構築を促進するアプリケーションです。
            私たちは、テクノロジーの力を借りて、人々がより効果的に、より自信を持ってコミュニケーションできるよう支援することを目指しています。
          </Text>
          
          <Text style={styles.sectionTitle}>Our Team</Text>
          <Text style={styles.aboutText}>
            AIMatchは、コミュニケーションの課題を解決したいという情熱を持った開発者チームによって作られました。
            私たちは、ユーザーの皆様に最高の体験を提供するために日々努力しています。
          </Text>
          
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.aboutText}>
            ご質問やフィードバックがございましたら、以下のメールアドレスまでお気軽にお問い合わせください：
          </Text>
          <Text style={styles.contactEmail}>yutoshibuya@aimatch-mgs.com</Text>
          
          <Text style={styles.copyright}>© 2025 AIMatch. All rights reserved.</Text>
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
    padding: 16,
    backgroundColor: '#FF4B8C',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
  },
  content: {
    flex: 1,
  },
  aboutContainer: {
    padding: 24,
    alignItems: 'center',
  },
  logoContainer: {
    marginVertical: 24,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF4B8C',
    marginBottom: 8,
  },
  version: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  aboutText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    textAlign: 'left',
    alignSelf: 'stretch',
    marginBottom: 16,
  },
  contactEmail: {
    fontSize: 16,
    color: '#FF4B8C',
    marginBottom: 32,
  },
  copyright: {
    fontSize: 14,
    color: '#999',
    marginTop: 40,
    marginBottom: 24,
  },
});

export default AboutUsScreen;