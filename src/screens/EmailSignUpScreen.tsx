import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { BackHandler } from 'react-native';
import { supabase } from '../lib/supabase';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type EmailSignUpScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'EmailSignUp'>;
};

const EmailSignUpScreen = ({ navigation }: EmailSignUpScreenProps) => {
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !accountName) {
      Alert.alert('エラー', '全ての項目を入力してください');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('エラー', '有効なメールアドレスを入力してください');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('エラー', 'パスワードが一致しません');
      return;
    }

    if (password.length < 6) {
      Alert.alert('エラー', 'パスワードは6文字以上で入力してください');
      return;
    }

    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            account_name: accountName,
          },
        },
      });

      if (error) {
        Alert.alert('エラー', error.message);
        return;
      }

      if (data.user) {
        try {
          const { error: upsertError } = await supabase
            .from('users')
            .upsert({
              id: data.user.id,
              email: email,
              account_name: accountName,
              updated_at: new Date().toISOString(),
            });

          if (upsertError) {
            console.error('Error saving user data:', upsertError);
          }
        } catch (error) {
          console.error('Error in user data operation:', error);
        }
      }

      Alert.alert(
        '確認メールを送信しました',
        'メールに記載されたリンクをクリックして、登録を完了してください',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('エラー', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back-outline" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>メールアドレスで登録</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Icon name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="アカウント名"
              value={accountName}
              onChangeText={setAccountName}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="メールアドレス"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="パスワード"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="パスワード（確認）"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              アカウントを作成すると、以下の利用規約に同意したことになります
            </Text>
            <TouchableOpacity
              style={styles.termsButton}
              onPress={() => setTermsModalVisible(true)}
            >
              <Icon name="document-text-outline" size={16} color="#007AFF" style={styles.termsIcon} />
              <Text style={styles.termsButtonText}>利用規約を表示</Text>
            </TouchableOpacity>
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

          <TouchableOpacity
            style={[styles.signUpButton, isLoading && styles.signUpButtonDisabled]}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signUpButtonText}>登録</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoid: {
    flex: 1,
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 16,
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minHeight: 48,
  },
  inputIcon: {
    marginRight: 12,
    width: 20,
    height: 20,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#000',
  },
  signUpButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    minHeight: 50,
  },
  signUpButtonDisabled: {
    backgroundColor: '#ccc',
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  termsContainer: {
    marginTop: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  termsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
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
});

export default EmailSignUpScreen;
