import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'TextToneAdjustment'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type ToneType = 'frank' | 'normal' | 'formal' | 'humorous';
type LengthType = 'long' | 'medium' | 'short';
type PurposeType = 'greeting' | 'chat' | 'date';

const TextToneAdjustmentScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<Props['route']>();

  // PhotoUploadScreenから渡ってきたOCR結果など
  const { partnerId, recognizedText, screenType, partnerName } = route.params || {};

  // 初期は「フランク、短、挨拶」をデフォルトに設定
  const [tone, setTone] = useState<ToneType>('frank');
  const [length, setLength] = useState<LengthType>('short');
  const [purpose, setPurpose] = useState<PurposeType>('greeting');

  const RadioButton = ({ selected }: { selected: boolean }) => (
    <View style={[styles.radio, selected && styles.radioSelected]}>
      {selected && <View style={styles.radioInner} />}
    </View>
  );

  // AIオススメボタン押下時に自動でパラメータを設定する
  const handleAIRecommend = () => {
    if (screenType === 'profile') {
      setTone('frank');
      setLength('short');
      setPurpose('greeting');
    } else if (screenType === 'dm') {
      setTone('frank');
      setLength('short');
      setPurpose('chat');
    }
  };

  const handleGenerateMessage = () => {
    // ユーザーが選んだ「分量」に応じて数値化したtextLengthを決定
    let textLength: number;
    switch (length) {
      case 'short':
        textLength = 50;
        break;
      case 'medium':
        textLength = 100;
        break;
      case 'long':
      default:
        textLength = 150;
    }

    navigation.navigate('GeneratedMessages', {
      partnerId,
      recognizedText,
      screenType,
      partnerName,
      tone: {
        formalityLevel: tone === 'frank' ? 1 : tone === 'normal' ? 2 : tone === 'formal' ? 3 : 2,
        friendlinessLevel: purpose === 'greeting' ? 2 : 3,
        humorLevel: tone === 'humorous' ? 3 : purpose === 'date' ? 2 : 1,
      },
      // lengthのテキストの数値指定を追加
      textLength,
      purpose,
    });
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
        <Text style={styles.title}>パラメータ調整</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Icon name="ellipsis-horizontal" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>トーン</Text>
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setTone('frank')}
          >
            <RadioButton selected={tone === 'frank'} />
            <Text style={styles.radioLabel}>フランク</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setTone('normal')}
          >
            <RadioButton selected={tone === 'normal'} />
            <Text style={styles.radioLabel}>普通</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setTone('formal')}
          >
            <RadioButton selected={tone === 'formal'} />
            <Text style={styles.radioLabel}>フォーマル</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setTone('humorous')}
          >
            <RadioButton selected={tone === 'humorous'} />
            <Text style={styles.radioLabel}>ユーモア</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>文量</Text>
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setLength('long')}
          >
            <RadioButton selected={length === 'long'} />
            <Text style={styles.radioLabel}>長</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setLength('medium')}
          >
            <RadioButton selected={length === 'medium'} />
            <Text style={styles.radioLabel}>中</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setLength('short')}
          >
            <RadioButton selected={length === 'short'} />
            <Text style={styles.radioLabel}>短</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>目的</Text>
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setPurpose('greeting')}
          >
            <RadioButton selected={purpose === 'greeting'} />
            <Text style={styles.radioLabel}>挨拶</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setPurpose('chat')}
          >
            <RadioButton selected={purpose === 'chat'} />
            <Text style={styles.radioLabel}>雑談</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setPurpose('date')}
          >
            <RadioButton selected={purpose === 'date'} />
            <Text style={styles.radioLabel}>デートの誘い</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.aiButton}
          onPress={handleAIRecommend}
        >
          <Text style={styles.aiButtonText}>AIオススメ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.generateButton}
          onPress={handleGenerateMessage}
        >
          <Text style={styles.generateButtonText}>メッセージ生成</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default TextToneAdjustmentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  menuButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#E94C89',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E94C89',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#E94C89',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E94C89',
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
  },
  aiButton: {
    backgroundColor: '#E94C89',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 20,
  },
  aiButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  generateButton: {
    backgroundColor: '#E94C89',
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 'auto',
    marginBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
