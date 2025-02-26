// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   ScrollView,
//   SafeAreaView,
//   KeyboardAvoidingView,
//   Platform,
//   Keyboard,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import * as Linking from 'expo-linking';
// import { supabase } from '../lib/supabase';

// type SearchResult = {
//   name: string;
//   description: string;
//   address?: string;
//   category?: string;
// };

// const SearchSuggestion = ({ text, onPress }: { text: string; onPress: () => void }) => (
//   <TouchableOpacity style={styles.suggestionButton} onPress={onPress}>
//     <Text style={styles.suggestionText}>{text}</Text>
//   </TouchableOpacity>
// );

// const SearchResultItem = ({ spot, onPress }: { spot: SearchResult; onPress: () => void }) => (
//   <TouchableOpacity style={styles.resultItem} onPress={onPress}>
//     <View style={styles.resultContent}>
//       <Text style={styles.spotName}>{spot.name}</Text>
//       {spot.category && (
//         <View style={styles.categoryTag}>
//           <Text style={styles.categoryText}>{spot.category}</Text>
//         </View>
//       )}
//       <Text style={styles.spotDescription}>{spot.description}</Text>
//       {spot.address && (
//         <View style={styles.addressContainer}>
//           <Ionicons name="location-outline" size={16} color="#666" />
//           <Text style={styles.spotAddress}>{spot.address}</Text>
//         </View>
//       )}
//     </View>
//     <Ionicons name="chevron-forward" size={24} color="#ccc" />
//   </TouchableOpacity>
// );

// const DateSpotSearchScreen = () => {
//   const navigation = useNavigation();
//   const [searchQuery, setSearchQuery] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [results, setResults] = useState<SearchResult[]>([]);

//   // 画面がフォーカスされたときに状態をリセット
//   useFocusEffect(
//     useCallback(() => {
//       // 状態を初期化
//       setSearchQuery('');
//       setResults([]);
//       setError(null);
//       setIsLoading(false);
//     }, [])
//   );

//   const restaurantSuggestions = [
//     "初デートにおすすめな渋谷のカフェ教えて",
//     "新宿周辺の韓国料理屋教えて",
//     "代官山のおしゃれなレストラン",
//     "恵比寿の隠れ家イタリアン",
//   ];

//   const spotSuggestions = [
//     "渋谷周辺のデートスポット教えて",
//     "横浜の穴場スポット教えて",
//     "ドライブデートするならどこ",
//     "雨の日のデートスポット",
//     "夜景がきれいなスポット",
//   ];

//   const searchDateSpots = async (query: string = searchQuery) => {
//     if (!query.trim()) return;

//     setIsLoading(true);
//     setError(null);

//     try {
//       const { data: userData, error: userError } = await supabase.auth.getUser();
//       if (userError) throw userError;
//       if (!userData.user) throw new Error('ユーザー情報が取得できません');

//       const { data, error } = await supabase.functions.invoke('search-datespot', {
//         body: {
//           query,
//           userId: userData.user.id,
//           timestamp: new Date().toISOString()
//         }
//       });

//       if (error) throw error;
// console.log('Search response:', data);

// // Perplexity APIからの回答を解析して、より詳細なスポット情報を作成
// const answer = data.answer;

// // カテゴリを推測（回答の内容から判断）
// let category = '';
// if (answer.includes('カフェ') || answer.includes('コーヒー')) {
//   category = 'カフェ';
// } else if (answer.includes('レストラン') || answer.includes('料理')) {
//   category = 'レストラン';
// } else if (answer.includes('公園') || answer.includes('自然')) {
//   category = '自然・公園';
// } else if (answer.includes('美術館') || answer.includes('博物館')) {
//   category = '文化施設';
// } else if (answer.includes('ショッピング') || answer.includes('モール')) {
//   category = 'ショッピング';
// } else {
//   category = 'デートスポット';
// }

// // 回答を名前と説明に分割
// let name = '';
// let description = '';

// // 回答に改行が含まれている場合は、最初の行を名前、残りを説明として扱う
// if (answer.includes('\n\n')) {
//   const parts = answer.split('\n\n');
//   name = parts[0].trim();
//   description = parts.slice(1).join('\n\n').trim();
// } else {
//   // 改行がない場合は、全体を説明として扱い、名前はクエリから生成
//   description = answer;
//   name = `「${searchQuery}」の検索結果`;
// }

// const spot = {
//   name,
//   description,
//   category
// };

// setResults([spot]);

// // 検索結果が得られたら自動的に詳細画面に遷移 (Expo Linkingを使用)
// const spotDetailUrl = Linking.createURL('spot-detail', {
//   queryParams: {
//     name: encodeURIComponent(spot.name),
//     description: encodeURIComponent(spot.description),
//     category: encodeURIComponent(spot.category)
//   }
// });

// Linking.openURL(spotDetailUrl);

//     } catch (err) {
//       console.error('Search error:', err);
//       setError('検索中にエラーが発生しました。もう一度お試しください。');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const renderHeader = () => (
//     <View style={styles.header}>
//       <View style={styles.placeholder} />
//       <Text style={styles.headerTitle}>デートスポット検索</Text>
//       <View style={styles.placeholder} />
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <KeyboardAvoidingView 
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.keyboardAvoidingView}
//       >
//         {renderHeader()}
        
//         <ScrollView 
//           style={styles.scrollView}
//           keyboardShouldPersistTaps="handled"
//         >
//           {/* Restaurant Section */}
//           <View style={styles.section}>
//             <View style={styles.sectionHeader}>
//               <Ionicons name="restaurant-outline" size={24} color="#333" />
//               <Text style={styles.sectionTitle}>Restaurant</Text>
//             </View>
//             <View style={styles.suggestionsContainer}>
//               {restaurantSuggestions.map((suggestion, index) => (
//                 <SearchSuggestion
//                   key={index}
//                   text={suggestion}
//                   onPress={() => {
//                     setSearchQuery(suggestion);
//                     searchDateSpots(suggestion);
//                   }}
//                 />
//               ))}
//             </View>
//           </View>

//           {/* Spot Section */}
//           <View style={styles.section}>
//             <View style={styles.sectionHeader}>
//               <Ionicons name="location-outline" size={24} color="#333" />
//               <Text style={styles.sectionTitle}>Spot</Text>
//             </View>
//             <View style={styles.suggestionsContainer}>
//               {spotSuggestions.map((suggestion, index) => (
//                 <SearchSuggestion
//                   key={index}
//                   text={suggestion}
//                   onPress={() => {
//                     setSearchQuery(suggestion);
//                     searchDateSpots(suggestion);
//                   }}
//                 />
//               ))}
//             </View>
//           </View>

//           {/* Search Results */}
//           {isLoading ? (
//             <View style={styles.loadingContainer}>
//               <ActivityIndicator size="large" color="#4B7BF5" />
//             </View>
//           ) : error ? (
//             <View style={styles.errorContainer}>
//               <Text style={styles.errorText}>{error}</Text>
//             </View>
//           ) : results.length > 0 && (
//             <View style={styles.section}>
//               <View style={styles.sectionHeader}>
//                 <Ionicons name="search-outline" size={24} color="#333" />
//                 <Text style={styles.sectionTitle}>検索結果</Text>
//               </View>
//               <View style={styles.resultsContainer}>
//                 {results.map((spot, index) => (
//                   <TouchableOpacity
//                     key={index}
//                     style={styles.resultItem}
//                     onPress={() => {
//                       const spotDetailUrl = Linking.createURL('spot-detail', {
//                         queryParams: {
//                           name: encodeURIComponent(spot.name),
//                           description: encodeURIComponent(spot.description || ''),
//                           category: encodeURIComponent(spot.category || ''),
//                           address: spot.address ? encodeURIComponent(spot.address) : ''
//                         }
//                       });
//                       Linking.openURL(spotDetailUrl);
//                     }}
//                   >
//                     <View style={styles.resultContent}>
//                       <Text style={styles.spotDescription}>{spot.name}</Text>
//                       <Ionicons name="chevron-forward" size={24} color="#ccc" />
//                     </View>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>
//           )}
//         </ScrollView>

//         {/* Search Bar */}
//         <View style={styles.searchContainer}>
//           <TextInput
//             style={styles.searchInput}
//             placeholder="場所や雰囲気を入力してください"
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//             onSubmitEditing={() => {
//               searchDateSpots();
//               Keyboard.dismiss();
//             }}
//           />
//           <TouchableOpacity
//             style={styles.searchButton}
//             onPress={() => {
//               searchDateSpots();
//               Keyboard.dismiss();
//             }}
//             disabled={isLoading}
//           >
//             <Icon name="magnify" size={24} color="#fff" />
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8F9FA',
//   },
//   keyboardAvoidingView: {
//     flex: 1,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 16,
//     backgroundColor: '#FF4B8C',
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: '600',
//     color: '#FFF',
//     textAlign: 'center',
//   },
//   placeholder: {
//     width: 40,
//   },
//   section: {
//     padding: 20,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginLeft: 10,
//   },
//   suggestionsContainer: {
//     gap: 10,
//   },
//   suggestionButton: {
//     backgroundColor: '#F5F5F5',
//     padding: 15,
//     borderRadius: 10,
//   },
//   suggestionText: {
//     fontSize: 14,
//     color: '#333',
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: '#fff',
//     borderTopWidth: 1,
//     borderTopColor: '#e0e0e0',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: -2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   searchInput: {
//     flex: 1,
//     height: 48,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 24,
//     paddingHorizontal: 16,
//     fontSize: 16,
//   },
//   searchButton: {
//     width: 48,
//     height: 48,
//     backgroundColor: '#4B7BF5',
//     borderRadius: 24,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingContainer: {
//     padding: 20,
//     alignItems: 'center',
//   },
//   errorContainer: {
//     padding: 20,
//     alignItems: 'center',
//   },
//   errorText: {
//     color: '#ff4444',
//     textAlign: 'center',
//   },
//   resultsContainer: {
//     gap: 16,
//   },
//   resultItem: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   resultContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   categoryTag: {
//     backgroundColor: '#F5F5F5',
//     padding: 4,
//     borderRadius: 4,
//     marginRight: 8,
//   },
//   categoryText: {
//     fontSize: 12,
//     color: '#666',
//   },
//   addressContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 4,
//   },
//   spotName: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   spotCategory: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 8,
//   },
//   spotDescription: {
//     fontSize: 16,
//     marginBottom: 8,
//     lineHeight: 22,
//   },
//   spotAddress: {
//     fontSize: 14,
//     color: '#666',
//     marginLeft: 4,
//   },
// });

// export default DateSpotSearchScreen;