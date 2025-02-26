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

const HowToUseScreen = () => {
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
        <Text style={styles.headerTitle}>使い方ガイド</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.guideContainer}>
          <Text style={styles.guideTitle}>AIMatchの使い方</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. プロフィール設定</Text>
            <Text style={styles.guideText}>
              アプリを初めて使用する際は、プロフィール情報を設定しましょう。プロフィール写真をアップロードし、基本情報を入力することで、より良いマッチング体験が得られます。
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. 写真のアップロード</Text>
            <Text style={styles.guideText}>
              ホーム画面の「+」ボタンをタップして、写真をアップロードできます。スクリーンショットや写真を選択し、AIがあなたに最適なメッセージを生成します。
            </Text>
            <View style={styles.stepImageContainer}>
              <Icon name="add-circle" size={50} color="#FF4B8C" />
              <Icon name="arrow-forward" size={30} color="#666" style={styles.arrowIcon} />
              <Icon name="image" size={50} color="#FF4B8C" />
              <Icon name="arrow-forward" size={30} color="#666" style={styles.arrowIcon} />
              <Icon name="chatbubble-ellipses" size={50} color="#FF4B8C" />
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. メッセージの調整</Text>
            <Text style={styles.guideText}>
              生成されたメッセージは、フォーマル度、フレンドリー度、ユーモア度などを調整することができます。スライダーを動かして、あなたの好みに合わせてメッセージのトーンを変更しましょう。
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. メッセージのコピーと使用</Text>
            <Text style={styles.guideText}>
              気に入ったメッセージが見つかったら、コピーボタンをタップしてクリップボードにコピーできます。その後、お好みのメッセージングアプリに貼り付けて送信しましょう。
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. 言語設定</Text>
            <Text style={styles.guideText}>
              設定画面から「Generated Languages」オプションを選択して、メッセージ生成に使用する言語を変更できます。複数の言語に対応しているため、あなたのニーズに合わせて選択してください。
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. チャット履歴</Text>
            <Text style={styles.guideText}>
              ホーム画面では、過去の会話履歴を確認できます。会話をタップすると、詳細を表示したり、新しいメッセージを生成したりすることができます。
            </Text>
          </View>
          
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>便利なヒント</Text>
            <View style={styles.tipItem}>
              <Icon name="bulb-outline" size={24} color="#FF4B8C" style={styles.tipIcon} />
              <Text style={styles.tipText}>
                より良い結果を得るために、鮮明な写真をアップロードしましょう。
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="bulb-outline" size={24} color="#FF4B8C" style={styles.tipIcon} />
              <Text style={styles.tipText}>
                メッセージを編集して、あなた自身の言葉を追加することもできます。
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="bulb-outline" size={24} color="#FF4B8C" style={styles.tipIcon} />
              <Text style={styles.tipText}>
                定期的にアプリをアップデートして、最新の機能を利用しましょう。
              </Text>
            </View>
          </View>
          
          <Text style={styles.supportText}>
            さらに詳しい情報やサポートが必要な場合は、yutoshibuya@aimatch-mgs.com までお問い合わせください。
          </Text>
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
  guideContainer: {
    padding: 16,
  },
  guideTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  guideText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  stepImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  arrowIcon: {
    marginHorizontal: 8,
  },
  tipsSection: {
    marginBottom: 24,
    backgroundColor: '#FFF8FA',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF4B8C',
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  tipIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
  },
  supportText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 32,
    fontStyle: 'italic',
  },
});

export default HowToUseScreen;