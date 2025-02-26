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
      console.log('Starting Google Sign-In process...');
      await GoogleSignin.hasPlayServices();
      const signInResult = await GoogleSignin.signIn();
      console.log('Google Sign-In result:', signInResult);
      
      const tokens = await GoogleSignin.getTokens();
      console.log('Google tokens received');
      
      if (tokens.idToken) {
        console.log('Attempting Supabase authentication...');
        const { data: { session }, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: tokens.idToken,
        });
        
        if (error) {
          console.error('Supabase auth error:', {
            message: error.message,
            status: error.status,
            name: error.name,
            stack: error.stack,
          });
          Alert.alert('認証エラー', `エラーの詳細: ${error.message}\nステータス: ${error.status}`);
          return;
        }

        console.log('Supabase authentication successful:', {
          user: session?.user?.id,
          session: session?.access_token ? 'Valid' : 'Invalid',
        });

        // ユーザー情報の保存
        if (session?.user) {
          try {
            // SignInResponse の型に合わせて修正
            const userEmail = session.user.email;
            const userName = '';
            const userPhoto = '';

            if (!userEmail) {
              console.warn('User email not found in both signInResult and session');
              return;
            }

            const { error: upsertError } = await supabase
              .from('users')
              .upsert({
                id: session.user.id,
                email: userEmail,
                account_name: userName,
                avatar_url: userPhoto,
                updated_at: new Date().toISOString(),
              });

            if (upsertError) {
              console.error('Error saving user data:', upsertError);
            } else {
              console.log('User data saved successfully');
            }
          } catch (error) {
            console.error('Error in user data operation:', error);
          }
        }

        // メイン画面への遷移
        navigation.replace('MainTabs');
      }
    } catch (error: any) {
      console.error('Google Sign-In error:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      const errorMessage = error.message || 'Googleログインに失敗しました';
      Alert.alert('エラー', errorMessage);
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

      const { identityToken, fullName, email } = appleAuthRequestResponse;

      if (identityToken) {
        const { data: { session }, error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: identityToken,
        });

        if (error) {
          console.error('Supabase auth error:', error);
          Alert.alert('認証エラー', `エラーの詳細: ${error.message}`);
          return;
        }

        console.log('Sign in successful:', session);

        // ユーザー情報の保存
        if (session?.user) {
          try {
            const { error: upsertError } = await supabase
              .from('users')
              .upsert({
                id: session.user.id,
                email: email,
                full_name: fullName ? `${fullName.givenName} ${fullName.familyName}` : null,
                updated_at: new Date().toISOString(),
              });

            if (upsertError) {
              console.error('Error saving user data:', upsertError);
            } else {
              console.log('User data saved successfully');
            }
          } catch (error) {
            console.error('Error in user data operation:', error);
          }
        }

        // メイン画面への遷移
        navigation.replace('MainTabs');
      } else {
        throw new Error('No identity token received');
      }
    } catch (error: any) {
      const appleError = error as { code?: string };
      if (appleError.code === appleAuth.Error.CANCELED) {
        console.log('User canceled Apple Sign in.');
      } else {
        console.error('Apple Sign-In error:', error);
        const errorMessage = error.message || 'Appleログインに失敗しました';
        Alert.alert('エラー', errorMessage);
      }
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
      </View>
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Icon name="sparkles-outline" size={80} color="#FF4B8C" style={styles.logoIcon} />
        </View>
        
        <View style={styles.titleContainer}>
          <Text style={styles.welcomeText}>AIMatchへようこそ</Text>
          <Text style={styles.subText}>AIを使って理想の相手とマッチング</Text>
        </View>

        <View style={styles.buttonContainer}>
          {/* メールアドレス登録ボタンを非表示に
          <TouchableOpacity
            style={styles.emailButton}
            onPress={() => {
              // EmailSignUpScreenに直接遷移
              navigation.navigate('EmailSignUp');
            }}
          >
            <Icon name="mail-outline" size={24} color="#007AFF" />
            <Text style={styles.emailButtonText}>メールアドレスで登録</Text>
          </TouchableOpacity>
          */}

          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
            <Icon name="logo-google" size={22} color="#000" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Googleでサインイン</Text>
          </TouchableOpacity>

          {Platform.OS === 'ios' && (
            <TouchableOpacity style={styles.appleButton} onPress={handleAppleLogin}>
              <Icon name="logo-apple" size={22} color="#000" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Apple IDでサインイン</Text>
            </TouchableOpacity>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 75, 140, 0.1)',
    marginBottom: 32,
  },
  logoIcon: {
    opacity: 0.9,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  emailButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
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
  termsContainer: {
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 24,
  },
  termsNotice: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    fontSize: 12,
    color: '#FF4B8C',
    textDecorationLine: 'underline',
  },
});

export default SignInScreen;