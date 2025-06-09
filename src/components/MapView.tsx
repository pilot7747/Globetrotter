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
                    html: '<div style="width: 20px; height: 20px; background: #007AFF; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,122,255,0.4);"></div>',
                    className: 'custom-marker',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10],
                    popupAnchor: [0, -10]
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
                                    if (countryName === visitedCountry || 
                                        countryName === visitedCountry.trim() ||
                                        visitedCountry === countryName.trim()) {
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
                        
                        // Load regions/states/provinces if we have any visited regions
                        if (visitedRegions.length > 0) {
                            console.log('Loading admin-1 boundaries for regions...');
                            
                            // Use working admin-1 data sources that actually exist
                            const admin1Sources = [
                                'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_1_states_provinces_shp.geojson', // geojson.xyz confirmed working
                                'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces_shp.geojson' // Natural Earth direct
                            ];
                            
                            for (let sourceUrl of admin1Sources) {
                                try {
                                    console.log('Trying admin-1 source:', sourceUrl);
                                    const admin1Response = await fetch(sourceUrl);
                                    
                                    if (admin1Response.ok) {
                                        const admin1Data = await admin1Response.json();
                                        console.log('✅ Loaded', admin1Data.features.length, 'admin-1 regions from', sourceUrl);
                                        
                                        // Debug: log first few features to understand structure
                                        if (admin1Data.features.length > 0) {
                                            console.log('Sample admin-1 feature properties:', admin1Data.features[0].properties);
                                        }
                                        
                                        let regionsHighlighted = 0;
                                        
                                        // Process visited regions
                                        admin1Data.features.forEach(function(region) {
                                            // Try multiple property names for region name
                                            const regionName = region.properties.name || 
                                                             region.properties.NAME || 
                                                             region.properties.NAME_1 || 
                                                             region.properties.name_en ||
                                                             region.properties.NAME_EN;
                                            
                                            // Try multiple property names for country
                                            const countryName = region.properties.admin || 
                                                              region.properties.ADMIN || 
                                                              region.properties.NAME_0 ||
                                                              region.properties.admin_0 ||
                                                              region.properties.country;
                                            
                                            if (regionName && countryName && isRegionVisited(regionName, countryName)) {
                                                // Style for visited regions (different color than countries)
                                                const regionStyle = {
                                                    fillColor: '#34C759',
                                                    weight: 2,
                                                    opacity: 0.8,
                                                    color: '#28A745',
                                                    fillOpacity: 0.25,
                                                    interactive: false
                                                };
                                                
                                                // Add the region polygon to the map
                                                L.geoJSON(region, {
                                                    style: regionStyle
                                                }).addTo(map);
                                                
                                                console.log('✅ Highlighted region:', regionName + ', ' + countryName);
                                                regionsHighlighted++;
                                            }
                                        });
                                        
                                        console.log('Total regions highlighted:', regionsHighlighted);
                                        
                                        if (regionsHighlighted > 0) {
                                            break; // Successfully highlighted regions, no need to try other sources
                                        }
                                    }
                                } catch (error) {
                                    console.log('Failed to load from', sourceUrl, '- trying next source');
                                    console.error(error);
                                }
                            }
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