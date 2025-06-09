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
        icon="add"
        style={styles.fab}
        onPress={() => navigation.navigate('AddLocation' as never)}
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
    right: 20,
    bottom: 120,
    backgroundColor: '#007AFF',
    borderRadius: 28,
  },
});

export default MapScreen; 