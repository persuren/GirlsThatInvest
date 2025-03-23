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
  const testLogo = "https://upload.wikimedia.org/wikipedia/commons/1/1e/React_Logo.png";

  const fetchStockLogo = async (symbol) => {
    try {
      const response = await fetch(`http://10.0.2.2:5001/get_stock_logo/${symbol}`);
      const data = await response.json();
      return data.logo || null;
    } catch (error) {
      console.error("Logo alınamadı:", error);
      return null;
    }
  };

  const fetchStockDataWithPolling = async () => {
    try {
      console.log("Veri çekme işlemi başlıyor...");

      const startResponse = await fetch("http://10.0.2.2:5001/fetch_data");

      if (!startResponse.ok) {
        throw new Error(`Başlatma başarısız: ${startResponse.status}`);
      }

      let attempts = 0;
      const maxAttempts = 10;
      let dataFetched = false;

      while (attempts < maxAttempts && !dataFetched) {
        console.log(`Deneme ${attempts + 1}: Veriler çekilmeye çalışılıyor...`);

        await new Promise((resolve) => setTimeout(resolve, 3000));

        try {
          const response = await fetch("http://10.0.2.2:5001/get_stock_data");

          if (!response.ok) {
            console.warn(`Yanıt başarısız: ${response.status}`);
            continue;
          }

          const result = await response.json();

          if (Array.isArray(result.data) && result.data.length > 0) {
            console.log("Veriler başarıyla çekildi!");

            const stocksWithLogos = await Promise.all(
              result.data.map(async (stock) => {
                const logoUrl = await fetchStockLogo(stock.symbol);
                return { ...stock, logo: logoUrl };
              })
            );

            setStockData(stocksWithLogos);
            setFilteredStocks(stocksWithLogos);
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
  }, []);

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
        data={filteredStocks}
        keyExtractor={(item) => item.symbol}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate("StockDetail", { stock: item })}
            style={styles.stockItem}
          >
            {item.logo ? (
              <Image
              source={{ uri: item.logo }}
              style={styles.stockLogo}
              resizeMode="contain"
              onError={(error) => {
                  console.log('Logo yükleme hatası:', error.nativeEvent.error);
                  fetch(item.logo)
                      .then(response => console.log('Content-Type:', response.headers.get('Content-Type')))
                      .catch(fetchError => console.log('Fetch hatası:', fetchError));
              }}
              onLoad={() => console.log('Logo yüklendi')}
          />
            ) : (
              <View style={styles.stockLogoPlaceholder}>
                <Text style={styles.logoText}>Logo Yok</Text>
              </View>
            )}

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
    fontWeight: 'bold',
    fontFamily: 'georgia',
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
    elevation: 3,
    shadowColor: "#000",
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
  stockLogoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: "#ffc0cb",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1, // Placeholder için kenarlık ekledim
    borderColor: "#d63384", // Kenarlık rengi
  },
  logoText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold", // Metni daha belirgin yapmak için ekledim
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
