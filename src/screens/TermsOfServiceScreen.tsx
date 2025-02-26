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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type TermsOfServiceScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TermsOfService'>;
import Icon from 'react-native-vector-icons/Ionicons';

const TermsOfServiceScreen = () => {
  const navigation = useNavigation<TermsOfServiceScreenNavigationProp>();
  
  // Prevent eventemitter error by ensuring navigation is properly cleaned up
  React.useEffect(() => {
    return () => {
      // Cleanup function to prevent memory leaks
    };
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>利用規約</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.termsContainer}>
          <Text style={styles.termsTitle}>AIMatch 利用規約</Text>
          <Text style={styles.lastUpdate}>最終更新日：2025/02/25</Text>

          <Text style={styles.sectionTitle}>1. 本規約への同意</Text>
          <Text style={styles.termsText}>
            本利用規約（以下「本規約」）は、AIMatch(以下「本アプリ」)の利用条件を定めるものです。本アプリを利用することで、お客様は本規約に拘束されることに同意したものとみなされます。
          </Text>
          <Text style={styles.termsText}>
            当社は必要に応じて、本規約に補足条項や追加条件（以下「追加条件」）を定めることがあります。追加条件は本規約に組み込まれ、本規約の一部を構成します。当社は独自の裁量により、本規約を随時変更または修正する権利を留保します。変更内容は「最終更新日」を更新することで通知されます。定期的に本規約をご確認いただき、改訂内容を把握いただくようお願いいたします。お客様が改訂後も本アプリを利用する場合、改訂後の規約に同意したものとみなされます。
          </Text>
          <Text style={styles.termsText}>
            本アプリは、原則として18歳以上のユーザーを対象としています。18歳未満の方は、本アプリを利用または登録することはできません。
          </Text>

          <Text style={styles.sectionTitle}>2. 利用規約の受諾</Text>
          <Text style={styles.termsText}>
            本アプリを利用することにより、お客様は本規約およびすべての適用法令や規制に従うことに同意し、法的に拘束されることを承諾したものとみなされます。本規約に同意いただけない場合は、本アプリの利用を中止してください。本規約は、本アプリのすべてのユーザーに適用されます。
          </Text>

          <Text style={styles.sectionTitle}>3. 本アプリの利用</Text>
          <Text style={styles.termsText}>
            本アプリは、個人的かつ非商業的な利用のみを目的としています。お客様は本アプリを利用するにあたり、18歳以上であることを表明し、保証します。また、アカウントの機密情報を管理し、アカウント上で発生する一切の行為について責任を負うものとします。アカウントの不正使用やセキュリティ侵害を発見した場合には、ただちに当社へ通知してください。当社は、お客様が本条項に違反したことにより生じた損失や損害について、一切の責任を負いません。
          </Text>

          <Text style={styles.sectionTitle}>4. 知的財産権</Text>
          <Text style={styles.termsText}>
            本アプリおよびそこに含まれるすべてのコンテンツや素材（テキスト、グラフィックス、画像、動画、ソフトウェア、ロゴなど）は、当社または当社にライセンスを供与する第三者の所有物であり、著作権、商標権その他の知的財産権によって保護されています。本規約によって、本アプリやそのコンテンツ・素材に対する所有権は一切譲渡されません。お客様には、本規約に基づき、個人的かつ非商業的目的で本アプリを利用する限定的、非独占的、譲渡不可、取り消し可能なライセンスが付与されるにとどまります。当社の明示的な許可なく、これらのコンテンツや素材を改変、複製、配布、送信、表示、実行、出版、ライセンス供与、派生物の作成、譲渡、販売することはできません。
          </Text>

          <Text style={styles.sectionTitle}>5. 禁止行為</Text>
          <Text style={styles.termsText}>
            お客様は、以下の行為を行わないことに同意します。
          </Text>
          <Text style={styles.termsText}>
            {'\u2022'} 違法行為、または適用される法令・規制に違反する目的で本アプリを利用すること{'\n'}
            {'\u2022'} 有害、脅迫的、虐待的、嫌がらせ的、中傷的、わいせつ、卑猥、プライバシー侵害、または人種・民族・性別・宗教などに基づく差別的表現を含むコンテンツを投稿・配信・送信すること{'\n'}
            {'\u2022'} 他人または他組織へのなりすまし、あるいは関係を偽って主張すること{'\n'}
            {'\u2022'} ストーキングや嫌がらせを行うこと{'\n'}
            {'\u2022'} ウイルス、マルウェア、その他の有害なコードをアップロード、送信、配布すること{'\n'}
            {'\u2022'} 本アプリやそれに接続されているサーバーやネットワークの運営を妨害または混乱させる行為、またはその試み{'\n'}
            {'\u2022'} 本アプリまたは関連システムやネットワークへの無断アクセスを試みること{'\n'}
            {'\u2022'} 他のユーザーの個人データを、本人の明示的な同意なく収集または保存すること{'\n'}
            {'\u2022'} セキュリティ機能（デジタル著作権管理や暗号化など）を回避または無効化すること{'\n'}
            {'\u2022'} 本アプリの一部をリバースエンジニアリング、翻案、翻訳する行為{'\n'}
            {'\u2022'} ボット、スパイダー、クローラーなどの自動化システムやソフトウェアを使用してアクセスまたは操作すること{'\n'}
            {'\u2022'} 無許可または不正な広告、勧誘、スパム、チェーンメール、マスメールなどを行うこと{'\n'}
            {'\u2022'} 第三者の知的財産権や所有権を侵害する行為{'\n'}
            {'\u2022'} 他人のプライバシー権、パブリシティ権を侵害する行為{'\n'}
            {'\u2022'} 未成年者の保護に関する法令や規制を含む、あらゆる適用法令に違反する行為{'\n'}
            {'\u2022'} 暴力や差別を助長する、または人種、国籍、性別、性的指向、年齢などに基づいて他者を差別する表現を広める行為{'\n'}
            {'\u2022'} 本規約や適用法令に違反するその他の方法で本アプリを利用する行為
          </Text>

          <Text style={styles.sectionTitle}>6. コミュニケーション</Text>
          <Text style={styles.termsText}>
            本アプリのサービスの一環として、メールなどを通じて当社からお客様へメッセージが送信される場合があります。SMSでの受信を希望する場合、お客様は最初に送られるウェルカムメッセージおよび配信停止手順を確認するものとします。たとえば、SMSの受信を停止する場合は「STOP」と返信してください。お客様から「STOP」メッセージを受信した後、当社は確認メッセージを送信し、その後は該当メッセージを送信しなくなります。再開を希望する場合は、初回登録時と同様に改めて手続きを行ってください。問題が発生した場合は「HELP」と返信するか、直接 yutoshibuya@aimatch-mgs.com までお問い合わせください。
          </Text>
          <Text style={styles.termsText}>
            また、当社からのプロモーションメールの受信を停止する場合は、メールに記載された配信停止手順に従うか、yutoshibuya@aimatch-mgs.com へご連絡ください。なお、受信を停止しても、アカウント情報や重要な法的通知などに関するトランザクション系または管理系のメールは引き続き送信される場合があります。
          </Text>
          <Text style={styles.termsText}>
            本アプリへの登録時にメールアドレスをご提供いただくことで、お客様は、情報提供やマーケティングの目的でメッセージを送信することに明示的に同意したものとみなされます。通信事業者は、メッセージの遅延や未達について責任を負いません。お客様は、メッセージを受信することに同意し、登録されたすべてのメールアドレスについて、その所有者がAIMatchからのメッセージ受信を許可していることを保証します。
          </Text>
          <Text style={styles.termsText}>
            お客様は、これらの義務に違反した場合に発生した一切の損害、請求、費用（弁護士費用を含む）について、AIMatchを免責し、損害を与えないことに同意します。
          </Text>

          <Text style={styles.sectionTitle}>7. 保証の否認</Text>
          <Text style={styles.termsText}>
            本アプリは「現状有姿」および「提供可能な限り」の状態で提供され、お客様は自己責任で利用するものとします。適用法令により最大限認められる範囲で、当社は以下を含むすべての明示・黙示の保証（商品性、特定目的適合性、非侵害性など）を否認します。当社は、以下に関して一切の責任を負いません。
          </Text>
          <Text style={styles.termsText}>
            {'\u2022'} 本アプリのコンテンツの正確性、完全性、または最新性{'\n'}
            {'\u2022'} 本アプリへのアクセスや利用中に発生する、いかなる人身傷害や物的損害{'\n'}
            {'\u2022'} 当社の安全なサーバーへの不正アクセスや情報漏洩{'\n'}
            {'\u2022'} 本アプリの利用または通信に関連する中断、中止、障害{'\n'}
            {'\u2022'} 第三者によるウイルス、マルウェア、その他有害なコードの送信{'\n'}
            {'\u2022'} 本アプリ上のコンテンツの誤りや欠落、またはコンテンツの利用によって生じたあらゆる損失や損害
          </Text>
          <Text style={styles.termsText}>
            当社は本アプリ上で第三者が広告または提供する商品やサービスについて、その内容や品質を保証したり、責任を負うものではありません。
          </Text>

          <Text style={styles.sectionTitle}>8. 責任の制限</Text>
          <Text style={styles.termsText}>
            適用法令で認められる最大限の範囲において、当社（関連会社、役員、従業員、代理人、ライセンサーを含む）は、本アプリの利用、または利用できないことに起因するいかなる損害（直接的、間接的、付随的、特別、結果的、例示的損害など）についても、一切の責任を負いません。さらに、当社はお客様または第三者が本アプリ上で投稿または提供するコンテンツについて、誤字脱字や遺漏を含むあらゆる損害や損失についても責任を負いません。本項の責任制限は、お客様の居住地域の法律により最大限認められる範囲で適用されます。
          </Text>

          <Text style={styles.sectionTitle}>9. 免責</Text>
          <Text style={styles.termsText}>
            お客様は、本アプリの利用、本規約の違反、第三者の権利侵害に起因または関連して第三者から提起されたあらゆる請求、負債、損害、費用（合理的な弁護士費用を含む）について、当社および当社の関連会社、役員、従業員、代理人、ライセンサーを免責し、かつ損害を与えないことに同意します。
          </Text>

          <Text style={styles.sectionTitle}>10. 第三者コンテンツ</Text>
          <Text style={styles.termsText}>
            本アプリには、第三者によるコンテンツや広告が含まれる場合があります。当社はこれら第三者コンテンツの内容、プライバシーポリシー、運営について一切関与せず、責任を負わないものとします。お客様が第三者の商品やサービスを利用することで生じる損失や損害について、当社は一切責任を負いません。
          </Text>

          <Text style={styles.sectionTitle}>11. 本規約の変更</Text>
          <Text style={styles.termsText}>
            当社は本規約を随時変更する権利を有し、変更後の利用規約は本アプリ上で公開した時点で効力を生じます。お客様が変更後も本アプリを利用し続ける場合、変更後の規約に同意したものとみなされます。定期的に本規約をご確認いただき、変更内容を把握いただくようお願いいたします。
          </Text>

          <Text style={styles.sectionTitle}>12. データ収集およびプライバシー</Text>
          <Text style={styles.termsText}>
            当社は、お客様のデバイス、システム、アプリケーションソフトウェア、周辺機器に関する技術データや関連情報を収集する場合があります。これらの情報は、本アプリや製品・サービスの改善、ソフトウェア更新およびサポートの提供に利用されます。詳細については、プライバシーポリシー をご参照ください。
          </Text>

          <Text style={styles.sectionTitle}>13. モバイルアプリケーションライセンス</Text>
          <Text style={styles.termsText}>
            お客様がApple StoreまたはGoogle Play（以下「アプリ配信元」）からダウンロードした本アプリを利用する場合、以下の条項が適用されます。
          </Text>
          <Text style={styles.termsText}>
            {'\u2022'} お客様に付与されるライセンスは、適用されるアプリ配信元の利用規約に基づき、Apple iOSまたはAndroidのオペレーティングシステムを使用するデバイス上でのみ、本アプリを非独占的に使用できる限定的かつ譲渡不能なライセンスに限られます。{'\n'}
            {'\u2022'} 本アプリのメンテナンスやサポートに関する責任は当社が負い、アプリ配信元はそれらに関して一切の義務を負いません。{'\n'}
            {'\u2022'} 本アプリが何らかの保証に適合しない場合、お客様はアプリ配信元に通知することができ、アプリ配信元の規約や方針に基づき、お客様が支払った購入代金（該当する場合）は返金される可能性があります。ただし、適用法令により最大限認められる範囲で、アプリ配信元はその他の保証義務を負いません。{'\n'}
            {'\u2022'} お客様は、(i)米国政府の禁輸措置の対象国に居住していないこと、または「テロ支援」国として指定されていないこと、(ii)米国政府の禁止または制限対象者のリストに掲載されていないことを表明し、保証します。{'\n'}
            {'\u2022'} お客様は、VoIPアプリなどの第三者サービスを使用する場合に、当該サービスのデータ利用規約や無線通信事業者の規約に違反しない範囲で本アプリを使用するものとします。{'\n'}
            {'\u2022'} お客様は、アプリ配信元が本規約に基づく本アプリのライセンス条項の第三者受益者となることを確認し、アプリ配信元はお客様に対して本規約のライセンス条項を執行する権利を有することに同意します。
          </Text>

          <Text style={styles.sectionTitle}>14. キャンセル</Text>
          <Text style={styles.termsText}>
            すべての購入は返金不可となります。Appleデバイスの場合はiCloudのサブスクリプション設定から、Googleデバイスの場合はGoogleアカウントのサブスクリプション設定から更新停止を行ってください。更新日の少なくとも24時間前までに手続きを完了していただく必要があります。キャンセルは現在の支払期限が終了する時点で適用されます。
          </Text>

          <Text style={styles.sectionTitle}>15. ユーザー生成コンテンツ</Text>
          <Text style={styles.termsText}>
            本アプリでは、チャット、ブログ、メッセージボード、オンラインフォーラムへの投稿など、お客様によるコンテンツ（以下「投稿内容」）の作成・送信・表示・配信・公開が可能です。投稿内容は第三者や他のユーザーに閲覧される場合があり、第三者のプラットフォームにも表示される場合があります。よって、投稿された内容は機密扱いとならず、非独占的情報として扱われる場合があります。投稿内容を作成または公開するにあたり、お客様は以下を表明し、保証します。
          </Text>
          <Text style={styles.termsText}>
            {'\u2022'} 投稿内容の作成、配布、送信、公的表示や実行、ダウンロード、複製が、いかなる第三者の所有権（著作権、特許、商標、営業秘密、著作者人格権など）も侵害しないこと{'\n'}
            {'\u2022'} 投稿内容を当社や本アプリ上、または他ユーザーが利用することについて必要な権利、ライセンス、同意、許諾を得ていること{'\n'}
            {'\u2022'} 投稿内容内で識別可能な個人の肖像権やパブリシティ権、プライバシー権を侵害していないこと{'\n'}
            {'\u2022'} 投稿内容が虚偽、誤解を招くものではないこと{'\n'}
            {'\u2022'} 投稿内容が不正広告、宣伝、ピラミッドスキーム、チェーンレター、スパム、マスメールなどではないこと{'\n'}
            {'\u2022'} 投稿内容がわいせつ、乱暴、脅迫的、中傷的、誹謗的またはその他不適切な表現を含むものではないこと（当社の裁量による）{'\n'}
            {'\u2022'} 投稿内容が特定の人や集団に対する脅迫・嫌がらせ・差別を目的としていないこと{'\n'}
            {'\u2022'} 投稿内容がいかなる適用法令・規制にも違反しないこと
          </Text>
          <Text style={styles.termsText}>
            これらに違反した場合、当社はお客様の本アプリ利用権を停止または終了させることがあります。
          </Text>

          <Text style={styles.sectionTitle}>16. 投稿内容のライセンス</Text>
          <Text style={styles.termsText}>
            お客様は、ご自身の投稿内容を本アプリのいかなる部分に掲載した場合でも、その投稿内容に関する以下の権利を、世界的、恒久的、取消不能、非独占的、譲渡可能、ロイヤルティフリー、完全支払い済みのライセンスとして当社に付与し、かつ当社がサブライセンスを許諾する権利を得ることに同意します。
          </Text>
          <Text style={styles.termsText}>
            投稿内容のホスティング、使用、複製、開示、販売、再販売、出版、放送、改題、保存、キャッシュ、公開実行、公開表示、転載、翻訳、抜粋（全文または一部）配布、および派生物の作成など、あらゆる商業的・広告的またはその他の目的で利用する権利
          </Text>
          <Text style={styles.termsText}>
            また、本規約に基づき、お客様は投稿内容に関連する著作者人格権（または同等の権利）を放棄するものとし、当該権利が主張されていないことを保証します。ただし、当社はお客様の投稿内容を所有するものではなく、お客様は投稿内容の著作権やその他の所有権を保持します。
          </Text>

          <Text style={styles.sectionTitle}>17. 契約の終了</Text>
          <Text style={styles.termsText}>
            本規約はお客様または当社のいずれかが終了させるまで有効です。お客様が本規約のいずれかの条項に違反した場合、当社は直ちにお客様の利用権を終了させることができます。終了後は、本アプリの利用をすみやかに中止してください。
          </Text>

          <Text style={styles.sectionTitle}>18. 完全合意</Text>
          <Text style={styles.termsText}>
            本規約およびプライバシーポリシーは、本アプリの利用に関するお客様と当社との間の完全かつ排他的な合意を構成し、従前または同時期に成立した口頭または書面による合意や了解に優先します。
          </Text>

          <Text style={styles.sectionTitle}>19. お問い合わせ先</Text>
          <Text style={styles.termsText}>
            本規約または本アプリに関するご質問やご意見がある場合は、以下までご連絡ください。
          </Text>
          <Text style={styles.termsText}>
            メールアドレス: yutoshibuya@aimatch-mgs.com
          </Text>

          <Text style={styles.sectionTitle}>20. サービス管理</Text>
          <Text style={styles.termsText}>
            当社は以下の権利を有しますが、義務は負いません。
          </Text>
          <Text style={styles.termsText}>
            {'\u2022'} 本アプリを監視し、本規約違反を確認すること{'\n'}
            {'\u2022'} 当社の判断により、本規約に違反すると判断したユーザーに対し法的措置を講じること（必要に応じて法執行機関への通報を含む）{'\n'}
            {'\u2022'} 理由の如何を問わず、本規約に違反した場合や違反の疑いがある場合などに、お客様の利用権を停止または終了させること{'\n'}
            {'\u2022'} 本アプリ上のコンテンツや素材が法的または当社のポリシー上不適切であると判断した場合、削除や編集、または利用不能にすること{'\n'}
            {'\u2022'} 通知や予告なく、本アプリの全部または一部を一時的または永久的に変更・中止すること
          </Text>
          <Text style={styles.termsText}>
            当社は、これらの措置によりお客様または第三者に生じる損害について一切責任を負いません。
          </Text>

          <Text style={styles.termsText}>
            本規約は、2025/02/25以降、お客様が本アプリを利用することによって発効します。お客様が本規約に同意されない場合は、本アプリのご利用を中止してください。
          </Text>
          <Text style={styles.termsText}>
            以上が、本アプリにのみ適用される利用規約です。
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
  termsContainer: {
    padding: 16,
  },
  termsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
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
  termsText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    marginBottom: 12,
  },
  lastUpdate: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 16,
  },
});

export default TermsOfServiceScreen;