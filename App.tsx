import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import screens
import MapScreen from './src/screens/MapScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AddLocationScreen from './src/screens/AddLocationScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Custom theme matching our new design
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#007AFF',
    primaryContainer: '#E3F2FD',
    secondary: '#5AC8FA',
    surface: '#FFFFFF',
    background: '#F8F9FA',
    onBackground: '#1A1A1A',
    onSurface: '#1A1A1A',
  },
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Map') {
            iconName = 'map';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Icon name={iconName || 'map'} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: 88,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: '700',
          color: '#1A1A1A',
        },
        headerTintColor: '#007AFF',
      })}
    >
      <Tab.Screen 
        name="Map" 
        component={MapScreen} 
        options={{ 
          title: 'Map',
          headerTitle: 'Globetrotter'
        }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          title: 'Profile',
          headerTitle: 'Your Journey'
        }} 
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <StatusBar style="dark" backgroundColor="#FFFFFF" />
          <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: '#FFFFFF',
                elevation: 0,
                shadowOpacity: 0,
                borderBottomWidth: 0,
              },
              headerTitleStyle: {
                fontSize: 20,
                fontWeight: '700',
                color: '#1A1A1A',
              },
              headerTintColor: '#007AFF',
              cardStyle: {
                backgroundColor: '#F8F9FA',
              },
            }}
          >
            <Stack.Screen 
              name="Tabs" 
              component={TabNavigator} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="AddLocation" 
              component={AddLocationScreen} 
              options={{ 
                title: 'Add New Visit',
                presentation: 'modal',
                headerStyle: {
                  backgroundColor: '#FFFFFF',
                  elevation: 4,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                },
              }} 
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
