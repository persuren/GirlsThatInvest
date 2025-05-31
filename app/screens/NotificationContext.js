import React, { createContext, useState, useContext, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [stockAlerts, setStockAlerts] = useState({});

  useEffect(() => {
    loadAlerts();
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Bildirim izni gerekli!');
      return;
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  };

  const loadAlerts = async () => {
    try {
      const savedAlerts = await AsyncStorage.getItem('stockAlerts');
      if (savedAlerts) {
        setStockAlerts(JSON.parse(savedAlerts));
      }
    } catch (error) {
      console.error('Alerts yüklenirken hata:', error);
    }
  };

  const saveAlerts = async (alerts) => {
    try {
      await AsyncStorage.setItem('stockAlerts', JSON.stringify(alerts));
    } catch (error) {
      console.error('Alerts kaydedilirken hata:', error);
    }
  };

  const addStockAlert = async (symbol, price, type) => {
    const newAlerts = {
      ...stockAlerts,
      [symbol]: {
        price,
        type, // 'above' veya 'below'
        timestamp: new Date().toISOString(),
      },
    };
    setStockAlerts(newAlerts);
    await saveAlerts(newAlerts);
  };

  const removeStockAlert = async (symbol) => {
    const newAlerts = { ...stockAlerts };
    delete newAlerts[symbol];
    setStockAlerts(newAlerts);
    await saveAlerts(newAlerts);
  };

  const checkPriceAlerts = async (symbol, currentPrice) => {
    const alert = stockAlerts[symbol];
    if (!alert) return;

    const shouldNotify = alert.type === 'above' 
      ? currentPrice >= alert.price 
      : currentPrice <= alert.price;

    if (shouldNotify) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${symbol} Fiyat Uyarısı`,
          body: `Fiyat ${alert.type === 'above' ? 'yükseldi' : 'düştü'}: $${currentPrice}`,
          data: { symbol },
        },
        trigger: null,
      });
      await removeStockAlert(symbol);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        stockAlerts,
        addStockAlert,
        removeStockAlert,
        checkPriceAlerts,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}; 
