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
                border-radius: 0;
            }
            .loading-overlay {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 255, 255, 0.95);
                padding: 24px 32px;
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                text-align: center;
                z-index: 1000;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.2);
            }
            .custom-legend {
                background: rgba(255, 255, 255, 0.95) !important;
                backdrop-filter: blur(20px);
                border: none !important;
                border-radius: 16px !important;
                box-shadow: 0 8px 32px rgba(0,0,0,0.1) !important;
                padding: 16px !important;
                margin: 16px !important;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            }
            .legend-title {
                font-size: 16px;
                font-weight: 600;
                color: #1a1a1a;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .legend-item {
                display: flex;
                align-items: center;
                gap: 8px;
                margin: 8px 0;
                font-size: 14px;
                color: #666;
            }
            .legend-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                display: inline-block;
            }
            .legend-area {
                width: 16px;
                height: 12px;
                border-radius: 4px;
                display: inline-block;
                opacity: 0.6;
            }
            .leaflet-popup-content-wrapper {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.15);
                border: 1px solid rgba(255,255,255,0.2);
            }
            .leaflet-popup-content {
                margin: 16px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            .leaflet-popup-tip {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
            }
            .custom-popup h3 {
                margin: 0 0 8px 0;
                color: #007AFF;
                font-size: 18px;
                font-weight: 600;
            }
            .custom-popup p {
                margin: 6px 0;
                line-height: 1.4;
            }
            .custom-popup .date {
                font-weight: 600;
                color: #333;
                background: #f0f8ff;
                padding: 4px 8px;
                border-radius: 8px;
                display: inline-block;
            }
            .custom-popup .notes {
                font-style: italic;
                color: #555;
                background: #f8f9fa;
                padding: 8px 12px;
                border-radius: 8px;
                border-left: 3px solid #007AFF;
                margin-top: 8px;
            }
        </style>
    </head>
    <body>
        ${isLoading ? '<div class="loading-overlay">🌍 Loading your travels...</div>' : ''}
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
            // Initialize the map with better styling
            var map = L.map('map', {
                zoomControl: false,
                attributionControl: false
            }).setView([20, 0], 2);
            
            // Add modern map tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap',
                maxZoom: 19,
                className: 'map-tiles'
            }).addTo(map);
            
            // Custom beautiful pin icon
            var visitedIcon = L.divIcon({
                html: \`<div style="
                    width: 24px;
                    height: 24px;
                    background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%);
                    border: 3px solid white;
                    border-radius: 50%;
                    box-shadow: 0 4px 12px rgba(0,122,255,0.4);
                    position: relative;
                ">
                    <div style="
                        width: 6px;
                        height: 6px;
                        background: white;
                        border-radius: 50%;
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                    "></div>
                </div>\`,
                className: 'custom-marker',
                iconSize: [24, 24],
                iconAnchor: [12, 12],
                popupAnchor: [0, -12]
            });
            
            var locations = ${JSON.stringify(locations)};
            var visitedCountries = ${JSON.stringify(visitedCountries)};
            
            // Country boundaries for highlighting (simplified - using approximate boundaries)
            var countryBounds = {
                'Germany': [[47.2701, 5.8663], [55.0583, 15.0419]],
                'France': [[41.3333, -5.1386], [51.1241, 9.5625]],
                'United Kingdom': [[49.9599, -8.1821], [60.8448, 1.7676]],
                'Spain': [[35.9929, -9.3015], [43.7484, 4.3280]],
                'Italy': [[35.4929, 6.6267], [47.0921, 18.7975]],
                'United States': [[24.3963, -125.0], [49.3457, -66.9513]],
                'Japan': [[24.0000, 122.0000], [46.0000, 146.0000]],
                'Australia': [[-44.0000, 112.0000], [-10.0000, 154.0000]],
                'Brazil': [[-33.7683, -73.9830], [5.2717, -28.6341]],
                'Canada': [[41.6765, -141.0000], [83.1139, -52.6480]]
            };
            
            // Add country highlighting
            visitedCountries.forEach(function(country) {
                var bounds = countryBounds[country];
                if (bounds) {
                    var rectangle = L.rectangle(bounds, {
                        color: '#007AFF',
                        weight: 2,
                        opacity: 0.6,
                        fillColor: '#007AFF',
                        fillOpacity: 0.15,
                        interactive: false
                    }).addTo(map);
                }
            });
            
            // Add markers for visited locations
            locations.forEach(function(location) {
                var marker = L.marker([location.coordinates.latitude, location.coordinates.longitude], {
                    icon: visitedIcon
                }).addTo(map);
                
                var popupContent = '<div class="custom-popup">' +
                    '<h3>🏙️ ' + (location.city ? location.city + ', ' + location.country : location.country) + '</h3>';
                
                if (location.region) {
                    popupContent += '<p style="color: #666; margin-bottom: 8px;">📍 ' + location.region + '</p>';
                }
                
                popupContent += '<p class="date">📅 ' + new Date(location.visitDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                }) + '</p>';
                
                if (location.notes) {
                    popupContent += '<div class="notes">💭 ' + location.notes + '</div>';
                }
                
                popupContent += '</div>';
                
                marker.bindPopup(popupContent, {
                    maxWidth: 280,
                    className: 'custom-popup-wrapper'
                });
            });
            
            // Fit map to show all locations if any exist
            if (locations.length > 0) {
                var group = new L.featureGroup(locations.map(function(location) {
                    return L.marker([location.coordinates.latitude, location.coordinates.longitude]);
                }));
                
                if (locations.length === 1) {
                    map.setView([locations[0].coordinates.latitude, locations[0].coordinates.longitude], 10);
                } else {
                    map.fitBounds(group.getBounds().pad(0.1));
                }
            }
            
            // Add modern legend in top-left (away from FAB)
            var legend = L.control({position: 'topleft'});
            legend.onAdd = function (map) {
                var div = L.DomUtil.create('div', 'custom-legend');
                div.innerHTML = 
                    \`<div class="legend-title">🌍 Your Journey</div>\` +
                    \`<div class="legend-item">
                        <span class="legend-dot" style="background: linear-gradient(135deg, #007AFF, #0051D5);"></span>
                        <span>Visited Places (\${locations.length})</span>
                    </div>\` +
                    \`<div class="legend-item">
                        <span class="legend-area" style="background: #007AFF;"></span>
                        <span>Explored Countries (\${visitedCountries.length})</span>
                    </div>\`;
                return div;
            };
            legend.addTo(map);
            
            // Add modern zoom control in top-right
            L.control.zoom({
                position: 'topright'
            }).addTo(map);
            
            // Add attribution in bottom-left
            L.control.attribution({
                position: 'bottomleft',
                prefix: false
            }).addTo(map);
            
            console.log('Modern map loaded with', locations.length, 'locations');
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