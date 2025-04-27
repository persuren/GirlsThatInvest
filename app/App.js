import React, { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import StockDetailScreen from "./screens/StockDetailScreen";
import { View, Text, Image, StyleSheet, ActivityIndicator } from "react-native";
const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <View style={styles.container}>
      <Stack.Navigator
        screenOptions={{
          headerTitle: "", 
          headerBackTitleVisible: false, 
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }} gizle
        />
        <Stack.Screen 
          name="StockDetail" 
          component={StockDetailScreen} 
          options={{ title: "" }} 
        />
      </Stack.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ff1493",
    padding: 0,
    fontFamily: "georgia",
    textAlign: "center",
  },
});
