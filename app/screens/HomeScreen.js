import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  StyleSheet,
  Modal,
  Pressable
} from "react-native";
import { WebView } from 'react-native-webview';
import { Ionicons } from "@expo/vector-icons";
import { useFavorites } from "./FavoritesContext";
import { stockLogos } from "../logos"; 

export default function HomeScreen({ navigation, BottomNavComponent }) {
  const [stockData, setStockData] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredStocks, setFilteredStocks] = useState([]);
  const { favorites, toggleFavorite } = useFavorites();
  const [chartType, setChartType] = useState("minute"); // "minute" veya "hour"
  const [showChartOptions, setShowChartOptions] = useState(false);
  const testLogo = "https://upload.wikimedia.org/wikipedia/commons/1/1e/React_Logo.png";

  const fetchStockDataWithPolling = async () => {
    try {
      console.log("Veri çekme işlemi başlıyor...");
      const startResponse = await fetch("http://10.0.2.2:5001/fetch_data");
      if (!startResponse.ok) throw new Error(`Başlatma başarısız: ${startResponse.status}`);

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
            const stocksWithLogos = result.data.map((stock) => {
              const symbolUpper = stock.symbol.toUpperCase();
              const logo = stockLogos[symbolUpper];
              return { ...stock, logo };
            });

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
      if (!dataFetched) console.error("Maksimum deneme sayısına ulaşıldı, veri çekilemedi.");
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

  const handleChartTypeChange = (type) => {
    setChartType(type);
    setShowChartOptions(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="information-circle-outline" size={24} color="#d63384" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={search}
          onChangeText={handleSearch}
        />
        <TouchableOpacity onPress={() => setShowChartOptions(true)}>
          <Ionicons name="options-outline" size={24} color="#d63384" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Favorites")}> 
          <Ionicons name="heart-outline" size={24} color="#d63384" />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showChartOptions}
        onRequestClose={() => setShowChartOptions(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Grafik Seçenekleri</Text>
            <TouchableOpacity
              style={[styles.optionButton, chartType === "minute" && styles.selectedOption]}
              onPress={() => handleChartTypeChange("minute")}
            >
              <Text style={styles.optionText}>Dakikalık Veriler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, chartType === "hour" && styles.selectedOption]}
              onPress={() => handleChartTypeChange("hour")}
            >
              <Text style={styles.optionText}>Saatlik Veriler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowChartOptions(false)}
            >
              <Text style={styles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FlatList
        data={filteredStocks}
        keyExtractor={(item) => item.symbol}
        renderItem={({ item }) => {
          const symbolUpper = item.symbol.toUpperCase();
          const logo = stockLogos[symbolUpper];
          return (
            <TouchableOpacity
              onPress={() => navigation.navigate("StockDetail", { stock: item, chartType })}
              style={styles.stockItem}
            >
              {logo ? (
                <View style={styles.stockLogo}>
                  <Image
                    source={logo}
                    style={{ width: 48, height: 48, resizeMode: 'contain' }}
                  />
                </View>
              ) : (
                <View style={styles.stockLogoPlaceholder}>
                  <Text style={styles.logoText}>No Logo</Text>
                </View>
              )}
              <View style={styles.stockInfoRow}>
                <View style={styles.stockInfo}>
                  <Text style={styles.stockSymbol}>{item.symbol}</Text>
                  <Text style={styles.stockPrice}>${item.price ? item.price : "N/A"}</Text>
                </View>
                <Ionicons 
                  name={item.adj_close > item.open ? "arrow-up-outline" : "arrow-down-outline"} 
                  size={28} 
                  color={item.adj_close > item.open ? "green" : "red"} 
                  style={styles.arrowIcon} 
                />
              </View>
              <TouchableOpacity onPress={() => toggleFavorite(item.symbol, item)} style={styles.heartContainer}>
                <Ionicons 
                  name={favorites[item.symbol] ? "heart" : "heart-outline"} 
                  size={24} 
                  color={favorites[item.symbol] ? "red" : "#d63384"} 
                />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
      />
      {BottomNavComponent}
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
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockLogoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    backgroundColor: "#ffc0cb",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d63384",
  },
  logoText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
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
  stockInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  arrowIcon: {
    marginLeft: 8,
  },
  heartContainer: {
    padding: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#d63384',
  },
  optionButton: {
    backgroundColor: '#f6bfe0',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#d63384',
  },
  optionText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#ffc0cb',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
