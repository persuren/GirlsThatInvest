import React from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
export default function StockDetailScreen({ route }) {
  const stock = route?.params?.stock; // Güvenli erişim

  if (!stock) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Stock data is unavailable.</Text>
      </View>
    );
  }

  // Gerçek bir API'den veri çekmek için burayı dinamik hale getirebilirsin.
  const pastPrices = [220, 225, 230, 235, 240, 245, 250, 255, 260, 265, 270];

  return (
    <View style={styles.container}>
      {/* Hisse Başlık */}
      <View style={styles.header}>
        <Image source={{ uri: stock.logo }} style={styles.logo} />
        <Text style={styles.title}>{stock.symbol}</Text>
      </View>

      <Text style={styles.price}>Current Price: ${stock.price.toFixed(2)}</Text>

      {/* Fiyat Grafiği */}
      <Text style={styles.sectionTitle}>Price Trend</Text>
      <LineChart

        data={{
        labels: pastPrices.map((_, index) => `D${index + 1}`), // Daha kısa etiketler
        datasets: [{ data: pastPrices }],
        }}
        width={Dimensions.get("window").width - 40}
        height={200}
        chartConfig={{
        backgroundColor: "#ff69b4",
        backgroundGradientFrom: "#ff1493",
        backgroundGradientTo: "#ff69b4",
        decimalPlaces: 2,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        style: { borderRadius: 8 },
        }}
        bezier
        />

      {/* Hisse Detayları */}
      <Text style={styles.sectionTitle}>Stock Details</Text>
      <Text style={styles.detail}>Open: $235.50</Text>
      <Text style={styles.detail}>Close: $240.00</Text>
      <Text style={styles.detail}>Volume: 1.2M</Text>
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
