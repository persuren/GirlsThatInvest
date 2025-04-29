import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const StockDetailScreen = ({ route }) => {
    const { symbol } = route.params;
    const [stockData, setStockData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
    const [chartType, setChartType] = useState('minute');
    const navigation = useNavigation();

    useEffect(() => {
        fetchStockData();
    }, [symbol, selectedTimeframe]);

    const fetchStockData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5001/get_stock_history/${symbol}?type=${chartType}`);
            const data = await response.json();
            if (response.ok) {
                setStockData(data);
                setError(null);
            } else {
                setError(data.error || 'Failed to fetch stock data');
            }
        } catch (err) {
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    const renderChart = () => {
        if (!stockData || stockData.length === 0) return null;

        const chartData = {
            labels: stockData.map(item => new Date(item.timestamp).toLocaleTimeString()),
            datasets: [{
                data: stockData.map(item => item.adj_close),
                color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
                strokeWidth: 2
            }]
        };

        return (
            <LineChart
                data={chartData}
                width={Dimensions.get('window').width - 20}
                height={220}
                chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 2,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                        borderRadius: 16
                    }
                }}
                bezier
                style={{
                    marginVertical: 8,
                    borderRadius: 16
                }}
            />
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.symbol}>{symbol}</Text>
                </View>
            </View>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : (
                <ScrollView style={styles.scrollView}>
                    <View style={styles.chartContainer}>
                        {renderChart()}
                    </View>
                    <View style={styles.timeframeContainer}>
                        <TouchableOpacity 
                            style={[styles.timeframeButton, selectedTimeframe === '1D' && styles.selectedTimeframe]}
                            onPress={() => setSelectedTimeframe('1D')}
                        >
                            <Text style={[styles.timeframeText, selectedTimeframe === '1D' && styles.selectedTimeframeText]}>1D</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.timeframeButton, selectedTimeframe === '1W' && styles.selectedTimeframe]}
                            onPress={() => setSelectedTimeframe('1W')}
                        >
                            <Text style={[styles.timeframeText, selectedTimeframe === '1W' && styles.selectedTimeframeText]}>1W</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.timeframeButton, selectedTimeframe === '1M' && styles.selectedTimeframe]}
                            onPress={() => setSelectedTimeframe('1M')}
                        >
                            <Text style={[styles.timeframeText, selectedTimeframe === '1M' && styles.selectedTimeframeText]}>1M</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 10,
    },
    symbol: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    chartContainer: {
        padding: 10,
    },
    timeframeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    timeframeButton: {
        padding: 10,
        borderRadius: 5,
    },
    selectedTimeframe: {
        backgroundColor: '#0000ff',
    },
    timeframeText: {
        fontSize: 16,
        color: '#000',
    },
    selectedTimeframeText: {
        color: '#fff',
    },
}); 
