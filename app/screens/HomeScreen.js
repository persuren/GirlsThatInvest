import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen({ navigation }) {
  const [stockData, setStockData] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredStocks, setFilteredStocks] = useState([]);

  useEffect(() => {
    fetch("http://10.0.2.2:5001/fetch_data")
      .then((response) => response.json())
      .then((data) => {
        setStockData(data.data);
        setFilteredStocks(data.data); // Başlangıçta tüm verileri göster
      })
      .catch((error) => Alert.alert("Veri çekme hatası", error.message));
  }, []);
  const getLatestStockData = () => {
    const latestData = {};
    stockData.forEach((item) => {
      if (!latestData[item.symbol] || item.timestamp > latestData[item.symbol].timestamp) {
        latestData[item.symbol] = item;
      }
    });
    return Object.values(latestData);
  };
  const latestStockData = getLatestStockData();

  const handleSearch = (text) => {
    setSearch(text);
    if (text === "") {
      setFilteredStocks(latestStockData);
    } else {
      const filtered = latestStockData.filter((stock) =>
        stock.symbol.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredStocks(filtered);
    }
  };

  return (
    <View style={styles.container}>
      {/* Üst Menü */}
      <View style={styles.header}>
        <Ionicons name="information-circle-outline" size={24} color="#d63384" />
        <TextInput
          style={styles.searchInput}
          placeholder="Hisse ara..."
          value={search}
          onChangeText={handleSearch}
        />
        <Ionicons name="options-outline" size={24} color="#d63384" />
        <Ionicons name="heart-outline" size={24} color="#d63384" />
      </View>

      {/* Hisse Senedi Listesi */}
      <FlatList
        data={filteredStocks} // filteredStocks'u kullan
        keyExtractor={(item) => item.symbol}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate("StockDetail", { stock: item })}
            style={styles.stockItem}
          >
            <Image
              source={{ uri: item.logo }}
              style={styles.stockLogo}
            />
            <View style={styles.stockInfo}>
              <Text style={styles.stockSymbol}>{item.symbol}</Text>
              <Text style={styles.stockPrice}>
                ${item.price && item.price.toFixed(2)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: "#f6bfe0",
    padding: 10,
    },
    header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    },
    searchInput: {
    backgroundColor: "#fff",
    flex: 1,
    marginHorizontal: 10,
    padding: 8,
    borderRadius: 8,
    },
    stockItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    elevation: 3, // Android'de gölge
    shadowColor: "#000", // iOS'ta gölge
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    },
    stockLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    },
    stockInfo: {
    flex: 1,
    },
    stockSymbol: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    },
    stockPrice: {
    fontSize: 16,
    color: "#333",
    },
    });
