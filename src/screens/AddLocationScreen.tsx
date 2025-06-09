import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Title, Chip } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import type { Location } from '../types';
import { getCurrentLocation, reverseGeocode, type LocationSuggestion } from '../utils/locationUtils';
import { LocationStorage } from '../utils/locationStorage';
import LocationAutocomplete from '../components/LocationAutocomplete';

const AddLocationScreen = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState<Partial<Location>>({
    country: '',
    region: '',
    city: '',
    visitDate: new Date(),
    notes: '',
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [photoUri, setPhotoUri] = useState<string>();
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, visitDate: selectedDate });
    }
  };

  const handleSelectPhoto = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.assets && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
      setFormData({ ...formData, photoUri: result.assets[0].uri });
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const coordinates = await getCurrentLocation();
      if (coordinates) {
        const locationInfo = await reverseGeocode(coordinates);
        if (locationInfo) {
          setSelectedLocation(locationInfo);
          setFormData({
            ...formData,
            country: locationInfo.country,
            region: locationInfo.region || '',
            city: locationInfo.city || '',
            coordinates,
          });
        } else {
          Alert.alert('Location Error', 'Unable to get location information from your coordinates.');
        }
      } else {
        Alert.alert('Location Error', 'Unable to get your current location. Please check your location permissions.');
      }
    } catch (error) {
      Alert.alert('Location Error', 'Failed to get location information.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleLocationSelect = (location: LocationSuggestion) => {
    setSelectedLocation(location);
    setFormData({
      ...formData,
      country: location.country,
      region: location.region || '',
      city: location.city || '',
      coordinates: location.coordinates,
    });
  };

  const handleSubmit = async () => {
    if (!selectedLocation || !formData.country) {
      Alert.alert('Missing Information', 'Please search and select a location.');
      return;
    }

    setIsSaving(true);
    try {
      // Generate ID for the location
      const newLocation: Location = {
        ...formData,
        id: Date.now().toString(),
        country: formData.country!,
        visitDate: formData.visitDate || new Date(),
        coordinates: formData.coordinates!,
      } as Location;

      // Save to storage
      await LocationStorage.addLocation(newLocation);
      
      Alert.alert(
        'Success!', 
        'Location added to your travel log.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving location:', error);
      Alert.alert('Error', 'Failed to save location. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Title style={styles.title}>Add New Location</Title>

      {/* Quick current location option */}
      <View style={styles.quickActions}>
        <Button
          mode="outlined"
          onPress={handleUseCurrentLocation}
          loading={isLoadingLocation}
          icon="crosshairs-gps"
          style={styles.quickButton}
        >
          Use Current Location
        </Button>
      </View>

      {/* Location search with autocomplete */}
      <View style={styles.autocompleteContainer}>
        <LocationAutocomplete
          placeholder="Search for a location (e.g., 'Ber...' for Berlin)"
          onLocationSelect={handleLocationSelect}
          disabled={isLoadingLocation}
        />
      </View>

      {/* Show selected location details */}
      {selectedLocation && (
        <View style={styles.selectedLocationContainer}>
          <Title style={styles.selectedLocationTitle}>Selected Location:</Title>
          <Chip 
            icon="map-marker" 
            mode="outlined"
            style={styles.locationChip}
          >
            {selectedLocation.city || selectedLocation.country}
          </Chip>
          <View style={styles.locationDetails}>
            {selectedLocation.city && (
              <TextInput
                label="City"
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
                style={styles.input}
                mode="outlined"
              />
            )}
            {selectedLocation.region && (
              <TextInput
                label="Region/State"
                value={formData.region}
                onChangeText={(text) => setFormData({ ...formData, region: text })}
                style={styles.input}
                mode="outlined"
              />
            )}
            <TextInput
              label="Country"
              value={formData.country}
              onChangeText={(text) => setFormData({ ...formData, country: text })}
              style={styles.input}
              mode="outlined"
            />
          </View>
        </View>
      )}

      {/* Visit date */}
      <Button
        mode="outlined"
        onPress={() => setShowDatePicker(true)}
        style={styles.input}
        icon="calendar"
      >
        Visit Date: {formData.visitDate
          ? formData.visitDate.toLocaleDateString()
          : 'Select Date'}
      </Button>

      {showDatePicker && (
        <DateTimePicker
          value={formData.visitDate || new Date()}
          mode="date"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* Notes */}
      <TextInput
        label="Notes (Optional)"
        value={formData.notes}
        onChangeText={(text) => setFormData({ ...formData, notes: text })}
        style={styles.input}
        mode="outlined"
        multiline
        numberOfLines={3}
        placeholder="What made this place special? Any memories to remember?"
      />

      {/* Photo */}
      <Button
        mode="outlined"
        onPress={handleSelectPhoto}
        style={styles.input}
        icon="camera"
      >
        {photoUri ? 'Change Photo' : 'Add Photo (Optional)'}
      </Button>

      {/* Show coordinates if available */}
      {formData.coordinates && formData.coordinates.latitude !== 0 && (
        <View style={styles.coordinatesContainer}>
          <Chip icon="crosshairs-gps" mode="outlined">
            📍 {formData.coordinates.latitude.toFixed(4)}, {formData.coordinates.longitude.toFixed(4)}
          </Chip>
        </View>
      )}

      {/* Submit button */}
      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.submitButton}
        disabled={!selectedLocation || !formData.country || isSaving}
        loading={isSaving}
      >
        {isSaving ? 'Saving...' : 'Save Location'}
      </Button>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Title style={styles.instructionsTitle}>💡 How to use:</Title>
        <TextInput
          mode="outlined"
          value="1. Search for your location (e.g., 'Berlin', 'Paris', 'Tokyo')
2. Select from suggestions - all fields auto-fill
3. Adjust details if needed
4. Add visit date and notes
5. Save to your travel log!"
          multiline
          editable={false}
          style={styles.instructions}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  quickActions: {
    marginBottom: 20,
  },
  quickButton: {
    backgroundColor: '#fff',
  },
  autocompleteContainer: {
    marginBottom: 20,
    zIndex: 1000,
  },
  selectedLocationContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedLocationTitle: {
    fontSize: 16,
    marginBottom: 8,
    color: '#495057',
  },
  locationChip: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  locationDetails: {
    gap: 12,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  coordinatesContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 24,
    backgroundColor: '#2196F3',
    paddingVertical: 4,
  },
  instructionsContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  instructionsTitle: {
    fontSize: 16,
    marginBottom: 8,
    color: '#1976d2',
  },
  instructions: {
    backgroundColor: 'transparent',
    fontSize: 14,
  },
});

export default AddLocationScreen; 