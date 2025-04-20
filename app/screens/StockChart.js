import React from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { LineChart } from "react-native-chart-kit";

export default function StockChart({ stockHistory }) {
  const screenWidth = Dimensions.get("window").width - 40;

  if (!stockHistory.length) return null;

  // Tarih bilgisini al (ortada göstermek için)
  const stockDate = new Date(stockHistory[0].timestamp).toLocaleDateString();

  // Fiyat verilerini al
  const prices = stockHistory.slice(-385).map((item) => item.adj_close);

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Stock Trend</Text>
      
      {/* Ortada tarih göster */}
      <Text style={styles.dateLabel}>{stockDate}</Text>

      <LineChart
        data={{
          labels: [""], // Boş bırakıyoruz, böylece sadece tarih ortada olacak
          datasets: [{ data: prices, color: () => "#ffffff" }], // Çizgiyi siyah yap
        }}
        width={screenWidth}
        height={200}
        bezier
        chartConfig={{
          backgroundGradientFrom: "#ff69b4",
          backgroundGradientTo: "#ff1493",
          color: () => "#ffffff", // Çizgiyi siyah yap
          labelColor: () => "#ffffff", // Yazıları siyah yap
          propsForDots: {
            r: "0", // Noktaları tamamen kaldır
          },
          propsForBackgroundLines: {
            strokeWidth: 1.5,
            stroke: "#ffffff", // Arka plan çizgilerini beyaz yaparak görünürlüğü artır
          },
        }}
        style={styles.chart}
        withDots={false} // Noktaları tamamen kaldır
        withInnerLines={false} // İç çizgileri kaldır
        withOuterLines={false} // Dış çizgileri kaldır
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontWeight: 'bold',
    fontFamily: 'georgia',
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: 'georgia',
    color: "#ff1493",
    marginBottom: 10,
  },
  dateLabel: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#d63384",
    marginBottom: 10,
    fontFamily: 'georgia',
  },
  chart: {
    borderRadius: 16,
  },
});
