export interface Location {
  id: string;
  country: string;
  region?: string;
  city?: string;
  visitDate: Date;
  notes?: string;
  photoUri?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  visitedLocations: Location[];
  totalCountries: number;
  totalCities: number;
}

export type RootStackParamList = {
  Map: undefined;
  Profile: undefined;
  AddLocation: undefined;
  LocationDetails: { locationId: string };
}; 