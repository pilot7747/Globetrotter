import React from 'react';
import { WebView } from 'react-native-webview';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import type { Location } from '../types';

interface MapViewProps {
  locations: Location[];
  isLoading?: boolean;
  onLocationPress?: (location: Location) => void;
}

const MapViewComponent: React.FC<MapViewProps> = ({ 
  locations, 
  isLoading = false,
  onLocationPress 
}) => {
  // Get unique countries and regions for highlighting
  const visitedCountries = Array.from(new Set(locations.map(loc => loc.country)));
  const visitedRegions = Array.from(new Set(
    locations
      .filter(loc => loc.region && loc.region.trim() !== '')
      .map(loc => `${loc.region}, ${loc.country}`)
  ));

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Globetrotter Map</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
            body { 
                margin: 0; 
                padding: 0; 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: #f8f9fa;
            }
            #map { 
                height: 100vh; 
                width: 100vw; 
            }
            .loading-overlay {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 255, 255, 0.95);
                padding: 24px 32px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                text-align: center;
                z-index: 1000;
                font-weight: 500;
            }
            .custom-legend {
                background: rgba(255, 255, 255, 0.95) !important;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(0,0,0,0.1) !important;
                border-radius: 12px !important;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1) !important;
                padding: 16px !important;
                margin: 16px !important;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                min-width: 180px;
            }
            .legend-title {
                font-size: 16px;
                font-weight: 600;
                color: #1a1a1a;
                margin-bottom: 12px;
            }
            .legend-item {
                display: flex;
                align-items: center;
                gap: 10px;
                margin: 8px 0;
                font-size: 14px;
                color: #666;
            }
            .legend-dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: #007AFF;
            }
            .legend-area {
                width: 16px;
                height: 10px;
                border-radius: 2px;
                background: rgba(0, 122, 255, 0.3);
                border: 1px solid #007AFF;
            }
            .legend-region {
                width: 16px;
                height: 10px;
                border-radius: 2px;
                background: rgba(52, 199, 89, 0.3);
                border: 1px solid #34C759;
            }
            .leaflet-popup-content-wrapper {
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                border: 1px solid rgba(0,0,0,0.1);
            }
            .leaflet-popup-content {
                margin: 16px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            .popup-title {
                margin: 0 0 8px 0;
                color: #007AFF;
                font-size: 16px;
                font-weight: 600;
            }
            .popup-text {
                margin: 4px 0;
                line-height: 1.4;
                color: #333;
                font-size: 14px;
            }
            .popup-date {
                font-weight: 500;
                color: #007AFF;
                background: rgba(0, 122, 255, 0.1);
                padding: 4px 8px;
                border-radius: 6px;
                display: inline-block;
                font-size: 13px;
            }
            .popup-notes {
                font-style: italic;
                color: #666;
                background: #f8f9fa;
                padding: 8px 12px;
                border-radius: 8px;
                margin-top: 8px;
                font-size: 13px;
            }
        </style>
    </head>
    <body>
        ${isLoading ? '<div class="loading-overlay">Loading your travels...</div>' : ''}
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
            try {
                console.log('🚀 WebView JavaScript started!');
                
                // Override console to send messages to React Native
                const originalLog = console.log;
                console.log = function(...args) {
                    originalLog.apply(console, args);
                    if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage('LOG: ' + args.join(' '));
                    }
                };
                
                const originalError = console.error;
                console.error = function(...args) {
                    originalError.apply(console, args);
                    if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage('ERROR: ' + args.join(' '));
                    }
                };
                
                // Initialize the map
                var map = L.map('map', {
                    zoomControl: false,
                    attributionControl: false
                }).setView([20, 0], 2);
                
                // Add map tiles
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '',
                    maxZoom: 18
                }).addTo(map);
                
                // Custom marker icon
                var visitedIcon = L.divIcon({
                    html: '<div style="width: 12px; height: 12px; background: #007AFF; border: 2px solid white; border-radius: 50%; box-shadow: 0 1px 4px rgba(0,122,255,0.3);"></div>',
                    className: 'custom-marker',
                    iconSize: [12, 12],
                    iconAnchor: [6, 6],
                    popupAnchor: [0, -6]
                });
                
                var locations = ${JSON.stringify(locations)};
                var visitedCountries = ${JSON.stringify(visitedCountries)};
                var visitedRegions = ${JSON.stringify(visitedRegions)};
                
                // Debug: log the basic data first
                console.log('=== BASIC DATA DEBUG ===');
                console.log('Locations array:', locations);
                console.log('Locations length:', locations.length);
                console.log('Visited countries:', visitedCountries);
                console.log('Visited regions:', visitedRegions);
                console.log('========================');
                
                // Smart country name normalization
                function normalizeCountryName(name) {
                    if (!name) return '';
                    
                    const normalized = name.toLowerCase().trim();
                    
                    // Common country name mappings
                    const countryMappings = {
                        // Balkan countries
                        'serbia': 'republic of serbia',
                        'republic of serbia': 'serbia',
                        
                        // Major powers
                        'usa': 'united states',
                        'united states': 'united states of america',
                        'united states of america': 'usa',
                        'america': 'united states',
                        
                        'uk': 'united kingdom',
                        'united kingdom': 'britain',
                        'britain': 'united kingdom',
                        'great britain': 'united kingdom',
                        
                        'russia': 'russian federation',
                        'russian federation': 'russia',
                        
                        // European countries
                        'czechia': 'czech republic',
                        'czech republic': 'czechia',
                        
                        // Asian countries
                        'south korea': 'republic of korea',
                        'republic of korea': 'south korea',
                        'north korea': 'democratic people\\'s republic of korea',
                        
                        // Middle East
                        'iran': 'islamic republic of iran',
                        'islamic republic of iran': 'iran',
                        
                        // Africa
                        'congo': 'democratic republic of the congo',
                        'drc': 'democratic republic of the congo',
                        
                        // Others
                        'vatican': 'vatican city',
                        'vatican city': 'holy see',
                    };
                    
                    return countryMappings[normalized] || normalized;
                }
                
                // Check if country names match (with normalization)
                function countriesMatch(name1, name2) {
                    if (!name1 || !name2) return false;
                    
                    const norm1 = normalizeCountryName(name1);
                    const norm2 = normalizeCountryName(name2);
                    
                    // Debug suspicious matches
                    if ((name1.toLowerCase().includes('romania') && name2.toLowerCase().includes('oman')) ||
                        (name2.toLowerCase().includes('romania') && name1.toLowerCase().includes('oman'))) {
                        console.log('🐛 DEBUGGING Romania/Oman:', name1, '<->', name2, 'norm1:', norm1, 'norm2:', norm2);
                    }
                    
                    // Direct match
                    if (norm1 === norm2) return true;
                    
                    // Cross-check both directions
                    if (normalizeCountryName(norm1) === norm2) return true;
                    if (normalizeCountryName(norm2) === norm1) return true;
                    
                    // Check if one contains the other (for cases like "United States" vs "United States of America")
                    // BUT make sure it's not a false positive like Romania containing Oman
                    if (norm1.includes(norm2) && norm2.length >= 4) {
                        // Additional safety check
                        if (norm2 === 'oman' && norm1 === 'romania') return false;
                        return true;
                    }
                    if (norm2.includes(norm1) && norm1.length >= 4) {
                        // Additional safety check  
                        if (norm1 === 'oman' && norm2 === 'romania') return false;
                        return true;
                    }
                    
                    return false;
                }
                
                // Load and highlight visited countries and regions
                async function loadPolygons() {
                    try {
                        console.log('=== DEBUGGING POLYGON LOADING ===');
                        console.log('Visited countries:', visitedCountries);
                        console.log('Visited regions:', visitedRegions);
                        console.log('======================================');
                        
                        // Load countries first
                        const countriesResponse = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
                        
                        if (countriesResponse.ok) {
                            const countriesData = await countriesResponse.json();
                            console.log('Loaded', countriesData.features.length, 'countries');
                            
                            // Debug: look for Serbia specifically in GeoJSON
                            console.log('Looking for Serbia in GeoJSON...');
                            countriesData.features.forEach(function(country, index) {
                                const countryName = country.properties.name || 
                                                  country.properties.ADMIN || 
                                                  country.properties.NAME ||
                                                  country.properties.NAME_EN ||
                                                  country.properties.name_en;
                                if (countryName && countryName.toLowerCase().includes('serb')) {
                                    console.log('Found Serbia-related country:', countryName, 'Properties:', JSON.stringify(country.properties));
                                }
                            });
                            
                            // Debug: show first few country names from GeoJSON
                            console.log('Sample country names from GeoJSON:');
                            for (let i = 0; i < Math.min(5, countriesData.features.length); i++) {
                                const country = countriesData.features[i];
                                const countryName = country.properties.name || 
                                                  country.properties.ADMIN || 
                                                  country.properties.NAME ||
                                                  country.properties.NAME_EN ||
                                                  country.properties.name_en;
                                console.log('  ' + (i+1) + '. ' + countryName);
                            }
                            
                            // Add country polygons for visited countries using fuzzy matching
                            let countriesHighlighted = 0;
                            
                            countriesData.features.forEach(function(country) {
                                // Try different property names for country name
                                const countryName = country.properties.name || 
                                                  country.properties.ADMIN || 
                                                  country.properties.NAME ||
                                                  country.properties.NAME_EN ||
                                                  country.properties.name_en;
                                
                                // Debug: log first few country properties to see the structure
                                if (countriesHighlighted === 0 && countriesData.features.indexOf(country) < 3) {
                                    console.log('Country', countriesData.features.indexOf(country) + 1, 'properties:', JSON.stringify(country.properties));
                                }
                                
                                // Simple exact matching - no fuzzy logic
                                let isVisited = false;
                                for (let visitedCountry of visitedCountries) {
                                    if (countriesMatch(countryName, visitedCountry)) {
                                        isVisited = true;
                                        console.log('✅ Exact match found:', visitedCountry, '<->', countryName);
                                        break;
                                    }
                                }
                                
                                if (isVisited) {
                                    // Style for visited countries
                                    const countryStyle = {
                                        fillColor: '#007AFF',
                                        weight: 2,
                                        opacity: 0.8,
                                        color: '#0051D5',
                                        fillOpacity: 0.2,
                                        interactive: false
                                    };
                                    
                                    // Add the country polygon to the map
                                    L.geoJSON(country, {
                                        style: countryStyle
                                    }).addTo(map);
                                    
                                    console.log('✅ Highlighted country:', countryName);
                                    countriesHighlighted++;
                                }
                            });
                            
                            console.log('Total countries highlighted:', countriesHighlighted);
                        }
                        
                    } catch (error) {
                        console.error('Error loading polygons:', error);
                        console.log('Falling back to basic highlighting');
                        
                        // Fallback: simple circles if GeoJSON fails
                        visitedCountries.forEach(function(country) {
                            const countryLocations = locations.filter(loc => loc.country === country);
                            if (countryLocations.length > 0) {
                                const centerLat = countryLocations.reduce((sum, loc) => sum + loc.coordinates.latitude, 0) / countryLocations.length;
                                const centerLng = countryLocations.reduce((sum, loc) => sum + loc.coordinates.longitude, 0) / countryLocations.length;
                                
                                L.circle([centerLat, centerLng], {
                                    color: '#007AFF',
                                    fillColor: '#007AFF',
                                    fillOpacity: 0.15,
                                    radius: 150000,
                                    weight: 2,
                                    opacity: 0.6
                                }).addTo(map);
                            }
                        });
                    }
                }
                
                // Add markers for visited locations
                locations.forEach(function(location) {
                    var marker = L.marker([location.coordinates.latitude, location.coordinates.longitude], {
                        icon: visitedIcon
                    }).addTo(map);
                    
                    var popupContent = '<div>' +
                        '<h3 class="popup-title">' + (location.city ? location.city + ', ' + location.country : location.country) + '</h3>';
                    
                    if (location.region) {
                        popupContent += '<p class="popup-text">' + location.region + '</p>';
                    }
                    
                    popupContent += '<div class="popup-date">' + 
                        new Date(location.visitDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                        }) + '</div>';
                    
                    if (location.notes) {
                        popupContent += '<div class="popup-notes">' + location.notes + '</div>';
                    }
                    
                    popupContent += '</div>';
                    
                    marker.bindPopup(popupContent, {
                        maxWidth: 260,
                        className: 'custom-popup-wrapper'
                    });
                });
                
                // Fit map to show all locations
                if (locations.length > 0) {
                    if (locations.length === 1) {
                        map.setView([locations[0].coordinates.latitude, locations[0].coordinates.longitude], 8);
                    } else {
                        var group = new L.featureGroup(locations.map(function(location) {
                            return L.marker([location.coordinates.latitude, location.coordinates.longitude]);
                        }));
                        map.fitBounds(group.getBounds().pad(0.1));
                    }
                }
                
                // Add legend
                var legend = L.control({position: 'topleft'});
                legend.onAdd = function (map) {
                    var div = L.DomUtil.create('div', 'custom-legend');
                    var legendContent = 
                        '<div class="legend-title">Your Journey</div>' +
                        '<div class="legend-item">' +
                            '<span class="legend-dot"></span>' +
                            '<span>Visited Places (' + locations.length + ')</span>' +
                        '</div>' +
                        '<div class="legend-item">' +
                            '<span class="legend-area"></span>' +
                            '<span>Countries (' + visitedCountries.length + ')</span>' +
                        '</div>';
                    
                    if (visitedRegions.length > 0) {
                        legendContent += 
                            '<div class="legend-item">' +
                                '<span class="legend-region"></span>' +
                                '<span>Regions (' + visitedRegions.length + ')</span>' +
                            '</div>';
                    }
                    
                    div.innerHTML = legendContent;
                    return div;
                };
                legend.addTo(map);
                
                // Add zoom control
                L.control.zoom({
                    position: 'topright'
                }).addTo(map);
                
                // Load polygons
                loadPolygons();
                
                console.log('Map loaded with', locations.length, 'locations');

                console.log('🔧 Country normalization functions loaded successfully!');
            } catch (error) {
                console.error('Error in WebView script initialization:', error);
                console.error('Error stack:', error.stack);
            }
        </script>
    </body>
    </html>
  `;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: mapHtml }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        onError={(error) => console.error('WebView error:', error)}
        onLoad={() => console.log('Map WebView loaded')}
        onMessage={(event) => {
          console.log('WebView:', event.nativeEvent.data);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});

export default MapViewComponent; 