import React, { useEffect } from 'react';
import { GoogleSignin, type User, type NativeModuleError,statusCodes } from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { Platform } from 'react-native';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { supabase } from '../lib/supabase';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const SparkleIcon = () => (
  <View style={styles.sparkleContainer}>
    <Icon name="sparkles-outline" size={120} color="#000" style={styles.sparkle} />
  </View>
);

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const checkPreviousSignIn = async () => {
    try {
      const currentUser = await GoogleSignin.getCurrentUser();
      if (currentUser) {
        // 以前のログイン情報が残っていたら復元する
        await GoogleSignin.signInSilently();
        console.log('Restored previous sign-in:', currentUser.user.email);
        
        const tokens = await GoogleSignin.getTokens();
        if (tokens.idToken) {
          const { error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: tokens.idToken,
          });
          
          if (error) throw error;
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Previous sign-in check failed:', error.message);
      } else {
        console.error('Previous sign-in check failed:', error);
      }
    }
  };

  useEffect(() => {
    // GoogleSigninの初期化
    GoogleSignin.configure({
      webClientId: '330759708062-s247dk4b4j0ej0kr2e85d4vh2ipd12uh.apps.googleusercontent.com',
      offlineAccess: true,
      iosClientId: '330759708062-s247dk4b4j0ej0kr2e85d4vh2ipd12uh.apps.googleusercontent.com',
    });

    // 以前のログイン情報をチェック
    checkPreviousSignIn();

    // セッションの監視
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigation.replace('MainTabs');
      }
    });
  }, [navigation]);

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();
      console.log('Google Sign-in success');
      
      const tokens = await GoogleSignin.getTokens();
      if (tokens.idToken) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: tokens.idToken,
        });
        
        if (error) throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        // ユーザーがキャンセルした場合は静かに処理
        if (error.message.includes('cancelled') || error.message.includes('canceled')) {
          console.log('User cancelled Google Sign-in');
          return;
        }
        Alert.alert('エラー', `Googleログインに失敗しました: ${error.message}`);
      } else {
        Alert.alert('エラー', 'Googleログインに失敗しました');
      }
      console.error('Google Sign-in error:', error);
    }
  };

  const handleAppleLogin = async () => {
    // Androidの場合は非対応のメッセージを表示
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

  const handleExistingAccount = () => {
    navigation.navigate('SignIn');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <SparkleIcon />
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>アカウントを作成</Text>
          <Text style={styles.subtitle}>
            新しいアカウントを作成して{'\n'}AIMatchを始めましょう
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={handleGoogleLogin}
          >
            <Icon name="logo-google" size={20} color="#000" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Googleアカウントで登録</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button}
            onPress={handleAppleLogin}
          >
            <Icon name="logo-apple" size={20} color="#000" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Apple IDで登録 </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('EmailSignUp')}
          >
            <Icon name="mail-outline" size={20} color="#000" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>メールアドレスで登録</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={handleExistingAccount}>
            <Text style={styles.loginLink}>Log in</Text>
          </Pressable>
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
    paddingTop: 40,
  },
  sparkleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  sparkle: {
    opacity: 0.8,
  },
  titleContainer: {
    alignItems: 'center',
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
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 40,
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
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;