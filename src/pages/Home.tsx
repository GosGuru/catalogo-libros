import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import GlobalSearch from '../components/GlobalSearch';

const Home = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [homeQuery, setHomeQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (homeQuery.trim()) {
      navigate(`/buscador?q=${encodeURIComponent(homeQuery.trim())}`);
    } else {
      navigate('/buscador');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-mint-200 dark:bg-mint-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-72 h-72 bg-mint-300 dark:bg-mint-800/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-80 h-80 bg-mint-100 dark:bg-mint-950/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 w-full max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-5xl sm:text-7xl font-serif font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            Encuentra tu próxima <br />
            <span className="text-mint-500 italic">gran lectura</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto font-sans">
            Explora nuestro catálogo cuidadosamente seleccionado de ficción, finanzas, autoayuda y más.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative max-w-2xl mx-auto"
        >
          <form onSubmit={handleSubmit}>
            <div className="flex items-center w-full bg-white dark:bg-dark-surface border-2 border-mint-100 dark:border-dark-border rounded-full px-6 py-4 shadow-xl hover:shadow-2xl hover:border-mint-300 dark:hover:border-mint-700 focus-within:border-mint-400 dark:focus-within:border-mint-600 transition-all group">
              <Search className="w-6 h-6 text-mint-500 mr-4 flex-shrink-0" />
              <input
                type="text"
                value={homeQuery}
                onChange={(e) => setHomeQuery(e.target.value)}
                placeholder="¿Qué libro estás buscando?"
                className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-lg"
              />
              {homeQuery ? (
                <button
                  type="submit"
                  className="hidden sm:flex items-center gap-2 bg-mint-500 hover:bg-mint-600 text-white text-sm font-semibold px-4 py-1.5 rounded-full transition-colors flex-shrink-0"
                >
                  Buscar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="hidden sm:flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-dark-bg px-3 py-1 rounded-full flex-shrink-0"
                >
                  <kbd className="font-sans">Ctrl</kbd> + <kbd className="font-sans">K</kbd>
                </button>
              )}
            </div>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 text-mint-600 dark:text-mint-400 font-medium hover:text-mint-700 dark:hover:text-mint-300 transition-colors group"
          >
            Explorar todo el catálogo
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/buscador"
            className="inline-flex items-center gap-2 text-gray-400 dark:text-gray-500 text-sm hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <Search className="w-4 h-4" /> Búsqueda avanzada
          </Link>
        </motion.div>
      </div>

      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};

export default Home;
