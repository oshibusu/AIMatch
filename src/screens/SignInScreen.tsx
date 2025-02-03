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
            const userEmail = signInResult.user.email || session.user.email;
            const userName = signInResult.user.name || '';
            const userPhoto = signInResult.user.photo || '';

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
      <View style={styles.content}>
        <Text style={styles.welcomeText}>AIMatchへようこそ</Text>
        <Text style={styles.subText}>AIを使って理想の相手とマッチング</Text>

        <View style={styles.buttonContainer}>
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

          <TouchableOpacity style={styles.button} onPress={handleGoogleLogin}>
            <Icon name="logo-google" size={24} color="#000" />
            <Text style={styles.buttonText}>Googleでサインイン</Text>
          </TouchableOpacity>

          {Platform.OS === 'ios' && (
            <TouchableOpacity style={styles.button} onPress={handleAppleLogin}>
              <Icon name="logo-apple" size={24} color="#000" />
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  subText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 40,
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
  buttonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
});

export default SignInScreen;