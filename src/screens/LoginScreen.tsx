import React, { useEffect, useState } from 'react';
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
  Modal,
  ScrollView,
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
  const [termsModalVisible, setTermsModalVisible] = useState(false);
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
      console.log('Starting Apple Sign-In process...');
      
      // Apple認証リクエストを実行
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      // レスポンスからトークンと情報を取得
      const { identityToken, fullName, email } = appleAuthRequestResponse;
      console.log('Apple Sign-In response received', {
        hasToken: !!identityToken,
        hasName: !!fullName,
        hasEmail: !!email
      });

      if (identityToken) {
        console.log('Attempting Supabase authentication with Apple ID token...');
        const { data: { session }, error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: identityToken,
        });

        if (error) {
          console.error('Supabase auth error:', error);
          throw error;
        }
        
        console.log('Apple Sign-In successful with Supabase');
        
        // ユーザー情報の保存
        if (session?.user && (fullName || email)) {
          try {
            const { error: upsertError } = await supabase
              .from('users')
              .upsert({
                id: session.user.id,
                email: email || session.user.email,
                full_name: fullName ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim() : null,
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
      } else {
        throw new Error('No identity token received');
      }
    } catch (error) {
      const appleError = error as { code?: string };
      if (appleError.code === appleAuth.Error.CANCELED) {
        console.log('User canceled Apple Sign in.');
      } else {
        Alert.alert('エラー', 'Appleログインに失敗しました');
        console.error('Apple Sign-In error:', error);
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

          {/* メールアドレス登録ボタンを非表示に
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('EmailSignUp')}
          >
            <Icon name="mail-outline" size={20} color="#000" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>メールアドレスで登録</Text>
          </TouchableOpacity>
          */}
        </View>

        <View style={styles.termsContainer}>
          <Text style={styles.termsNotice}>
            登録をもって
            <Text
              style={styles.termsLink}
              onPress={() => setTermsModalVisible(true)}
            >
              利用規約
            </Text>
            と
            <Text
              style={styles.termsLink}
              onPress={() => setTermsModalVisible(true)}
            >
              プライバシーポリシー
            </Text>
            に同意したものとみなします
          </Text>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>既にアカウントを持っていますか? </Text>
          <Pressable onPress={handleExistingAccount}>
            <Text style={styles.loginLink}>ログイン</Text>
          </Pressable>
        </View>
        
        {/* Terms of Service Modal */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={termsModalVisible}
          onRequestClose={() => setTermsModalVisible(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setTermsModalVisible(false)}
              >
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>利用規約</Text>
            </View>
            <ScrollView style={styles.modalContent}>
              <View style={styles.termsContent}>
                <Text style={styles.termsTitle}>AIMatch 利用規約</Text>
                <Text style={styles.lastUpdate}>最終更新日：2025/02/25</Text>

                <Text style={styles.sectionTitle}>1. 本規約への同意</Text>
                <Text style={styles.termsContentText}>
                  本利用規約（以下「本規約」）は、AIMatch(以下「本アプリ」)の利用条件を定めるものです。本アプリを利用することで、お客様は本規約に拘束されることに同意したものとみなされます。
                </Text>
                <Text style={styles.termsContentText}>
                  当社は必要に応じて、本規約に補足条項や追加条件（以下「追加条件」）を定めることがあります。追加条件は本規約に組み込まれ、本規約の一部を構成します。当社は独自の裁量により、本規約を随時変更または修正する権利を留保します。変更内容は「最終更新日」を更新することで通知されます。定期的に本規約をご確認いただき、改訂内容を把握いただくようお願いいたします。お客様が改訂後も本アプリを利用する場合、改訂後の規約に同意したものとみなされます。
                </Text>
                <Text style={styles.termsContentText}>
                  本アプリは、原則として18歳以上のユーザーを対象としています。18歳未満の方は、本アプリを利用または登録することはできません。
                </Text>

                <Text style={styles.sectionTitle}>2. 利用規約の受諾</Text>
                <Text style={styles.termsContentText}>
                  本アプリを利用することにより、お客様は本規約およびすべての適用法令や規制に従うことに同意し、法的に拘束されることを承諾したものとみなされます。本規約に同意いただけない場合は、本アプリの利用を中止してください。本規約は、本アプリのすべてのユーザーに適用されます。
                </Text>

                <Text style={styles.sectionTitle}>3. 本アプリの利用</Text>
                <Text style={styles.termsContentText}>
                  本アプリは、個人的かつ非商業的な利用のみを目的としています。お客様は本アプリを利用するにあたり、18歳以上であることを表明し、保証します。また、アカウントの機密情報を管理し、アカウント上で発生する一切の行為について責任を負うものとします。アカウントの不正使用やセキュリティ侵害を発見した場合には、ただちに当社へ通知してください。当社は、お客様が本条項に違反したことにより生じた損失や損害について、一切の責任を負いません。
                </Text>

                <Text style={styles.sectionTitle}>4. 知的財産権</Text>
                <Text style={styles.termsContentText}>
                  本アプリおよびそこに含まれるすべてのコンテンツや素材（テキスト、グラフィックス、画像、動画、ソフトウェア、ロゴなど）は、当社または当社にライセンスを供与する第三者の所有物であり、著作権、商標権その他の知的財産権によって保護されています。本規約によって、本アプリやそのコンテンツ・素材に対する所有権は一切譲渡されません。お客様には、本規約に基づき、個人的かつ非商業的目的で本アプリを利用する限定的、非独占的、譲渡不可、取り消し可能なライセンスが付与されるにとどまります。当社の明示的な許可なく、これらのコンテンツや素材を改変、複製、配布、送信、表示、実行、出版、ライセンス供与、派生物の作成、譲渡、販売することはできません。
                </Text>

                <Text style={styles.sectionTitle}>5. 禁止行為</Text>
                <Text style={styles.termsContentText}>
                  お客様は、以下の行為を行わないことに同意します。
                </Text>
                <Text style={styles.termsContentText}>
                  {'\u2022'} 違法行為、または適用される法令・規制に違反する目的で本アプリを利用すること{'\n'}
                  {'\u2022'} 有害、脅迫的、虐待的、嫌がらせ的、中傷的、わいせつ、卑猥、プライバシー侵害、または人種・民族・性別・宗教などに基づく差別的表現を含むコンテンツを投稿・配信・送信すること{'\n'}
                  {'\u2022'} 他人または他組織へのなりすまし、あるいは関係を偽って主張すること{'\n'}
                  {'\u2022'} ストーキングや嫌がらせを行うこと{'\n'}
                  {'\u2022'} ウイルス、マルウェア、その他の有害なコードをアップロード、送信、配布すること
                </Text>

                <Text style={styles.termsContentText}>
                  本規約は、2025/02/25以降、お客様が本アプリを利用することによって発効します。お客様が本規約に同意されない場合は、本アプリのご利用を中止してください。
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
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
  // Terms of Service Modal Styles
  termsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: 20,
  },
  termsIcon: {
    marginRight: 4,
  },
  termsButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 8,
    marginRight: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
  },
  termsContent: {
    padding: 16,
  },
  termsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1A1A1A',
  },
  lastUpdate: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
    color: '#1A1A1A',
  },
  termsContentText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    marginBottom: 12,
  },
  termsContainer: {
    alignItems: 'center',
    marginBottom: 16,
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
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;