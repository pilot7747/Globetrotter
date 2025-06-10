import React, { useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Button, Card, Title, Paragraph, Avatar, List, Chip, IconButton } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import { LocationStorage } from '../utils/locationStorage';
import type { UserProfile, Location } from '../types';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [travelStats, setTravelStats] = useState({
    totalCountries: 0,
    totalCities: 0,
    totalRegions: 0,
    visitedCountries: [] as string[],
    visitedRegions: [] as string[],
    visitedCities: [] as string[],
  });
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [countryData, setCountryData] = useState<{ [key: string]: string }>({});

  // Total countries in the world (recognized by UN)
  const WORLD_COUNTRIES_COUNT = 195;

  // Convert ISO-2 country code to flag emoji
  const iso2ToFlag = (iso2Code: string): string => {
    if (!iso2Code || iso2Code.length !== 2) return '🏴';
    
    const codePoints = iso2Code
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    
    return String.fromCodePoint(...codePoints);
  };

  // Load country data from API
  const loadCountryData = async () => {
    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2');
      const countries = await response.json();
      
      const countryMap: { [key: string]: string } = {};
      countries.forEach((country: any) => {
        // Map common name to ISO-2 code
        if (country.name?.common && country.cca2) {
          countryMap[country.name.common.toLowerCase()] = country.cca2;
        }
        // Also map official name
        if (country.name?.official && country.cca2) {
          countryMap[country.name.official.toLowerCase()] = country.cca2;
        }
      });
      
      setCountryData(countryMap);
    } catch (error) {
      console.error('Failed to load country data:', error);
      // Fallback to empty map, will show 🏴 flags
      setCountryData({});
    }
  };

  // Function to get country flag emoji dynamically
  const getCountryFlag = (countryName: string): string => {
    const normalizedName = countryName.toLowerCase().trim();
    const iso2Code = countryData[normalizedName];
    return iso2Code ? iso2ToFlag(iso2Code) : '🏴';
  };

  // Group locations by country
  const getLocationsByCountry = () => {
    const groupedLocations: { [country: string]: Location[] } = {};
    locations.forEach(location => {
      if (!groupedLocations[location.country]) {
        groupedLocations[location.country] = [];
      }
      groupedLocations[location.country].push(location);
    });
    return groupedLocations;
  };

  const loadTravelStats = async () => {
    try {
      setIsLoading(true);
      
      // Load both travel stats and country data in parallel
      const [stats, allLocations] = await Promise.all([
        LocationStorage.getTravelStats(),
        LocationStorage.loadLocations(),
        loadCountryData() // This runs in parallel but doesn't return anything
      ]);
      
      setTravelStats(stats);
      setLocations(allLocations);
    } catch (error) {
      console.error('Error loading travel stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load stats when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadTravelStats();
    }, [])
  );

  const editLocation = (location: Location) => {
    (navigation as any).navigate('AddLocation', { editLocation: location });
  };

  const deleteLocation = async (locationId: string) => {
    Alert.alert(
      'Delete Visit',
      'Are you sure you want to delete this visit?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await LocationStorage.deleteLocation(locationId);
              loadTravelStats(); // Refresh data
            } catch (error) {
              console.error('Error deleting location:', error);
              Alert.alert('Error', 'Failed to delete visit.');
            }
          },
        },
      ]
    );
  };

  const shareProfile = async () => {
    try {
      const message = `Check out my travel journey! I've visited ${travelStats.totalCountries} countries and ${travelStats.totalCities} cities!`;
      
      if (await Sharing.isAvailableAsync()) {
        // Create detailed travel report
        let shareContent = `🌍 My Globetrotter Travel Stats 🌍\n\n`;
        shareContent += `📊 Summary:\n`;
        shareContent += `• Countries visited: ${travelStats.totalCountries}\n`;
        shareContent += `• Cities explored: ${travelStats.totalCities}\n`;
        shareContent += `• Regions discovered: ${travelStats.totalRegions}\n\n`;
        
        if (travelStats.visitedCountries.length > 0) {
          shareContent += `🏴 Countries I've been to:\n`;
          travelStats.visitedCountries.forEach(country => {
            shareContent += `• ${country}\n`;
          });
          shareContent += '\n';
        }
        
        if (travelStats.visitedCities.length > 0 && travelStats.visitedCities.length <= 10) {
          shareContent += `🏙️ Cities I've explored:\n`;
          travelStats.visitedCities.slice(0, 10).forEach(city => {
            shareContent += `• ${city}\n`;
          });
          if (travelStats.visitedCities.length > 10) {
            shareContent += `• ... and ${travelStats.visitedCities.length - 10} more!\n`;
          }
          shareContent += '\n';
        }
        
        shareContent += `\nShared via Globetrotter - Track your travels! 🗺️`;
        
        Alert.alert(
          'Share Travel Report',
          'Your travel report is ready to share!\n\n' + shareContent.slice(0, 200) + '...',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Share', onPress: () => console.log('Would share:', shareContent) }
          ]
        );
      } else {
        Alert.alert('Sharing Not Available', 'Sharing is not available on this device.');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share travel report.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Icon size={80} icon="account" style={styles.avatar} />
          <Title style={styles.name}>Travel Enthusiast</Title>
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Title style={styles.statNumber}>{travelStats.totalCountries}</Title>
              <Paragraph style={styles.statLabel}>of {WORLD_COUNTRIES_COUNT}</Paragraph>
              <Paragraph style={styles.statSubLabel}>Countries</Paragraph>
            </View>
            <View style={styles.statItem}>
              <Title style={styles.statNumber}>{travelStats.totalCities}</Title>
              <Paragraph style={styles.statLabel}>Cities</Paragraph>
            </View>
            <View style={styles.statItem}>
              <Title style={styles.statNumber}>{travelStats.totalRegions}</Title>
              <Paragraph style={styles.statLabel}>Regions</Paragraph>
            </View>
          </View>
          
          {/* Progress indicator for countries */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min((travelStats.totalCountries / WORLD_COUNTRIES_COUNT) * 100, 100)}%` }
                ]} 
              />
            </View>
            <Paragraph style={styles.progressText}>
              {((travelStats.totalCountries / WORLD_COUNTRIES_COUNT) * 100).toFixed(1)}% of the world explored
            </Paragraph>
          </View>
        </Card.Content>
      </Card>

      {/* Detailed Stats - Grouped by Country */}
      {Object.keys(getLocationsByCountry()).length > 0 && (
        <Card style={styles.detailCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>🌍 Your Travel Journey</Title>
            {Object.entries(getLocationsByCountry()).map(([country, countryLocations]) => (
              <View key={country} style={styles.countrySection}>
                <View style={styles.countryHeader}>
                  <View style={styles.countryTitleContainer}>
                    <Title style={styles.countryTitle}>
                      {getCountryFlag(country)} {country}
                    </Title>
                    <Chip 
                      style={styles.locationCountChip}
                      textStyle={styles.chipText}
                    >
                      {countryLocations.length} visit{countryLocations.length !== 1 ? 's' : ''}
                    </Chip>
                  </View>
                </View>
                
                {countryLocations.map((location, index) => (
                  <View key={location.id} style={styles.locationItem}>
                    <View style={styles.locationInfo}>
                      <Paragraph style={styles.locationTitle}>
                        {location.city ? `${location.city}` : country}
                        {location.region && `, ${location.region}`}
                      </Paragraph>
                      <Paragraph style={styles.locationDate}>
                        {new Date(location.visitDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </Paragraph>
                      {location.notes && (
                        <Paragraph style={styles.locationNotes}>{location.notes}</Paragraph>
                      )}
                    </View>
                    <View style={styles.locationActions}>
                      <IconButton
                        icon="pencil"
                        size={16}
                        onPress={() => editLocation(location)}
                        style={styles.actionButton}
                      />
                      <IconButton
                        icon="delete"
                        size={16}
                        onPress={() => deleteLocation(location.id)}
                        style={styles.actionButton}
                      />
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Action Buttons */}
      <Card style={styles.actionCard}>
        <Card.Content>
          <Button
            mode="contained"
            icon="share-variant"
            onPress={shareProfile}
            style={styles.shareButton}
            disabled={travelStats.totalCountries === 0}
          >
            Share Travel Report
          </Button>
          
          {travelStats.totalCountries === 0 && (
            <Paragraph style={styles.emptyStateText}>
              Start adding locations to your travel log to see your stats here! 🗺️
            </Paragraph>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileCard: {
    margin: 16,
    elevation: 4,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    backgroundColor: '#2196F3',
  },
  name: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: 'bold',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statSubLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  detailCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
    color: '#333',
  },
  countrySection: {
    marginBottom: 16,
  },
  countryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  countryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  locationCountChip: {
    backgroundColor: '#2196F3',
  },
  chipText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    color: '#333',
  },
  locationDate: {
    fontSize: 12,
    color: '#666',
  },
  locationNotes: {
    fontSize: 12,
    color: '#666',
  },
  locationActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 8,
  },
  actionCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  shareButton: {
    marginTop: 10,
    backgroundColor: '#2196F3',
    paddingVertical: 4,
  },
  emptyStateText: {
    textAlign: 'center',
    marginTop: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  progressContainer: {
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 4,
  },
  progressBar: {
    height: 8,
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});

export default ProfileScreen; 