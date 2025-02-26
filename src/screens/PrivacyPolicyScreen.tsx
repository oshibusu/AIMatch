import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const PrivacyPolicyScreen = () => {
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
        <Text style={styles.headerTitle}>プライバシーポリシー</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.policyContainer}>
          <Text style={styles.policyTitle}>AIMatch プライバシーポリシー</Text>
          <Text style={styles.policyText}>
            本プライバシーポリシー（以下「本ポリシー」）は、AIMatch（以下「本アプリ」）をご利用になる際に、当社がどのように個人情報を収集、利用、開示するかを説明するものです。本アプリを利用することによって、お客様は本ポリシーに記載された方法での個人情報の取り扱いに同意したものとみなされます。
          </Text>

          <Text style={styles.sectionTitle}>1. 収集する情報</Text>
          <Text style={styles.subSectionTitle}>1.1 お客様から直接ご提供いただく情報</Text>
          <Text style={styles.policyText}>
            氏名、メールアドレス、電話番号（オプトインの場合）など：本アプリを利用する過程でお客様が直接入力・送信した情報を収集する場合があります。
          </Text>
          <Text style={styles.subSectionTitle}>1.2 アップロードされたコンテンツ</Text>
          <Text style={styles.policyText}>
            ユーザーはスクリーンショットや写真をアップロードすることができます。そのため、本アプリではカメラおよび写真ライブラリへのアクセス許可を求める場合があります。
          </Text>
          <Text style={styles.subSectionTitle}>1.3 利用状況に関する情報</Text>
          <Text style={styles.policyText}>
            本アプリの各機能の利用状況、閲覧ページ、行った操作など、お客様の利用行動に関する情報を収集することがあります。
          </Text>
          <Text style={styles.subSectionTitle}>1.4 デバイスおよびログ情報</Text>
          <Text style={styles.policyText}>
            IPアドレス、ブラウザの種類、オペレーティングシステムなど、本アプリの利用に関連して自動的に生成・保存される情報を収集する場合があります。
          </Text>

          <Text style={styles.sectionTitle}>2. 情報の利用目的</Text>
          <Text style={styles.policyText}>
            当社は、収集した情報を以下を含むさまざまな目的のために使用する場合があります。
          </Text>
          <Text style={styles.policyText}>
            {'\u2022'} 本アプリの提供・維持{'\n'}
            {'\u2022'} お客様の利用体験のパーソナライズと改善{'\n'}
            {'\u2022'} お問い合わせ対応やカスタマーサポートを含む、お客様とのコミュニケーション{'\n'}
            {'\u2022'} 利用傾向や嗜好の分析{'\n'}
            {'\u2022'} 本アプリのセキュリティおよび完全性の保護{'\n'}
            {'\u2022'} 当社規約やポリシーの執行{'\n'}
            {'\u2022'} 法的義務の遵守{'\n'}
            {'\u2022'} 調査および分析目的{'\n'}
            {'\u2022'} クラッシュレポート、テスト、マーケティング、顧客サポート、分析：アプリのパフォーマンスを測定し、ユーザー体験を改善し、運用の安定性を確保するため
          </Text>

          <Text style={styles.sectionTitle}>3. 機密データ（Sensitive Data）</Text>
          <Text style={styles.policyText}>
            本アプリは以下の機密データへのアクセスを求める場合があります。
          </Text>
          <Text style={styles.policyText}>
            カメラ・写真へのアクセス：スクリーンショットや写真をアップロードする機能を提供するために、お使いのデバイスのカメラおよび写真ライブラリへのアクセス許可を求めます。これらのデータは、本アプリ内の該当機能を提供する目的でのみ使用されます。
          </Text>

          <Text style={styles.sectionTitle}>4. 情報の共有</Text>
          <Text style={styles.policyText}>
            当社は、以下の場合に限り、お客様の個人情報を第三者と共有する場合があります。
          </Text>
          <Text style={styles.subSectionTitle}>サービス提供者（サードパーティ）</Text>
          <Text style={styles.policyText}>
            ホスティング、データ分析、カスタマーサポートなど、当社に代わってサービスを提供する第三者に対し、必要な範囲で情報を共有する場合があります。
          </Text>
          <Text style={styles.subSectionTitle}>法的要請</Text>
          <Text style={styles.policyText}>
            法令に基づく要請や裁判所命令、行政機関の調査などがあった場合、当社はそれに応じて情報を開示することがあります。
          </Text>
          <Text style={styles.subSectionTitle}>事業譲渡</Text>
          <Text style={styles.policyText}>
            合併や買収、資産の全部または一部の売却などの事業取引が行われる場合、買収する当事者に対してお客様の情報が移転される可能性があります。
          </Text>
          <Text style={styles.subSectionTitle}>同意</Text>
          <Text style={styles.policyText}>
            お客様が同意を与えた場合、第三者に情報を共有することがあります。
          </Text>

          <Text style={styles.sectionTitle}>5. クッキーおよびトラッキング技術</Text>
          <Text style={styles.policyText}>
            当社は、本アプリ内でクッキーや類似のトラッキング技術を使用し、パフォーマンスを向上させ、お客様の利用体験を最適化しています。
          </Text>
          <Text style={styles.subSectionTitle}>パフォーマンス測定</Text>
          <Text style={styles.policyText}>
            当社は、クッキーやタグを用いて本アプリの各種機能やボタンがどの程度頻繁に利用されているかを測定し、そのデータをもとにアプリの機能を改善しています。
          </Text>
          <Text style={styles.subSectionTitle}>匿名データの収集</Text>
          <Text style={styles.policyText}>
            これらのタグによって収集される情報は、特定の個人と紐づけられるものではなく、あくまで全体的な利用動向を把握するために使用します。
          </Text>
          <Text style={styles.policyText}>
            お使いのブラウザ設定でクッキーを無効にすることも可能ですが、その場合、本アプリの一部機能が制限される場合があります。
          </Text>

          <Text style={styles.sectionTitle}>6. データの保存および削除ポリシー</Text>
          <Text style={styles.policyText}>
            当社は、サービスの提供に必要な期間、お客様の個人情報を保存します。
          </Text>
          <Text style={styles.subSectionTitle}>保存期間</Text>
          <Text style={styles.policyText}>
            お客様の個人情報（アップロードされたコンテンツや連絡先情報など）は、削除のご要望がない限り、原則として無期限に保管される場合があります。
          </Text>
          <Text style={styles.subSectionTitle}>削除リクエスト</Text>
          <Text style={styles.policyText}>
            お客様がご自身の個人データの削除を希望する場合、本アプリ内の機能で削除をリクエストできます。
          </Text>

          <Text style={styles.sectionTitle}>7. セキュリティ</Text>
          <Text style={styles.policyText}>
            当社は、お客様の個人情報を保護するため、通信時および保存時に暗号化などの合理的な対策を講じています。ただし、インターネット上の送信や電子保存の方法は完全に安全とは言えないため、当社は絶対的な安全性を保証するものではありません。
          </Text>

          <Text style={styles.sectionTitle}>8. 第三者リンクおよびサービス</Text>
          <Text style={styles.policyText}>
            本アプリには、第三者のウェブサイトやサービスへのリンクが含まれる場合があります。本ポリシーはこれら第三者のウェブサイトやサービスには適用されません。お客様が第三者のウェブサイトやサービスを利用する場合は、それぞれのプライバシーポリシーをご確認ください。
          </Text>

          <Text style={styles.sectionTitle}>9. 本プライバシーポリシーの変更</Text>
          <Text style={styles.policyText}>
            当社は、本ポリシーを随時更新することがあります。ページ下部に記載された「最終更新日」を確認し、定期的に本ポリシーをレビューすることを推奨いたします。本ポリシーを改訂した後も本アプリをご利用になる場合は、改訂後のポリシーに同意したものとみなされます。
          </Text>

          <Text style={styles.sectionTitle}>10. お問い合わせ</Text>
          <Text style={styles.policyText}>
            本ポリシーに関するご質問やご不明点などがございましたら、下記までお問い合わせください。
          </Text>
          <Text style={styles.policyText}>
            メールアドレス: yutoshibuya@aimatch-mgs.com
          </Text>
          <Text style={styles.policyText}>
            本アプリをご利用になることで、お客様は本ポリシーを読み理解したうえで、ここに記載された方法での個人情報の収集、利用、開示に同意したものとみなされます。
          </Text>

          <Text style={styles.lastUpdate}>最終更新日: 2025/02/25</Text>
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
  policyContainer: {
    padding: 16,
  },
  policyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1A1A1A',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
    color: '#1A1A1A',
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
    color: '#333',
  },
  policyText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    marginBottom: 12,
  },
  lastUpdate: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
    marginTop: 24,
    textAlign: 'right',
  },
});

export default PrivacyPolicyScreen;