import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { TextInput, List, ActivityIndicator, Chip } from 'react-native-paper';
import { searchLocations, debounce, type LocationSuggestion } from '../utils/locationUtils';

interface LocationAutocompleteProps {
  placeholder?: string;
  onLocationSelect: (location: LocationSuggestion) => void;
  value?: string;
  disabled?: boolean;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  placeholder = "Search for a location...",
  onLocationSelect,
  value = '',
  disabled = false,
}) => {
  const [searchText, setSearchText] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      try {
        const results = await searchLocations(query);
        setSuggestions(results.slice(0, 8)); // Limit to 8 results to avoid too long lists
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const handleTextChange = (text: string) => {
    setSearchText(text);
    setShowSuggestions(true);
    
    if (text.trim().length >= 2) {
      setIsLoading(true);
      debouncedSearch(text);
    } else {
      setSuggestions([]);
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (location: LocationSuggestion) => {
    setSearchText(location.displayName);
    setShowSuggestions(false);
    setSuggestions([]);
    onLocationSelect(location);
  };

  const handleClearSearch = () => {
    setSearchText('');
    setSuggestions([]);
    setShowSuggestions(false);
    setIsLoading(false);
  };

  const renderSuggestionItem = (item: LocationSuggestion, index: number) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.suggestionItem,
        index === suggestions.length - 1 && styles.lastSuggestionItem
      ]}
      onPress={() => handleLocationSelect(item)}
      activeOpacity={0.7}
    >
      <List.Item
        title={item.city || item.country}
        description={item.displayName}
        left={() => <List.Icon icon="map-marker" />}
        titleStyle={styles.suggestionTitle}
        descriptionStyle={styles.suggestionDescription}
        style={styles.listItem}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        placeholder={placeholder}
        value={searchText}
        onChangeText={handleTextChange}
        onFocus={() => setShowSuggestions(true)}
        disabled={disabled}
        right={
          searchText ? (
            <TextInput.Icon 
              icon="close" 
              onPress={handleClearSearch} 
            />
          ) : undefined
        }
        style={styles.textInput}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#2196F3" />
        </View>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <ScrollView
            style={styles.suggestionsList}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {suggestions.map((item, index) => renderSuggestionItem(item, index))}
          </ScrollView>
        </View>
      )}

      {showSuggestions && searchText.length >= 2 && suggestions.length === 0 && !isLoading && (
        <View style={styles.noResultsContainer}>
          <List.Item
            title="No locations found"
            description="Try different keywords or check spelling"
            left={() => <List.Icon icon="map-search" />}
            titleStyle={styles.noResultsTitle}
            descriptionStyle={styles.noResultsDescription}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  textInput: {
    backgroundColor: '#fff',
  },
  loadingContainer: {
    position: 'absolute',
    right: 10,
    top: 15,
    zIndex: 1001,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    maxHeight: 300,
    zIndex: 1002,
  },
  suggestionsList: {
    maxHeight: 300,
  },
  suggestionItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastSuggestionItem: {
    borderBottomWidth: 0,
  },
  listItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  suggestionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  noResultsContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1002,
  },
  noResultsTitle: {
    fontSize: 16,
    color: '#666',
  },
  noResultsDescription: {
    fontSize: 14,
    color: '#999',
  },
});

export default LocationAutocomplete; 