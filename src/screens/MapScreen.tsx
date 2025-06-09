import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { FAB } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import MapViewComponent from '../components/MapView';
import { LocationStorage } from '../utils/locationStorage';
import type { Location } from '../types';

const MapScreen = () => {
  const navigation = useNavigation();
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadLocations = async () => {
    try {
      setIsLoading(true);
      const savedLocations = await LocationStorage.loadLocations();
      setLocations(savedLocations);
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load locations when screen is focused (e.g., when returning from AddLocation)
  useFocusEffect(
    useCallback(() => {
      loadLocations();
    }, [])
  );

  return (
    <View style={styles.container}>
      <MapViewComponent 
        locations={locations} 
        isLoading={isLoading}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddLocation' as never)}
        label="Add Visit"
        mode="flat"
        size="medium"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  fab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 100, // Moved up to avoid tab bar
    backgroundColor: '#007AFF',
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
});

export default MapScreen; 