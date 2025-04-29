import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator } from "react-native";
import StockChart from "./StockChart"; // Güncellenmiş StockChart bileşeni

export default function StockDetailScreen({ route }) {
  const stock = route?.params?.stock;
  const [stockDetails, setStockDetails] = useState(null);
  const [pastPrices, setPastPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!stock) return;
    const fetchStockData = async () => {
      try {
        const response = await fetch(`http://10.0.2.2:5001/get_stock_history/${stock.symbol}`);
        const data = await response.json();
        if (data && data.length > 0) {
          setPastPrices(data.map(item => ({ adj_close: item.adj_close, timestamp: item.timestamp })));
          setStockDetails(data[0]);
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
      <View style={styles.header}>
        <Image source={{ uri: stock.logo }} style={styles.logo} />
        <Text style={styles.title}>{stock.symbol}</Text>
      </View>
      
      {/* Grafik */}
      <StockChart stockHistory={pastPrices} />

      {/* Güncel Fiyat */}
      <Text style={styles.price}>Current Price: ${stockDetails?.price || "N/A"}</Text>

      {/* 📦 Beyaz Bilgi Kutusu */}
      <View style={styles.box}>
        <Text style={styles.detail}>📈 Volume: {stockDetails?.volume || "N/A"}</Text>
        <Text style={styles.detail}>📊 High: {stockDetails?.high || "N/A"}</Text>
        <Text style={styles.detail}>📉 Low: {stockDetails?.low || "N/A"}</Text>
        <Text style={styles.detail}>📌 Open: {stockDetails?.open || "N/A"}</Text>
        <Text style={styles.detail}>💰 Adj Close: {stockDetails?.adj_close || "N/A"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffe6f0",
    padding: 10,
    fontFamily: 'georgia',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    fontFamily: 'georgia',
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#ff1493",
    fontFamily: 'georgia',
  },
  price: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
    color: "#d63384",
    fontFamily: 'georgia',
  },
  detail: {
    fontSize: 18,
    marginVertical: 5,
    color: "#333",
    fontFamily: 'georgia', // Yazıları koyu renk yaparak daha okunabilir hale getirdim
  },
  /* 📦 Beyaz Bilgi Kutusu */
  box: {
    backgroundColor: "#ffffff", // Kutuyu beyaz yap
    borderRadius: 16, // Köşeleri yuvarlak yap
    padding: 15, // İçeriği kutuya biraz mesafeli koy
    marginTop: 15, // Üst boşluk ekleyerek ayır
    shadowColor: "#000", // Gölge efekti ekle
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, // Android için gölge efekti
  },
  chartContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#ff1493",
    marginBottom: 10,
  },
  chart: {
    borderRadius: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    fontWeight: "bold",
  },
});
