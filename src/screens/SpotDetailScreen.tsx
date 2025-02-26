// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Linking } from 'react-native';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import * as ExpoLinking from 'expo-linking';
// import Ionicons from 'react-native-vector-icons/Ionicons';

// const SpotDetailScreen = () => {
//   const navigation = useNavigation();
//   const route = useRoute();
  
//   // State to store spot details
//   const [spot, setSpot] = useState<{
//     name: string;
//     description: string;
//     address?: string;
//     category?: string
//   }>(() => {
//     // Initialize from route params if available
//     if (route.params && 'spot' in route.params) {
//       return (route.params as { spot: any }).spot;
//     }
//     // Default empty spot
//     return { name: '', description: '' };
//   });

//   // Handle deep links
//   useEffect(() => {
//     // Set up URL listener
//     const handleUrl = (event: { url: string }) => {
//       const { queryParams } = ExpoLinking.parse(event.url);
      
//       if (queryParams) {
//         setSpot({
//           name: decodeURIComponent(queryParams.name as string || ''),
//           description: decodeURIComponent(queryParams.description as string || ''),
//           address: queryParams.address ? decodeURIComponent(queryParams.address as string) : undefined,
//           category: queryParams.category ? decodeURIComponent(queryParams.category as string) : undefined
//         });
//       }
//     };

//     // Get the initial URL
//     ExpoLinking.getInitialURL().then(url => {
//       if (url) {
//         handleUrl({ url });
//       }
//     });

//     // Add event listener for URL changes
//     const subscription = ExpoLinking.addEventListener('url', handleUrl);

//     return () => {
//       // Clean up event listener
//       subscription.remove();
//     };
//   }, []);

//   const handleBack = () => {
//     navigation.goBack();
//   };

//   const openMap = () => {
//     if (!spot.address) return;
    
//     const query = encodeURIComponent(spot.address);
//     const mapsUrl = Platform.select({
//       ios: `maps://maps.apple.com/?q=${query}`,
//       android: `https://www.google.com/maps/search/?api=1&query=${query}`,
//     });

//     if (mapsUrl) {
//       Linking.canOpenURL(mapsUrl).then(supported => {
//         if (supported) {
//           Linking.openURL(mapsUrl);
//         }
//       });
//     }
//   };

//   // 回答をパラグラフに分割（改行が1つ以上の場合は分割）
//   const paragraphs = spot.description.split(/\n{1,}/).filter(p => p.trim());

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={handleBack} style={styles.backButton}>
//           <Ionicons name="chevron-back" size={24} color="#FFF" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>おすすめスポット</Text>
//         <View style={styles.placeholder} />
//       </View>

//       {/* Content */}
//       <ScrollView style={styles.content}>
//         <View style={styles.titleContainer}>
//           <Text style={styles.titleText}>{spot.name}</Text>
//           {spot.category && (
//             <View style={styles.categoryTag}>
//               <Text style={styles.categoryText}>{spot.category}</Text>
//             </View>
//           )}
//         </View>
        
//         <View style={styles.contentContainer}>
//           {paragraphs.map((paragraph, index) => (
//             <View key={index} style={styles.paragraph}>
//               <Text style={styles.responseText}>{paragraph}</Text>
//             </View>
//           ))}
          
//           {spot.address && (
//             <TouchableOpacity
//               style={styles.addressContainer}
//               onPress={openMap}
//             >
//               <Ionicons name="location-outline" size={20} color="#4B7BF5" />
//               <Text style={styles.address}>{spot.address}</Text>
//               <Ionicons name="open-outline" size={20} color="#4B7BF5" />
//             </TouchableOpacity>
//           )}
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8F9FA',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 16,
//     backgroundColor: '#FF4B8C',
//   },
//   backButton: {
//     width: 40,
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: '600',
//     color: '#FFF',
//     textAlign: 'center',
//     flex: 1,
//   },
//   placeholder: {
//     width: 40,
//   },
//   content: {
//     flex: 1,
//     padding: 16,
//   },
//   titleContainer: {
//     marginBottom: 20,
//   },
//   titleText: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 8,
//   },
//   contentContainer: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   paragraph: {
//     marginBottom: 16,
//     padding: 16,
//     backgroundColor: '#f8f8f8',
//     borderRadius: 8,
//     borderLeftWidth: 4,
//     borderLeftColor: '#4B7BF5',
//   },
//   responseText: {
//     fontSize: 16,
//     lineHeight: 24,
//     color: '#333',
//   },
//   categoryTag: {
//     alignSelf: 'flex-start',
//     backgroundColor: '#e8f4ff',
//     paddingVertical: 4,
//     paddingHorizontal: 12,
//     borderRadius: 16,
//     marginTop: 4,
//     marginBottom: 12,
//   },
//   categoryText: {
//     color: '#4B7BF5',
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   addressContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f8f8f8',
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 16,
//   },
//   address: {
//     flex: 1,
//     fontSize: 16,
//     color: '#4B7BF5',
//     marginHorizontal: 8,
//   },
// });

// export default SpotDetailScreen;