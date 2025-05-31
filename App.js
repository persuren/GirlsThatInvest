import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NotificationProvider } from './app/screens/NotificationContext';
import HomeScreen from './app/screens/HomeScreen';
import StockDetail from './app/screens/StockDetail';
import BottomNav from './app/components/BottomNav';

const Stack = createNativeStackNavigator();

function AppContent() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="StockDetail" 
          component={StockDetail} 
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
} 
