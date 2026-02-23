import React, { createContext, useContext, useState, useCallback } from 'react';
import { sileo } from 'sileo';

export interface FavoriteBook {
  id: string;
  title: string;
  author: string;
  price: number;
  image: string;
  category: string;
  coverType: string;
}

interface FavoritesContextType {
  favorites: FavoriteBook[];
  addFavorite: (book: FavoriteBook) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (book: FavoriteBook) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteBook[]>([]);

  const addFavorite = useCallback((book: FavoriteBook) => {
    setFavorites(prev => [...prev, book]);
    sileo.success({
      title: 'Añadido a favoritos',
      description: book.title,
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const book = prev.find(b => b.id === id);
      sileo.warning({
        title: 'Eliminado de favoritos',
        description: book?.title,
      });
      return prev.filter(b => b.id !== id);
    });
  }, []);

  const isFavorite = useCallback((id: string) => {
    return favorites.some(b => b.id === id);
  }, [favorites]);

  const toggleFavorite = useCallback((book: FavoriteBook) => {
    if (favorites.some(b => b.id === book.id)) {
      removeFavorite(book.id);
    } else {
      addFavorite(book);
    }
  }, [favorites, addFavorite, removeFavorite]);

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
};
