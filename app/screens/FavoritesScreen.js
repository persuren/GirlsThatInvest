import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useFavorites } from "./FavoritesContext";
import { Ionicons } from "@expo/vector-icons";
import BottomNav from "./BottomNav";

export default function FavoritesScreen({ navigation, BottomNavComponent }) {
  const { favorites, toggleFavorite } = useFavorites();
  const favoriteStocks = Object.values(favorites);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Favorites</Text>
        {favoriteStocks.length === 0 ? (
          <Text style={styles.empty}>No favorites have been added yet.</Text>
        ) : (
          <FlatList
            data={favoriteStocks}
            keyExtractor={(item) => item.symbol}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.stockItem}
                onPress={() => navigation.navigate("StockDetail", { stock: item })}
              >
                <Text style={styles.stockSymbol}>{item.symbol}</Text>
                <Text style={styles.stockPrice}>${item.price ? item.price : "N/A"}</Text>
                <TouchableOpacity onPress={() => toggleFavorite(item.symbol, item)}>
                  <Ionicons name="heart" size={24} color="red" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
      {BottomNavComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffe6f0",
    padding: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ff1493",
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "georgia",
  },
  empty: {
    textAlign: "center",
    color: "#888",
    marginTop: 40,
    fontSize: 18,
  },
  stockItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    justifyContent: "space-between",
  },
  stockSymbol: {
    fontSize: 18,
    fontWeight: "bold",
  },
  stockPrice: {
    fontSize: 16,
    color: "#333",
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff0f5',
    borderTopWidth: 1,
    borderColor: '#ffb6d5',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    flexDirection: 'column',
  },
  activeNavButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#ff1493',
  },
  navText: {
    color: '#ff1493',
    fontSize: 14,
    marginTop: 2,
    fontFamily: 'georgia',
  },
}); 
