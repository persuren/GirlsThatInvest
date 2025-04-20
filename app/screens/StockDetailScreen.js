import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  ScrollView,
} from "react-native";
import StockChart from "./StockChart";
import { Ionicons } from '@expo/vector-icons';

export default function StockDetailScreen({ route, navigation }) {
  const stock = route?.params?.stock;
  const [stockDetails, setStockDetails] = useState(null);
  const [pastPrices, setPastPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [favorites, setFavorites] = useState({});

  // HEADER ÖZELLEŞTİRME
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      title: "",
      headerLeft: () => (
        <View style={styles.headerLeftContainer}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={28} color="#ff1493" />
          </TouchableOpacity>
          <Text style={styles.headerStockSymbol}>{stock?.symbol}</Text>
        </View>
      ),
      headerRight: () => (
        <TouchableOpacity 
          onPress={() => toggleFavorite(stock.symbol)} 
          style={styles.headerFavoriteButton}
        >
          <Ionicons 
            name={favorites[stock.symbol] ? "heart" : "heart-outline"} 
            size={34} 
            color={favorites[stock.symbol] ? "red" : "#ff1493"} 
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, stock, favorites]);
  const toggleFavorite = (symbol) => {
    setFavorites((prevFavorites) => ({
      ...prevFavorites,
      [symbol]: !prevFavorites[symbol],
    }));
  };
  useEffect(() => {
    if (!stock) return;
    const fetchStockData = async () => {
      try {
        const response = await fetch(
          `http://10.0.2.2:5001/get_stock_history/${stock.symbol}`
        );
        const data = await response.json();
        if (data && data.length > 0) {
          setPastPrices(
            data.map((item) => ({
              adj_close: item.adj_close,
              timestamp: item.timestamp,
            }))
          );
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

  const fetchNews = async () => {
    try {
      setNewsLoading(true);
      const response = await fetch(
        `http://10.0.2.2:5001/get_stock_news/${stock.symbol}`
      );
      const newsData = await response.json();

      if (newsData.error) {
        console.error("News API Error:", newsData.error);
        setNews([]);
        return;
      }

      setNews(newsData.news || []);
    } catch (error) {
      console.error("Error fetching news:", error);
      setNews([]);
    } finally {
      setNewsLoading(false);
    }
  };

  const renderContent = () => {
    if (activeTab === "details") {
      return (
        <View style={{ paddingHorizontal: 16 }}>
          <View style={styles.detailsBox}>
            <Text style={styles.detailText}>📈 <Text style={styles.detailLabel}>Volume:</Text> {stockDetails?.volume || "N/A"}</Text>
            <Text style={styles.detailText}>📊 <Text style={styles.detailLabel}>High:</Text> {stockDetails?.high || "N/A"}</Text>
            <Text style={styles.detailText}>📉 <Text style={styles.detailLabel}>Low:</Text> {stockDetails?.low || "N/A"}</Text>
            <Text style={styles.detailText}>📌 <Text style={styles.detailLabel}>Open:</Text> {stockDetails?.open || "N/A"}</Text>
            <Text style={styles.detailText}>💰 <Text style={styles.detailLabel}>Adj Close:</Text> {stockDetails?.adj_close || "N/A"}</Text>
          </View>
        </View>
      );
    } else if (activeTab === "news") {
      return (
        <ScrollView style={styles.newsContainer}>
          {newsLoading ? (
            <ActivityIndicator size="small" color="#ff69b4" />
          ) : news.length > 0 ? (
            news.map((item, index) => (
              <View key={index} style={styles.detailsBox}>
                <Text style={styles.newsTitle}>
                  <Text style={{ fontWeight: "bold", fontStyle: "italic" }}>
                    {item.title}
                  </Text>
                </Text>
                <TouchableOpacity onPress={() => Linking.openURL(item.link)}>
                  <Text style={styles.newsLink}>{item.link}</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.noNews}>No news available for this stock.</Text>
          )}
        </ScrollView>
      );
    }
  };

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
      <StockChart stockHistory={pastPrices} />

      <Text style={styles.price}>
        Current Price: ${stockDetails?.price || "N/A"}
      </Text>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "details" && styles.activeTab]}
          onPress={() => setActiveTab("details")}
        >
          <Text style={activeTab === "details" ? styles.activeTabText : styles.tabText}>
            📄 Details
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "news" && styles.activeTab]}
          onPress={() => {
            setActiveTab("news");
            if (news.length === 0) fetchNews();
          }}
        >
          <Text style={activeTab === "news" ? styles.activeTabText : styles.tabText}>
            🗞️ News
          </Text>
        </TouchableOpacity>
      </View>

      {renderContent()}
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
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  headerStockSymbol: {
    fontSize: 24, // BOYUT BÜYÜTÜLDÜ
    fontWeight: 'bold',
    color: '#ff1493', // PEMBE RENK
    fontFamily: 'georgia',
  },
  backButton: {
    marginRight: 20,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ff1493",
    fontFamily: 'georgia',
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    color: "#d63384",
    fontFamily: 'georgia',
  },
  detail: {
    fontSize: 18,
    marginVertical: 5,
    color: "#333",
    fontFamily: 'georgia',
  },
  tabContainer: {
    flexDirection: "row",
    marginVertical: 12,
    backgroundColor: "#fff0f5",
    borderRadius: 16,
    padding: 6,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 6,
    backgroundColor: "#ffffff",
    borderWidth: 0,
  },
  activeTab: {
    backgroundColor: "#ff69b4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  tabText: {
    color: "#555",
    fontSize: 16,
    fontFamily: "georgia",
  },
  activeTabText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "georgia",
  },
  newsContainer: {
    maxHeight: 250,
    backgroundColor: "#ffe6f0",
    borderRadius: 10,
    padding: 10,
  },
  newsTitle: {
    fontSize: 16,
    marginBottom: 4,
    color: "#000",
    fontFamily: "georgia",
  },
  newsLink: {
    fontSize: 14,
    color: "blue",
    textDecorationLine: "underline",
    fontFamily: "georgia",
  },
  noNews: {
    textAlign: "center",
    color: "#666",
    padding: 20,
    fontFamily: "georgia",
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
    fontSize: 16,
    color: "red",
  },
  detailsBox: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 15,
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: "georgia",
    color: "#000",
  },
  detailLabel: {
    fontWeight: "bold",
    fontStyle: "italic",
    fontFamily: "georgia",
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  stockSymbol: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ff1493',
    fontFamily: 'georgia',
  },
  favoriteButton: {
    padding: 8,
  },
  newsOuterContainer: {
    flex: 1,
  },
  newsContainer: {
    flex: 1,
    backgroundColor: "#ffe6f0",
    borderRadius: 10,
  },
  newsContentContainer: {
    paddingBottom: 20, // İçerik ile container arasına padding
  },
});
