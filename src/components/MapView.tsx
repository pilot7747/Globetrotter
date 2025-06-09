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
  // Get unique countries for highlighting
  const visitedCountries = Array.from(new Set(locations.map(loc => loc.country)));

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
            
            // Country name mappings for the API
            var countryMappings = {
                'United States': 'United States of America',
                'UK': 'United Kingdom',
                'United Kingdom': 'United Kingdom'
            };
            
            // Function to get proper country name for API
            function getCountryName(country) {
                return countryMappings[country] || country;
            }
            
            // Load and highlight visited countries
            async function loadCountryPolygons() {
                for (let country of visitedCountries) {
                    try {
                        const countryName = getCountryName(country);
                        const response = await fetch(\`https://restcountries.com/v3.1/name/\${encodeURIComponent(countryName)}?fullText=true\`);
                        
                        if (response.ok) {
                            const countryData = await response.json();
                            if (countryData[0] && countryData[0].latlng) {
                                // For now, add a circle around the country center as a placeholder
                                // Real country borders would require a different GeoJSON API
                                const [lat, lng] = countryData[0].latlng;
                                
                                L.circle([lat, lng], {
                                    color: '#007AFF',
                                    fillColor: '#007AFF',
                                    fillOpacity: 0.15,
                                    radius: 200000, // 200km radius
                                    weight: 2,
                                    opacity: 0.6
                                }).addTo(map);
                            }
                        }
                    } catch (error) {
                        console.log('Could not load country data for:', country);
                    }
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
                div.innerHTML = 
                    '<div class="legend-title">Your Journey</div>' +
                    '<div class="legend-item">' +
                        '<span class="legend-dot"></span>' +
                        '<span>Visited Places (' + locations.length + ')</span>' +
                    '</div>' +
                    '<div class="legend-item">' +
                        '<span class="legend-area"></span>' +
                        '<span>Countries (' + visitedCountries.length + ')</span>' +
                    '</div>';
                return div;
            };
            legend.addTo(map);
            
            // Add zoom control
            L.control.zoom({
                position: 'topright'
            }).addTo(map);
            
            // Load country polygons
            loadCountryPolygons();
            
            console.log('Map loaded with', locations.length, 'locations');
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