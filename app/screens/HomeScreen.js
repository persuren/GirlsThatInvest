import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen({ navigation }) {
  const [stockData, setStockData] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredStocks, setFilteredStocks] = useState([]);

  const fetchStockDataWithPolling = async () => {
    try {
      console.log("Veri çekme işlemi başlıyor...");

      const startResponse = await fetch("http://10.0.2.2:5001/fetch_data");

      if (!startResponse.ok) {
        throw new Error(`Başlatma başarısız: ${startResponse.status}`);
      }

      let attempts = 0;
      const maxAttempts = 10; // Maksimum 10 tekrar dene
      let dataFetched = false;

      while (attempts < maxAttempts && !dataFetched) {
        console.log(`Deneme ${attempts + 1}: Veriler çekilmeye çalışılıyor...`);

        await new Promise((resolve) => setTimeout(resolve, 3000)); // 3 saniye bekle

        try {
          const response = await fetch("http://10.0.2.2:5001/get_stock_data");

          if (!response.ok) {
            console.warn(`Yanıt başarısız: ${response.status}`);
            continue; // Sonraki denemeye geç
          }

          const result = await response.json();

          if (Array.isArray(result.data) && result.data.length > 0) {
            console.log("Veriler başarıyla çekildi!");
            setStockData(result.data);
            setFilteredStocks(result.data);
            dataFetched = true;
          } else {
            console.warn("Veri henüz hazır değil, tekrar denenecek...");
          }
        } catch (fetchError) {
          console.error("Veri çekme hatası:", fetchError);
        }

        attempts++;
      }

      if (!dataFetched) {
        console.error("Maksimum deneme sayısına ulaşıldı, veri çekilemedi.");
      }
    } catch (error) {
      console.log("API hatası:", error);
    }
  };

  useEffect(() => {
    fetchStockDataWithPolling();
  }, []); // ❌ getLatestStockData kaldırıldı, sadece fetchStockDataWithPolling çağırılıyor

  const handleSearch = (text) => {
    setSearch(text);
    if (text === "") {
      setFilteredStocks(stockData);
    } else {
      const filtered = stockData.filter((stock) =>
        stock.symbol.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredStocks(filtered);
    }
  };

  return (
    <View style={styles.container}>
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
                ${item.price ? item.price : "N/A"}
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
