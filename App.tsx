import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Assuming your screens are in these paths
import MainScreen from './screens/MainScreen'; 
import PrepScreen from './screens/PrepScreen'; // The new Nightly Routine screen
import ProfileScreen from './screens/ProfileScreen'; // Placeholder or actual profile

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: styles.tabBar,
          // Morning Tab gets Electric Cyan, Night Tab gets Cobalt Blue
          tabBarActiveTintColor: route.name === 'Prep' ? '#60a5fa' : '#00E5FF',
          tabBarInactiveTintColor: '#475569',
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: any;

            if (route.name === 'Rise') {
              iconName = focused ? 'sunny' : 'sunny-outline';
            } else if (route.name === 'Prep') {
              iconName = focused ? 'moon' : 'moon-outline';
            } else if (route.name === 'Personal') {
                iconName = focused ? 'walk' : 'walk-outline'; 
              }

            return <Ionicons name={iconName} size={22} color={color} />;
          },
        })}
      >
        <Tab.Screen 
          name="Rise" 
          component={MainScreen} 
          options={{ tabBarLabel: 'Rise' }}
        />
        <Tab.Screen 
          name="Prep" 
          component={PrepScreen} 
          options={{ tabBarLabel: 'Prep' }}
        />
        <Tab.Screen 
          name="Personal" 
          component={ProfileScreen} 
          options={{ tabBarLabel: 'Personal' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0f172a', // Matches your Dark Mode foundation
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    height: 85, // Extra height for Material 3 feel
    paddingBottom: 25,
    paddingTop: 10,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: -4,
  },
});