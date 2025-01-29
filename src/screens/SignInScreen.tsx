import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { supabase } from '../lib/supabase';
import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';

type SignInScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignIn'>;

interface SignInScreenProps {
  navigation: SignInScreenNavigationProp;
}

const SignInScreen: React.FC<SignInScreenProps> = ({ navigation }) => {
  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const signInResult = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      
      if (tokens.idToken) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: tokens.idToken,
        });
        
        if (error) throw error;
      }
    } catch (error) {
      Alert.alert('エラー', 'Googleログインに失敗しました');
      console.error(error);
    }
  };

  const handleAppleLogin = async () => {
    if (Platform.OS === 'android') {
      Alert.alert('注意', 'Apple IDでのログインはiOSのみ対応しています');
      return;
    }

    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      const { identityToken } = appleAuthRequestResponse;

      if (identityToken) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: identityToken,
        });

        if (error) throw error;
      } else {
        throw new Error('No identity token received');
      }
    } catch (error) {
      const appleError = error as { code?: string };
      if (appleError.code === appleAuth.Error.CANCELED) {
        console.log('User canceled Apple Sign in.');
      } else {
        Alert.alert('エラー', 'Appleログインに失敗しました');
        console.error(error);
      }
    }
  };

  const handleEmailLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: 'test@example.com', // TODO: メールアドレス入力UIの実装
        options: {
          emailRedirectTo: 'aimatch://login-callback/',
        },
      });
      
      if (error) throw error;
      Alert.alert('確認', 'メールアドレスに認証リンクを送信しました');
    } catch (error) {
      Alert.alert('エラー', 'メール認証に失敗しました');
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>ログイン</Text>
          <Text style={styles.subtitle}>
            既存のアカウントで{'\n'}ログインしてください
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={handleGoogleLogin}
          >
            <Icon name="logo-google" size={20} color="#000" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Googleアカウントでログイン</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button}
            onPress={handleAppleLogin}
          >
            <Icon name="logo-apple" size={20} color="#000" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Apple IDでログイン</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button}
            onPress={handleEmailLogin}
          >
            <Icon name="mail-outline" size={20} color="#000" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>メールアドレスでログイン</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  backButton: {
    marginBottom: 30,
  },
  titleContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
});

export default SignInScreen;