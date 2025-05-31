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
  Pressable,
  Alert
} from "react-native";
import { WebView } from 'react-native-webview';
import { Ionicons } from "@expo/vector-icons";
import { useFavorites } from "./FavoritesContext";
import { stockLogos } from "../logos"; 
import { useNotifications } from './NotificationContext';

export default function HomeScreen({ navigation, BottomNavComponent }) {
  const [stockData, setStockData] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredStocks, setFilteredStocks] = useState([]);
  const { favorites, toggleFavorite } = useFavorites();
  const [chartType, setChartType] = useState("minute"); // "minute" veya "hour"
  const [showChartOptions, setShowChartOptions] = useState(false);
  const [sortOrder, setSortOrder] = useState(null); // null, 'asc', 'desc'
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [sortBy, setSortBy] = useState('symbol'); // 'symbol' veya 'price'
  const testLogo = "https://upload.wikimedia.org/wikipedia/commons/1/1e/React_Logo.png";
  
  const notifications = useNotifications();
  const { addStockAlert, removeStockAlert, stockAlerts, checkPriceAlerts } = notifications || {};

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [alertPrice, setAlertPrice] = useState('');
  const [alertType, setAlertType] = useState(null);

  const handleSort = (order, by) => {
    setSortOrder(order);
    setSortBy(by);
    setShowSortOptions(false);
    const sortedStocks = [...filteredStocks].sort((a, b) => {
      if (by === 'symbol') {
        if (order === 'asc') {
          return a.symbol.localeCompare(b.symbol);
        } else {
          return b.symbol.localeCompare(a.symbol);
        }
      } else { // by === 'price'
        if (order === 'asc') {
          return (a.price || 0) - (b.price || 0);
        } else {
          return (b.price || 0) - (a.price || 0);
        }
      }
    });
    setFilteredStocks(sortedStocks);
  };

  const handleSearch = (text) => {
    setSearch(text);
    if (text === "") {
      const stocks = [...stockData];
      if (sortOrder) {
        stocks.sort((a, b) => {
          if (sortBy === 'symbol') {
            if (sortOrder === 'asc') {
              return a.symbol.localeCompare(b.symbol);
            } else {
              return b.symbol.localeCompare(a.symbol);
            }
          } else { // sortBy === 'price'
            if (sortOrder === 'asc') {
              return (a.price || 0) - (b.price || 0);
            } else {
              return (b.price || 0) - (a.price || 0);
            }
          }
        });
      }
      setFilteredStocks(stocks);
    } else {
      const filtered = stockData.filter((stock) =>
        stock.symbol.toLowerCase().includes(text.toLowerCase())
      );
      if (sortOrder) {
        filtered.sort((a, b) => {
          if (sortBy === 'symbol') {
            if (sortOrder === 'asc') {
              return a.symbol.localeCompare(b.symbol);
            } else {
              return b.symbol.localeCompare(a.symbol);
            }
          } else { // sortBy === 'price'
            if (sortOrder === 'asc') {
              return (a.price || 0) - (b.price || 0);
            } else {
              return (b.price || 0) - (a.price || 0);
            }
          }
        });
      }
      setFilteredStocks(filtered);
    }
  };

  const handleChartTypeChange = (type) => {
    setChartType(type);
    setShowChartOptions(false);
  };

  const handlePriceAlert = (stock) => {
    if (!addStockAlert) {
      Alert.alert('Hata', 'Bildirim sistemi şu anda kullanılamıyor.');
      return;
    }
    setSelectedStock(stock);
    setAlertPrice(stock.price.toString());
    setShowAlertModal(true);
  };

  const handleAlertSubmit = () => {
    if (!alertPrice || isNaN(alertPrice) || !alertType) {
      Alert.alert('Hata', 'Lütfen geçerli bir fiyat girin ve bir uyarı tipi seçin.');
      return;
    }

    addStockAlert(selectedStock.symbol, parseFloat(alertPrice), alertType);
    Alert.alert('Başarılı', `Fiyat ${alertType === 'above' ? 'yukarı' : 'aşağı'} uyarısı eklendi!`);
    setShowAlertModal(false);
    setAlertPrice('');
    setAlertType(null);
    setSelectedStock(null);
  };

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
            
            // Fiyat değişikliklerini kontrol et
            if (checkPriceAlerts) {
              stocksWithLogos.forEach(stock => {
                checkPriceAlerts(stock.symbol, stock.price);
              });
            }
            
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
      console.error("API hatası:", error);
    }
  };

  useEffect(() => {
    fetchStockDataWithPolling();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#f6bfe0' }}>
      <View style={styles.header}>
        <View style={styles.iconWrapper}>
          <Ionicons name="information-circle-outline" size={28} color="#d63384" />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={search}
          onChangeText={handleSearch}
        />
        <View style={styles.iconWrapper}>
          <TouchableOpacity onPress={() => setShowSortOptions(true)}>
            <Ionicons name="funnel-outline" size={28} color="#d63384" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showSortOptions}
        onRequestClose={() => setShowSortOptions(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sıralama Seçenekleri</Text>
            
            <Text style={styles.sectionTitle}>Sembole Göre</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.optionButton, sortOrder === 'asc' && sortBy === 'symbol' && styles.selectedOption]}
                onPress={() => handleSort('asc', 'symbol')}
              >
                <Text style={[styles.optionText, sortOrder === 'asc' && sortBy === 'symbol' && styles.selectedOptionText]}>A-Z</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, sortOrder === 'desc' && sortBy === 'symbol' && styles.selectedOption]}
                onPress={() => handleSort('desc', 'symbol')}
              >
                <Text style={[styles.optionText, sortOrder === 'desc' && sortBy === 'symbol' && styles.selectedOptionText]}>Z-A</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Fiyata Göre</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.optionButton, sortOrder === 'asc' && sortBy === 'price' && styles.selectedOption]}
                onPress={() => handleSort('asc', 'price')}
              >
                <Text style={[styles.optionText, sortOrder === 'asc' && sortBy === 'price' && styles.selectedOptionText]}>Artan</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, sortOrder === 'desc' && sortBy === 'price' && styles.selectedOption]}
                onPress={() => handleSort('desc', 'price')}
              >
                <Text style={[styles.optionText, sortOrder === 'desc' && sortBy === 'price' && styles.selectedOptionText]}>Azalan</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSortOptions(false)}
            >
              <Text style={styles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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

      <Modal
        animationType="slide"
        transparent={true}
        visible={showAlertModal}
        onRequestClose={() => setShowAlertModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Fiyat Uyarısı</Text>
            <Text style={styles.modalSubtitle}>
              {selectedStock?.symbol} için fiyat uyarısı ekleyin
            </Text>

            <View style={styles.alertTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.alertTypeButton,
                  alertType === 'above' && styles.selectedAlertType
                ]}
                onPress={() => setAlertType('above')}
              >
                <Text style={[
                  styles.alertTypeText,
                  alertType === 'above' && styles.selectedAlertTypeText
                ]}>Yukarı</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.alertTypeButton,
                  alertType === 'below' && styles.selectedAlertType
                ]}
                onPress={() => setAlertType('below')}
              >
                <Text style={[
                  styles.alertTypeText,
                  alertType === 'below' && styles.selectedAlertTypeText
                ]}>Aşağı</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.priceInput}
              placeholder="Fiyat"
              keyboardType="numeric"
              value={alertPrice}
              onChangeText={setAlertPrice}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAlertModal(false);
                  setAlertPrice('');
                  setAlertType(null);
                  setSelectedStock(null);
                }}
              >
                <Text style={styles.modalButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleAlertSubmit}
              >
                <Text style={[styles.modalButtonText, styles.submitButtonText]}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <FlatList
        contentContainerStyle={{ padding: 10 }}
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
              <View style={styles.stockContent}>
                <View style={styles.stockInfo}>
                  <Text style={styles.stockSymbol}>{item.symbol}</Text>
                  <Text style={styles.stockPrice}>
                    ${typeof item.price === 'number' ? item.price.toFixed(2) : "N/A"}
                  </Text>
                </View>
                <View style={styles.iconsContainer}>
                  <Ionicons 
                    name={typeof item.price === 'number' && typeof item.open === 'number' && item.price > item.open ? "arrow-up-outline" : "arrow-down-outline"} 
                    size={24} 
                    color={typeof item.price === 'number' && typeof item.open === 'number' && item.price > item.open ? "green" : "red"} 
                  />
                  <TouchableOpacity 
                    onPress={() => toggleFavorite(item.symbol, item)} 
                    style={styles.iconButton}
                  >
                    <Ionicons 
                      name={favorites[item.symbol] ? "heart" : "heart-outline"} 
                      size={24} 
                      color={favorites[item.symbol] ? "red" : "#d63384"} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handlePriceAlert(item)}
                    style={styles.iconButton}
                  >
                    <Ionicons 
                      name={stockAlerts?.[item.symbol] ? "notifications" : "notifications-outline"} 
                      size={24} 
                      color="#d63384" 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
      <View style={{ width: '100%', backgroundColor: 'transparent' }}>
        {BottomNavComponent}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    fontWeight: 'bold',
    fontFamily: 'georgia',
    marginTop: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  iconWrapper: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    backgroundColor: "#fff",
    flex: 1,
    marginHorizontal: 10,
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
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
  stockContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 15,
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
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 4,
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
    marginBottom: 10,
    color: '#d63384',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  alertTypeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  alertTypeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#f6bfe0',
    minWidth: 100,
    alignItems: 'center',
  },
  selectedAlertType: {
    backgroundColor: '#d63384',
  },
  alertTypeText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedAlertTypeText: {
    color: 'white',
  },
  priceInput: {
    backgroundColor: '#f6bfe0',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ffc0cb',
  },
  submitButton: {
    backgroundColor: '#d63384',
  },
  modalButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButtonText: {
    color: 'white',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d63384',
    marginTop: 15,
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  stockPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#f6bfe0',
    marginHorizontal: 5,
    marginBottom: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#d63384',
  },
  optionText: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectedOptionText: {
    color: 'white',
  },
  closeButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#ffc0cb',
    minWidth: 120,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
