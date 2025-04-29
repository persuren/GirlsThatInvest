import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const FavoriteContext = createContext();

export const FavoriteProvider = ({ children }) => {
  const [favorites, setFavorites] = useState({});

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('favorites');
      if (jsonValue != null) {
        setFavorites(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error("Error loading favorites", e);
    }
  };

  const saveFavorites = async (newFavorites) => {
    try {
      const jsonValue = JSON.stringify(newFavorites);
      await AsyncStorage.setItem('favorites', jsonValue);
    } catch (e) {
      console.error("Error saving favorites", e);
    }
  };

  const toggleFavorite = (symbol) => {
    const updatedFavorites = {
      ...favorites,
      [symbol]: !favorites[symbol],
    };
    setFavorites(updatedFavorites);
    saveFavorites(updatedFavorites);
  };

  return (
    <FavoriteContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoriteContext.Provider>
  );
};
