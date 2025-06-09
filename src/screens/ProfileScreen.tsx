import React, { useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Button, Card, Title, Paragraph, Avatar, List } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import { LocationStorage } from '../utils/locationStorage';
import type { UserProfile } from '../types';

const ProfileScreen = () => {
  const [travelStats, setTravelStats] = useState({
    totalCountries: 0,
    totalCities: 0,
    totalRegions: 0,
    visitedCountries: [] as string[],
    visitedRegions: [] as string[],
    visitedCities: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadTravelStats = async () => {
    try {
      setIsLoading(true);
      const stats = await LocationStorage.getTravelStats();
      setTravelStats(stats);
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
              <Paragraph style={styles.statLabel}>Countries</Paragraph>
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
        </Card.Content>
      </Card>

      {/* Detailed Stats */}
      {travelStats.visitedCountries.length > 0 && (
        <Card style={styles.detailCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>🏴 Countries Visited</Title>
            {travelStats.visitedCountries.slice(0, 5).map((country, index) => (
              <List.Item
                key={index}
                title={country}
                left={() => <List.Icon icon="flag" />}
                titleStyle={styles.listItemTitle}
              />
            ))}
            {travelStats.visitedCountries.length > 5 && (
              <List.Item
                title={`... and ${travelStats.visitedCountries.length - 5} more countries`}
                left={() => <List.Icon icon="dots-horizontal" />}
                titleStyle={[styles.listItemTitle, styles.moreItemsText]}
              />
            )}
          </Card.Content>
        </Card>
      )}

      {travelStats.visitedCities.length > 0 && (
        <Card style={styles.detailCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>🏙️ Cities Explored</Title>
            {travelStats.visitedCities.slice(0, 5).map((city, index) => (
              <List.Item
                key={index}
                title={city}
                left={() => <List.Icon icon="city" />}
                titleStyle={styles.listItemTitle}
              />
            ))}
            {travelStats.visitedCities.length > 5 && (
              <List.Item
                title={`... and ${travelStats.visitedCities.length - 5} more cities`}
                left={() => <List.Icon icon="dots-horizontal" />}
                titleStyle={[styles.listItemTitle, styles.moreItemsText]}
              />
            )}
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
  listItemTitle: {
    fontSize: 16,
    color: '#333',
  },
  moreItemsText: {
    fontStyle: 'italic',
    color: '#666',
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
});

export default ProfileScreen; 