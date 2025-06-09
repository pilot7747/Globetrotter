import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Import screens
import MapScreen from './src/screens/MapScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AddLocationScreen from './src/screens/AddLocationScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MapStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MapMain" 
        component={MapScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddLocation" 
        component={AddLocationScreen}
        options={{
          title: 'Add New Location',
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTintColor: '#000000',
          headerShadowVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              tabBarStyle: {
                backgroundColor: '#ffffff',
                borderTopWidth: 0,
                elevation: 10,
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: -3 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              },
              tabBarActiveTintColor: '#2196F3',
              tabBarInactiveTintColor: '#757575',
              headerStyle: {
                backgroundColor: '#ffffff',
                elevation: 0,
                shadowOpacity: 0,
                borderBottomWidth: 0,
              },
              headerTitleStyle: {
                fontWeight: 'bold',
                color: '#000000',
              },
            }}
          >
            <Tab.Screen
              name="Map"
              component={MapStack}
              options={{
                headerShown: false,
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="map" color={color} size={size} />
                ),
              }}
            />
            <Tab.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="account" color={color} size={size} />
                ),
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
