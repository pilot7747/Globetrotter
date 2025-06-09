import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Location } from '../types';

const STORAGE_KEY = '@globetrotter_locations';

export class LocationStorage {
  // Save locations to storage
  static async saveLocations(locations: Location[]): Promise<void> {
    try {
      const jsonValue = JSON.stringify(locations);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving locations:', error);
      throw new Error('Failed to save locations');
    }
  }

  // Load locations from storage
  static async loadLocations(): Promise<Location[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        const locations = JSON.parse(jsonValue);
        // Convert date strings back to Date objects
        return locations.map((location: any) => ({
          ...location,
          visitDate: new Date(location.visitDate),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading locations:', error);
      return [];
    }
  }

  // Add a new location
  static async addLocation(location: Location): Promise<Location[]> {
    try {
      const existingLocations = await this.loadLocations();
      const newLocations = [...existingLocations, location];
      await this.saveLocations(newLocations);
      return newLocations;
    } catch (error) {
      console.error('Error adding location:', error);
      throw new Error('Failed to add location');
    }
  }

  // Update an existing location
  static async updateLocation(locationId: string, updatedLocation: Partial<Location>): Promise<Location[]> {
    try {
      const existingLocations = await this.loadLocations();
      const locationIndex = existingLocations.findIndex(loc => loc.id === locationId);
      
      if (locationIndex === -1) {
        throw new Error('Location not found');
      }

      existingLocations[locationIndex] = {
        ...existingLocations[locationIndex],
        ...updatedLocation,
      };

      await this.saveLocations(existingLocations);
      return existingLocations;
    } catch (error) {
      console.error('Error updating location:', error);
      throw new Error('Failed to update location');
    }
  }

  // Delete a location
  static async deleteLocation(locationId: string): Promise<Location[]> {
    try {
      const existingLocations = await this.loadLocations();
      const filteredLocations = existingLocations.filter(loc => loc.id !== locationId);
      await this.saveLocations(filteredLocations);
      return filteredLocations;
    } catch (error) {
      console.error('Error deleting location:', error);
      throw new Error('Failed to delete location');
    }
  }

  // Get travel statistics
  static async getTravelStats(): Promise<{
    totalCountries: number;
    totalCities: number;
    totalRegions: number;
    visitedCountries: string[];
    visitedRegions: string[];
    visitedCities: string[];
  }> {
    try {
      const locations = await this.loadLocations();
      
      const countries = new Set(locations.map(loc => loc.country));
      const regions = new Set(locations.filter(loc => loc.region).map(loc => `${loc.region}, ${loc.country}`));
      const cities = new Set(locations.filter(loc => loc.city).map(loc => `${loc.city}, ${loc.country}`));

      return {
        totalCountries: countries.size,
        totalCities: cities.size,
        totalRegions: regions.size,
        visitedCountries: Array.from(countries),
        visitedRegions: Array.from(regions),
        visitedCities: Array.from(cities),
      };
    } catch (error) {
      console.error('Error getting travel stats:', error);
      return {
        totalCountries: 0,
        totalCities: 0,
        totalRegions: 0,
        visitedCountries: [],
        visitedRegions: [],
        visitedCities: [],
      };
    }
  }

  // Clear all locations (for debugging or reset)
  static async clearAllLocations(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing locations:', error);
      throw new Error('Failed to clear locations');
    }
  }
} 