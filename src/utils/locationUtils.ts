import * as Location from 'expo-location';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface NominatimSearchResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: [string, string, string, string];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  address?: {
    house_number?: string;
    road?: string;
    village?: string;
    town?: string;
    city?: string;
    state?: string;
    country?: string;
    country_code?: string;
    postcode?: string;
  };
}

export interface LocationSuggestion {
  id: string;
  displayName: string;
  city?: string;
  region?: string;
  country: string;
  coordinates: Coordinates;
}

// Nominatim API base URL
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

export const getCurrentLocation = async (): Promise<Coordinates | null> => {
  try {
    // Request permission to access location
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return null;
    }

    // Get current position
    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
};

// Enhanced autocomplete search using Nominatim
export const searchLocations = async (query: string): Promise<LocationSuggestion[]> => {
  if (query.trim().length < 2) {
    return [];
  }

  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?` +
      `q=${encodeURIComponent(query)}&` +
      `format=json&` +
      `addressdetails=1&` +
      `limit=10&` +
      `dedupe=1`
    );

    if (!response.ok) {
      throw new Error('Search request failed');
    }

    const results: NominatimSearchResult[] = await response.json();
    
    return results.map((result) => ({
      id: result.place_id.toString(),
      displayName: result.display_name,
      city: result.address?.city || result.address?.town || result.address?.village,
      region: result.address?.state,
      country: result.address?.country || '',
      coordinates: {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
      },
    }));
  } catch (error) {
    console.error('Error searching locations:', error);
    return [];
  }
};

// Reverse geocoding using Nominatim
export const reverseGeocode = async (coordinates: Coordinates): Promise<LocationSuggestion | null> => {
  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/reverse?` +
      `lat=${coordinates.latitude}&` +
      `lon=${coordinates.longitude}&` +
      `format=json&` +
      `addressdetails=1`
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding request failed');
    }

    const result: NominatimSearchResult = await response.json();
    
    return {
      id: result.place_id.toString(),
      displayName: result.display_name,
      city: result.address?.city || result.address?.town || result.address?.village,
      region: result.address?.state,
      country: result.address?.country || '',
      coordinates: {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
      },
    };
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
};

// Get country boundaries for highlighting (simplified approach)
export const getCountryBoundary = async (countryCode: string): Promise<any> => {
  try {
    // Use Nominatim to get country boundary
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?` +
      `country=${encodeURIComponent(countryCode)}&` +
      `format=json&` +
      `polygon_geojson=1&` +
      `limit=1&` +
      `addressdetails=1`
    );

    if (!response.ok) {
      throw new Error('Country boundary request failed');
    }

    const results = await response.json();
    return results[0]?.geojson || null;
  } catch (error) {
    console.error('Error getting country boundary:', error);
    return null;
  }
};

// Sample coordinates for popular travel destinations (fallback)
export const SAMPLE_DESTINATIONS = {
  'Paris, France': { latitude: 48.8566, longitude: 2.3522 },
  'Tokyo, Japan': { latitude: 35.6762, longitude: 139.6503 },
  'New York, USA': { latitude: 40.7128, longitude: -74.0060 },
  'London, UK': { latitude: 51.5074, longitude: -0.1278 },
  'Sydney, Australia': { latitude: -33.8688, longitude: 151.2093 },
  'Rome, Italy': { latitude: 41.9028, longitude: 12.4964 },
  'Barcelona, Spain': { latitude: 41.3851, longitude: 2.1734 },
  'Bangkok, Thailand': { latitude: 13.7563, longitude: 100.5018 },
  'Dubai, UAE': { latitude: 25.2048, longitude: 55.2708 },
  'Rio de Janeiro, Brazil': { latitude: -22.9068, longitude: -43.1729 },
};

// Debounce utility for search
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}; 