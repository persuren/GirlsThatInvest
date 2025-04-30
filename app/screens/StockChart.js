import React from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { LineChart } from "react-native-chart-kit";

export default function StockChart({ stockHistory, chartType }) {
  const screenWidth = Dimensions.get("window").width - 40;

  if (!stockHistory.length) return null;

  // Güncel tarihi al (İngilizce format)
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Fiyat verilerini al
  const prices = stockHistory.map((item) => item.adj_close);

  // Grafik başlığını belirle
  const chartTitle = chartType === "minute" ? "Minute Chart" : "Hourly Chart";

  // Grafik renklerini ve stillerini belirle
  const chartConfig = {
    minute: {
      backgroundGradientFrom: "#fff0f7",
      backgroundGradientTo: "#fff0f7",
      fillShadowGradientFrom: "#ff69b4",
      fillShadowGradientTo: "#ff1493",
      color: () => "#ff1493",
      labelColor: () => "#ff1493",
      strokeWidth: 3,
      propsForDots: { r: "0" },
      propsForBackgroundLines: {
        strokeWidth: 1,
        stroke: "rgba(255, 105, 180, 0.2)",
      },
      formatYLabel: (value) => `$${parseFloat(value).toFixed(2)}`,
    },
    hour: {
      backgroundGradientFrom: "#f0f8ff",
      backgroundGradientTo: "#f0f8ff",
      fillShadowGradientFrom: "#4169e1",
      fillShadowGradientTo: "#1e90ff",
      color: () => "#1e90ff",
      labelColor: () => "#1e90ff",
      strokeWidth: 3,
      propsForDots: { r: "0" },
      propsForBackgroundLines: {
        strokeWidth: 1,
        stroke: "rgba(30, 144, 255, 0.2)",
      },
      formatYLabel: (value) => `$${parseFloat(value).toFixed(2)}`,
    }
  };

  // Veri noktası sayısına göre segment sayısını ayarla
  const segments = chartType === 'minute' ? 5 : 7;

  return (
    <View style={[
      styles.chartContainer,
      chartType === "minute" ? styles.minuteContainer : styles.hourContainer
    ]}>
      <Text style={[
        styles.chartTitle,
        chartType === "minute" ? styles.minuteTitle : styles.hourTitle
      ]}>{chartTitle}</Text>
      
      <Text style={[
        styles.dateLabel,
        chartType === "minute" ? styles.minuteDateLabel : styles.hourDateLabel
      ]}>
        {currentDate}
      </Text>

      <LineChart
        data={{
          labels: [""],
          datasets: [{ 
            data: prices,
            color: (opacity = 1) => chartType === "minute" ? "#ff1493" : "#1e90ff",
            strokeWidth: 2
          }],
        }}
        width={screenWidth}
        height={220}
        bezier
        chartConfig={chartConfig[chartType]}
        style={[
          styles.chart,
          chartType === "minute" ? styles.minuteChart : styles.hourChart
        ]}
        withDots={false}
        withInnerLines={true}
        withOuterLines={false}
        withVerticalLines={false}
        withHorizontalLines={true}
        withVerticalLabels={false}
        withHorizontalLabels={true}
        segments={segments}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    borderRadius: 16,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 20,
    marginTop: 10,
  },
  minuteContainer: {
    backgroundColor: "#fff0f7",
  },
  hourContainer: {
    backgroundColor: "#f0f8ff",
  },
  chartTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: 'georgia',
    marginBottom: 8,
  },
  minuteTitle: {
    color: "#ff1493",
  },
  hourTitle: {
    color: "#1e90ff",
  },
  dateLabel: {
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 15,
    fontFamily: 'georgia',
  },
  minuteDateLabel: {
    color: "#ff69b4",
  },
  hourDateLabel: {
    color: "#4169e1",
  },
  chart: {
    borderRadius: 16,
    paddingRight: 40,
  },
  minuteChart: {
    backgroundColor: "#fff0f7",
  },
  hourChart: {
    backgroundColor: "#f0f8ff",
  },
});
