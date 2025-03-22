import React from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";

export default function StockChart({ stockHistory }) {
  const screenWidth = Dimensions.get("window").width - 80;

  // Veriyi uygun formata dönüştürüyoruz
  const labels = stockHistory.map((_, index) => `D${index + 1}`);
  const prices = stockHistory.map(item => item.adj_close);
  const volumes = stockHistory.map(item => item.volume / 1000000); // Milyon olarak göster

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stock Trend</Text>

      {/* Çubuk Grafik (Volume) */}
      <BarChart
        data={{
          labels: labels,
          datasets: [{ data: volumes }],
        }}
        width={screenWidth}
        height={220}
        yAxisSuffix="M"
        chartConfig={{
          backgroundGradientFrom: "#1E1E1E",
          backgroundGradientTo: "#3A3A3A",
          color: (opacity = 1) => `rgba(137, 207, 240, ${opacity})`, // Açık mavi tonları
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          barPercentage: 0.6,
        }}
        withInnerLines={false}
        style={styles.chart}
      />

      {/* Çizgi Grafik (Price Trend) */}
      <LineChart
        data={{
          labels: labels,
          datasets: [{ data: prices, color: (opacity = 1) => `rgba(255, 105, 180, ${opacity})` }],
        }}
        width={screenWidth}
        height={250}
        bezier
        chartConfig={{
          backgroundGradientFrom: "#1E1E1E",
          backgroundGradientTo: "#3A3A3A",
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(255, 20, 147, ${opacity})`, // Pembe tonları
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          propsForDots: {
            r: "3",
            strokeWidth: "1.5",
            stroke: "#FFD700", // Altın sarısı noktalar
          },
          propsForBackgroundLines: {
            stroke: "rgba(255, 255, 255, 0.2)",
          },
        }}
        withShadow={true}
        withInnerLines={true}
        withOuterLines={false}
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#121212",
    padding: 20,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
    marginBottom: 10,
  },
  chart: {
    borderRadius: 12,
    marginVertical: 8,
  },
});
