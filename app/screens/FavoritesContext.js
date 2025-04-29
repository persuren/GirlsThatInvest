import React, { createContext, useContext, useState } from "react";

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState({});

  const toggleFavorite = (symbol, stock) => {
    setFavorites((prev) => {
      const updated = { ...prev };
      if (updated[symbol]) {
        delete updated[symbol];
      } else {
        updated[symbol] = stock;
      }
      return updated;
    });
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
} 
