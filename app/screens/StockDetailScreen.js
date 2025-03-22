import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import { LineChart } from "react-native-chart-kit";
import StockChart from "./StockChart";

export default function StockDetailScreen({ route }) {
  const stock = route?.params?.stock;
  const [stockDetails, setStockDetails] = useState(null);
  const [pastPrices, setPastPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!stock) return;
  
    const fetchStockData = async () => {
    try {
      console.log("Fetching stock data for", stock.symbol);
      const response = await fetch(`http://10.0.2.2:5001/get_stock_history/${stock.symbol}`);
      const data = await response.json();
      console.log("Stock data fetched:", data);

      if (data && data.length > 0) {
        const stockData = data.map(item => ({
          adj_close: item.adj_close,
          volume: item.volume,
          timestamp: item.timestamp
        }));
        setPastPrices(stockData); // pastPrices dizisini güncelliyoruz
        setStockDetails(data[0]); // İlk elemanı detaylara koyuyoruz
      }
    } catch (error) {
      console.error("Error fetching stock data:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchStockData();
}, [stock]);

  if (!stock) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Stock data is unavailable.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff69b4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Hisse Başlık */}
      <View style={styles.header}>
        <Image source={{ uri: stock.logo }} style={styles.logo} />
        <Text style={styles.title}>{stock.symbol}</Text>
      </View>

      {/* Fiyat Grafiği */}
        <StockChart stockHistory={pastPrices} />

      <Text style={styles.price}>
        Current Price: ${isNaN(stockDetails?.price) ? "N/A" : stockDetails?.price}
      </Text>
      <Text style={styles.detail}>Volume: {isNaN(stockDetails?.volume) ? "N/A" : stockDetails?.volume}</Text>

      {/* Hisse Detayları */}
      <Text style={styles.sectionTitle}>Stock Details</Text>
      <Text style={styles.detail}>Open: ${stockDetails?.open}</Text>
      <Text style={styles.detail}>Close: ${stockDetails?.adj_close}</Text>
      <Text style={styles.detail}>High: ${stockDetails?.high}</Text>
      <Text style={styles.detail}>Low: ${stockDetails?.low}</Text>
      <Text style={styles.detail}>Time: {stockDetails?.timestamp}</Text>      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6bfe0",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
  },
  detail: {
    fontSize: 16,
    marginVertical: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffcccc",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    fontWeight: "bold",
    textAlign: "center",
  },
});
