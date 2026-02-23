import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const Favorites = () => {
  const { favorites, removeFavorite } = useFavorites();
  const { addItem } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white mb-2">
          Mis Favoritos
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {favorites.length === 0
            ? 'Aún no tienes libros favoritos.'
            : `${favorites.length} libro${favorites.length !== 1 ? 's' : ''} guardado${favorites.length !== 1 ? 's' : ''}`}
        </p>
      </motion.div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Heart className="w-20 h-20 text-gray-200 dark:text-gray-700 mb-6" />
          <h2 className="text-2xl font-serif font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Tu lista de favoritos está vacía
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">
            Explora el catálogo y guarda los libros que te interesen haciendo clic en el corazón.
          </p>
          <Link
            to="/catalogo"
            className="bg-mint-500 hover:bg-mint-600 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-mint-500/30 active:scale-[0.98]"
          >
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {favorites.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.08 }}
              className="group relative bg-white dark:bg-dark-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-gray-100 dark:border-dark-border"
            >
              <Link to={`/libro/${book.id}`}>
                <div className="aspect-[2/3] overflow-hidden bg-gray-100 dark:bg-dark-bg">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </Link>
              <div className="p-4">
                <Link to={`/libro/${book.id}`}>
                  <h3 className="font-serif font-bold text-gray-900 dark:text-white hover:text-mint-500 transition-colors line-clamp-1">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{book.author}</p>
                </Link>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-mint-600 dark:text-mint-400 text-lg">
                    ${book.price.toFixed(2)}
                  </span>
                  <span className="text-xs bg-gray-100 dark:bg-dark-bg text-gray-500 dark:text-gray-400 px-2 py-1 rounded-full">
                    {book.coverType}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => addItem({
                      id: book.id,
                      title: book.title,
                      author: book.author,
                      price: book.price,
                      image: book.image,
                    })}
                    className="flex-1 flex items-center justify-center gap-2 bg-mint-500 hover:bg-mint-600 text-white py-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Añadir
                  </button>
                  <button
                    onClick={() => removeFavorite(book.id)}
                    className="p-2 rounded-xl text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors border border-gray-200 dark:border-dark-border"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
