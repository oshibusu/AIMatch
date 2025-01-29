import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const DateSpotSearchScreen = () => {
  const SearchSuggestion = ({ text }: { text: string }) => (
    <TouchableOpacity style={styles.suggestionButton}>
      <Text style={styles.suggestionText}>{text}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Restaurant Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="restaurant-outline" size={24} color="#333" />
            <Text style={styles.sectionTitle}>Restaurant</Text>
          </View>
          <View style={styles.suggestionsContainer}>
            <SearchSuggestion text="初デートにおすすめな渋谷のカフェ教えて" />
            <SearchSuggestion text="新宿周辺の韓国料理屋教えて" />
          </View>
        </View>

        {/* Spot Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="location-outline" size={24} color="#333" />
            <Text style={styles.sectionTitle}>Spot</Text>
          </View>
          <View style={styles.suggestionsContainer}>
            <SearchSuggestion text="渋谷周辺のデートスポット教えて" />
            <SearchSuggestion text="横浜の穴場スポット教えて" />
            <SearchSuggestion text="ドライブデートするならどこ" />
          </View>
        </View>
      </ScrollView>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search ..."
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.micButton}>
            <Icon name="mic-outline" size={24} color="#E94C89" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  suggestionsContainer: {
    gap: 10,
  },
  suggestionButton: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 15,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  micButton: {
    padding: 10,
  },
});

export default DateSpotSearchScreen;