import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Filter, ChevronDown } from 'lucide-react';
import { BOOKS, CATEGORIES } from '../lib/data';

interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  coverType: string;
  category: string;
  image: string;
}

const Catalog = () => {
  const books      = BOOKS      as Book[];
  const categories = CATEGORIES as { id: string; name: string }[];
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedCover, setSelectedCover] = useState<string>('Todos');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredBooks = books.filter(book => {
    const categoryMatch = selectedCategory === 'Todas' || book.category === selectedCategory;
    const coverMatch = selectedCover === 'Todos' || book.coverType === selectedCover;
    return categoryMatch && coverMatch;
  });

  const coverTypes = ['Todos', ...Array.from(new Set(books.map(b => b.coverType)))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-serif font-bold text-gray-900 dark:text-white"
        >
          Catálogo
        </motion.h1>

        <div className="relative w-full md:w-auto">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center justify-between w-full md:w-auto gap-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border px-4 py-2 rounded-lg shadow-sm hover:border-mint-500 transition-colors"
          >
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>

          {isFilterOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 mt-2 w-full md:w-64 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl shadow-xl z-20 p-4"
            >
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Categoría</h3>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-mint-500 outline-none"
                >
                  <option value="Todas">Todas</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Tipo de Tapa</h3>
                <select 
                  value={selectedCover}
                  onChange={(e) => setSelectedCover(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-mint-500 outline-none"
                >
                  {coverTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
      >
        {filteredBooks.map((book, index) => (
          <motion.div
            key={book.id}
            layoutId={`book-container-${book.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group"
          >
            <Link to={`/libro/${book.id}`} className="block">
              <div className="relative aspect-[2/3] mb-4 overflow-hidden rounded-xl shadow-md group-hover:shadow-xl transition-shadow duration-300 bg-gray-100 dark:bg-dark-surface">
                <motion.img
                  layoutId={`book-image-${book.id}`}
                  src={book.image}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 bg-white/90 dark:bg-dark-bg/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-mint-600 dark:text-mint-400">
                  {book.coverType}
                </div>
              </div>
              <motion.div layoutId={`book-info-${book.id}`}>
                <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white mb-1 group-hover:text-mint-500 transition-colors line-clamp-1">
                  {book.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{book.author}</p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-mint-600 dark:text-mint-400">
                    ${book.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-dark-surface px-2 py-1 rounded-full">
                    {book.category}
                  </span>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No se encontraron libros con esos filtros.</p>
          <button 
            onClick={() => { setSelectedCategory('Todas'); setSelectedCover('Todos'); }}
            className="mt-4 text-mint-500 hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
};

export default Catalog;
