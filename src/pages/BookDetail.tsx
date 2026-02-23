import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Heart } from 'lucide-react';
import { sileo } from 'sileo';
import { useCart } from '../context/CartContext';
import { API } from '../lib/api';
import { useFavorites } from '../context/FavoritesContext';

interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  coverType: string;
  category: string;
  description: string;
  image: string;
}

const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`${API}/books/${id}`);
        if (!res.ok) throw new Error('Libro no encontrado');
        const data = await res.json();
        setBook(data);
      } catch (error) {
        console.error(error);
        sileo.error({ title: 'Error al cargar el libro', description: 'No se pudo encontrar el libro solicitado.' });
        navigate('/catalogo');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-mint-200 border-t-mint-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-mint-500 transition-colors mb-8 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Volver al catálogo
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
        <motion.div
          layoutId={`book-container-${book.id}`}
          className="relative aspect-[2/3] w-full max-w-md mx-auto md:mx-0 rounded-2xl overflow-hidden shadow-2xl bg-gray-100 dark:bg-dark-surface"
        >
          <motion.img
            layoutId={`book-image-${book.id}`}
            src={book.image}
            alt={book.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 bg-white/90 dark:bg-dark-bg/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm font-bold text-mint-600 dark:text-mint-400 shadow-lg">
            {book.coverType}
          </div>
        </motion.div>

        <motion.div
          layoutId={`book-info-${book.id}`}
          className="flex flex-col justify-center"
        >
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-mint-100 dark:bg-mint-900/30 text-mint-700 dark:text-mint-300 rounded-full text-sm font-medium mb-4">
              {book.category}
            </span>
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-2 leading-tight">
              {book.title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">
              por {book.author}
            </p>
          </div>

          <div className="mb-8">
            <p className="text-3xl font-bold text-mint-600 dark:text-mint-400 mb-6">
              ${book.price.toFixed(2)}
            </p>
            <div className="prose prose-lg dark:prose-invert text-gray-600 dark:text-gray-300">
              <p className="leading-relaxed">{book.description}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-auto">
            <button
              onClick={() => book && addItem({ id: book.id, title: book.title, author: book.author, price: book.price, image: book.image })}
              className="flex-1 bg-mint-500 hover:bg-mint-600 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all hover:shadow-lg hover:shadow-mint-500/30 active:scale-[0.98]"
            >
              <ShoppingCart className="w-5 h-5" />
              Añadir al carrito
            </button>
            <button
              onClick={() => book && toggleFavorite({ id: book.id, title: book.title, author: book.author, price: book.price, image: book.image, category: book.category, coverType: book.coverType })}
              className={`px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 border-2 transition-all active:scale-[0.98] ${
                book && isFavorite(book.id)
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-500 dark:border-red-400 dark:text-red-400'
                  : 'border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:border-mint-500 hover:text-mint-500 dark:hover:border-mint-400 dark:hover:text-mint-400'
              }`}
            >
              <Heart className={`w-5 h-5 ${book && isFavorite(book.id) ? 'fill-current' : ''}`} />
              {book && isFavorite(book.id) ? 'En favoritos' : 'Favorito'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BookDetail;
