import React, { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import StockDetailScreen from "./screens/StockDetailScreen";
import FavoritesScreen from "./screens/FavoritesScreen";
import { FavoritesProvider } from "./screens/FavoritesContext";
import { View, StyleSheet } from "react-native";
import RegisterScreen from "./screens/RegisterScreen";
import { NavigationContainer } from "@react-navigation/native";
import BottomNav from "./screens/BottomNav";
const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // Wrapper components for navigation
  function HomeScreenWithNav(props) {
    return <HomeScreen {...props} BottomNavComponent={<BottomNav navigation={props.navigation} active="Home" onLogout={handleLogout} />} />;
  }
  function FavoritesScreenWithNav(props) {
    return <FavoritesScreen {...props} BottomNavComponent={<BottomNav navigation={props.navigation} active="Favorites" onLogout={handleLogout} />} />;
  }
  function StockDetailScreenWithNav(props) {
    return <StockDetailScreen {...props} BottomNavComponent={<BottomNav navigation={props.navigation} active={null} onLogout={handleLogout} />} />;
  }

  if (!isLoggedIn) {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login">
            {props => <LoginScreen {...props} onLogin={handleLogin} />}
          </Stack.Screen>
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
  }

  return (
    <FavoritesProvider>
      <View style={styles.container}>
        <Stack.Navigator
          screenOptions={{
            headerTitle: "",
            headerBackTitleVisible: false,
            headerShown: false
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreenWithNav}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="StockDetail"
            component={StockDetailScreenWithNav}
            options={{ title: "" }}
          />
          <Stack.Screen
            name="Favorites"
            component={FavoritesScreenWithNav}
            options={{ title: "Favorites" }}
          />
        </Stack.Navigator>
      </View>
    </FavoritesProvider>
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
