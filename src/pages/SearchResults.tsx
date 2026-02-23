import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { API } from '../lib/api';
import {
  Search, SlidersHorizontal, X, LayoutGrid, List,
  BookOpen, ShoppingCart, Heart, ArrowLeft,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import type { CartItem } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import type { FavoriteBook } from '../context/FavoritesContext';

/* ── Types ───────────────────────────────────────────────── */
interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  price: number;
  coverType: string;
  image?: string;
  description?: string;
}

type ViewMode = 'grid' | 'list';

/* ── Helpers ─────────────────────────────────────────────── */
function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function filterBooks(
  books: Book[],
  q: string,
  category: string,
  cover: string,
): Book[] {
  const norm = normalize(q);
  return books.filter((b) => {
    const matchQ =
      !norm ||
      normalize(b.title).includes(norm) ||
      normalize(b.author).includes(norm) ||
      normalize(b.category).includes(norm) ||
      normalize(b.description ?? '').includes(norm);
    const matchCat = !category || b.category === category;
    const matchCover = !cover || b.coverType === cover;
    return matchQ && matchCat && matchCover;
  });
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const normText = normalize(text);
  const normQ = normalize(query.trim());
  const idx = normText.indexOf(normQ);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-mint-200 dark:bg-mint-800/60 text-mint-800 dark:text-mint-200 rounded-sm not-italic font-bold">
        {text.slice(idx, idx + query.trim().length)}
      </mark>
      {text.slice(idx + query.trim().length)}
    </>
  );
}

/* ── Page ────────────────────────────────────────────────── */

/* FilterPanel ─────────────────────────────────────────────── */
interface FilterPanelProps {
  categories: string[];
  coverTypes: string[];
  activeCategory: string;
  activeCover: string;
  hasFilters: boolean;
  setParam: (key: string, value: string) => void;
  clearFilters: () => void;
}

function FilterPanel({ categories, coverTypes, activeCategory, activeCover, hasFilters, setParam, clearFilters }: FilterPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
          Categoría
        </p>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setParam('category', '')}
            className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !activeCategory
                ? 'bg-mint-500 text-white font-semibold'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg'
            }`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setParam('category', cat === activeCategory ? '' : cat)}
              className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeCategory === cat
                  ? 'bg-mint-500 text-white font-semibold'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
          Tipo de tapa
        </p>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setParam('cover', '')}
            className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !activeCover
                ? 'bg-mint-500 text-white font-semibold'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg'
            }`}
          >
            Todos
          </button>
          {coverTypes.map((type) => (
            <button
              key={type}
              onClick={() => setParam('cover', type === activeCover ? '' : type)}
              className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeCover === type
                  ? 'bg-mint-500 text-white font-semibold'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors mt-1"
        >
          <X className="w-4 h-4" /> Limpiar filtros
        </button>
      )}
    </div>
  );
}

/* GridCard ──────────────────────────────────────────────────── */
interface CardProps {
  book: Book;
  q: string;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  toggleFavorite: (item: FavoriteBook) => void;
  isFavorite: (id: string) => boolean;
}

function GridCard({ book, q, addItem, toggleFavorite, isFavorite }: CardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group flex flex-col"
    >
      <Link to={`/libro/${book.id}`} className="block">
        <div className="relative aspect-[2/3] mb-3 overflow-hidden rounded-xl shadow-md group-hover:shadow-xl transition-shadow bg-gray-100 dark:bg-dark-surface">
          {book.image ? (
            <img
              src={book.image}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600" />
            </div>
          )}
          <span className="absolute top-2 right-2 bg-white/90 dark:bg-dark-bg/90 backdrop-blur-sm px-2 py-0.5 rounded text-[11px] font-medium text-mint-600 dark:text-mint-400">
            {book.coverType}
          </span>
        </div>
        <h3 className="font-serif font-bold text-base leading-snug text-gray-900 dark:text-white group-hover:text-mint-500 transition-colors line-clamp-2 mb-0.5">
          <Highlight text={book.title} query={q} />
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">
          <Highlight text={book.author} query={q} />
        </p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-mint-600 dark:text-mint-400">${book.price.toFixed(2)}</span>
          <span className="text-[11px] text-gray-400 bg-gray-100 dark:bg-dark-surface px-2 py-0.5 rounded-full">
            <Highlight text={book.category} query={q} />
          </span>
        </div>
      </Link>
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => addItem({ id: book.id, title: book.title, author: book.author, price: book.price, image: book.image ?? '' })}
          className="flex-1 flex items-center justify-center gap-1.5 bg-mint-500 hover:bg-mint-600 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
        >
          <ShoppingCart className="w-3.5 h-3.5" /> Añadir
        </button>
        <button
          onClick={() => toggleFavorite({ id: book.id, title: book.title, author: book.author, price: book.price, image: book.image ?? '', category: book.category, coverType: book.coverType })}
          className={`p-2 rounded-lg border transition-colors ${
            isFavorite(book.id)
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-500'
              : 'border-gray-200 dark:border-dark-border text-gray-400 hover:text-red-400 hover:border-red-200'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite(book.id) ? 'fill-current' : ''}`} />
        </button>
      </div>
    </motion.div>
  );
}

/* ListCard ──────────────────────────────────────────────────── */
function ListCard({ book, q, addItem, toggleFavorite, isFavorite }: CardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      className="flex gap-4 bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl p-3 sm:p-4 hover:border-mint-200 dark:hover:border-mint-800/50 hover:shadow-md transition-all group"
    >
      <Link to={`/libro/${book.id}`} className="flex-shrink-0">
        <div className="w-16 h-24 sm:w-20 sm:h-28 overflow-hidden rounded-lg bg-gray-100 dark:bg-dark-bg shadow-sm">
          {book.image ? (
            <img
              src={book.image}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-gray-300 dark:text-gray-600" />
            </div>
          )}
        </div>
      </Link>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <Link to={`/libro/${book.id}`}>
            <h3 className="font-serif font-bold text-base sm:text-lg leading-snug text-gray-900 dark:text-white group-hover:text-mint-500 transition-colors line-clamp-2">
              <Highlight text={book.title} query={q} />
            </h3>
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
            <Highlight text={book.author} query={q} />
          </p>
          {book.description && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 line-clamp-2 hidden sm:block">
              {book.description}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-[11px] bg-mint-100 dark:bg-mint-900/40 text-mint-700 dark:text-mint-300 px-2 py-0.5 rounded-full font-medium">
              <Highlight text={book.category} query={q} />
            </span>
            <span className="text-[11px] bg-gray-100 dark:bg-dark-bg text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
              {book.coverType}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="font-bold text-mint-600 dark:text-mint-400 text-base">${book.price.toFixed(2)}</span>
          <button
            onClick={() => addItem({ id: book.id, title: book.title, author: book.author, price: book.price, image: book.image ?? '' })}
            className="ml-auto flex items-center gap-1.5 bg-mint-500 hover:bg-mint-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Añadir</span>
          </button>
          <button
            onClick={() => toggleFavorite({ id: book.id, title: book.title, author: book.author, price: book.price, image: book.image ?? '', category: book.category, coverType: book.coverType })}
            className={`p-1.5 rounded-lg border transition-colors ${
              isFavorite(book.id)
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-500'
                : 'border-gray-200 dark:border-dark-border text-gray-400 hover:text-red-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite(book.id) ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main page ───────────────────────────────────────────────── */
const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  /* URL state */
  const q = searchParams.get('q') ?? '';
  const activeCategory = searchParams.get('category') ?? '';
  const activeCover = searchParams.get('cover') ?? '';
  const view = (searchParams.get('view') as ViewMode) ?? 'grid';

  /* Local state */
  const [inputValue, setInputValue] = useState(q);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  /* Keep input synced when URL q changes */
  useEffect(() => { setInputValue(q); }, [q]);

  /* Fetch all books once */
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch(`${API}/books`).then((r) => r.json()),
      fetch(`${API}/categories`).then((r) => r.json()),
    ])
      .then(([books, cats]: [Book[], { name: string }[]]) => {
        setAllBooks(books);
        setCategories(cats.map((c) => c.name));
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const coverTypes = useMemo(
    () => Array.from(new Set(allBooks.map((b) => b.coverType))).sort(),
    [allBooks],
  );

  const results = useMemo(
    () => filterBooks(allBooks, q, activeCategory, activeCover),
    [allBooks, q, activeCategory, activeCover],
  );

  /* ── Param helpers ─────────────────────────────────────── */
  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => {
    const next = new URLSearchParams();
    if (q) next.set('q', q);
    if (view !== 'grid') next.set('view', view);
    setSearchParams(next, { replace: true });
  };

  const hasFilters = !!(activeCategory || activeCover);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParam('q', inputValue.trim());
  };

  const filterProps = { categories, coverTypes, activeCategory, activeCover, hasFilters, setParam, clearFilters };
  const cardProps = { q, addItem, toggleFavorite, isFavorite };

  /* ── Render ────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* ── Top search bar ───────────────────────────────── */}
      <div className="sticky top-20 z-30 bg-gray-50/95 dark:bg-dark-bg/95 backdrop-blur-md border-b border-gray-200 dark:border-dark-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-500 hover:text-mint-500 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mint-500 pointer-events-none" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Buscar libros, autores, categorías…"
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-full focus:ring-2 focus:ring-mint-500 focus:border-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 transition-shadow"
            />
          </form>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setFiltersOpen(true)}
            className={`relative lg:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-full text-sm border transition-colors flex-shrink-0 ${
              hasFilters
                ? 'bg-mint-500 text-white border-mint-500'
                : 'bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {hasFilters && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                {[activeCategory, activeCover].filter(Boolean).length}
              </span>
            )}
          </button>

          {/* View toggle */}
          <div className="flex items-center bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-full overflow-hidden flex-shrink-0">
            <button
              onClick={() => setParam('view', 'grid')}
              className={`p-2 transition-colors ${view === 'grid' ? 'bg-mint-500 text-white' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setParam('view', 'list')}
              className={`p-2 transition-colors ${view === 'list' ? 'bg-mint-500 text-white' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 lg:flex lg:gap-8">
        {/* ── Desktop sidebar ──────────────────────────── */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-40 bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border p-5 shadow-sm max-h-[calc(100vh-11rem)] flex flex-col">
            <h2 className="font-bold text-gray-900 dark:text-white text-sm mb-5 flex items-center gap-2 flex-shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-mint-500" /> Filtros
            </h2>
            <div className="overflow-y-auto flex-1 pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-dark-border">
              <FilterPanel {...filterProps} />
            </div>
          </div>
        </aside>

        {/* ── Results ──────────────────────────────────── */}
        <main className="flex-1 min-w-0">
          {/* Result count + active filter chips */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {isLoading ? (
              <div className="h-5 w-32 bg-gray-200 dark:bg-dark-surface rounded animate-pulse" />
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-bold text-gray-900 dark:text-white">{results.length}</span>{' '}
                {results.length === 1 ? 'resultado' : 'resultados'}
                {q && <> para <span className="italic">"{q}"</span></>}
              </p>
            )}
            {activeCategory && (
              <button
                onClick={() => setParam('category', '')}
                className="flex items-center gap-1 text-xs bg-mint-100 dark:bg-mint-900/40 text-mint-700 dark:text-mint-300 px-2.5 py-1 rounded-full hover:bg-mint-200 dark:hover:bg-mint-800/60 transition-colors"
              >
                {activeCategory} <X className="w-3 h-3" />
              </button>
            )}
            {activeCover && (
              <button
                onClick={() => setParam('cover', '')}
                className="flex items-center gap-1 text-xs bg-mint-100 dark:bg-mint-900/40 text-mint-700 dark:text-mint-300 px-2.5 py-1 rounded-full hover:bg-mint-200 dark:hover:bg-mint-800/60 transition-colors"
              >
                {activeCover} <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Skeleton */}
          {isLoading && (
            <div className={view === 'grid' ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6' : 'flex flex-col gap-3'}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className={`bg-white dark:bg-dark-surface rounded-xl animate-pulse ${view === 'list' ? 'h-28 flex gap-4 p-4' : ''}`}>
                  {view === 'grid' ? (
                    <>
                      <div className="aspect-[2/3] bg-gray-200 dark:bg-dark-bg rounded-xl mb-3" />
                      <div className="h-4 bg-gray-200 dark:bg-dark-bg rounded mb-2 w-4/5" />
                      <div className="h-3 bg-gray-200 dark:bg-dark-bg rounded w-3/5" />
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-24 bg-gray-200 dark:bg-dark-bg rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-gray-200 dark:bg-dark-bg rounded w-4/5" />
                        <div className="h-3 bg-gray-200 dark:bg-dark-bg rounded w-3/5" />
                        <div className="h-3 bg-gray-200 dark:bg-dark-bg rounded w-2/5" />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Results grid/list */}
          {!isLoading && results.length > 0 && (
            <AnimatePresence mode="popLayout">
              {view === 'grid' ? (
                <motion.div
                  key="grid"
                  layout
                  className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                >
                  {results.map((book) => (
                    <GridCard key={book.id} book={book} {...cardProps} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  layout
                  className="flex flex-col gap-3"
                >
                  {results.map((book) => (
                    <ListCard key={book.id} book={book} {...cardProps} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Empty state */}
          {!isLoading && results.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24"
            >
              <Search className="w-14 h-14 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
              <h3 className="font-serif font-bold text-xl text-gray-900 dark:text-white mb-2">
                Sin resultados{q ? ` para "${q}"` : ''}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Probá con otro término, o cambiá los filtros.
              </p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 bg-mint-500 hover:bg-mint-600 text-white font-semibold px-5 py-2.5 rounded-full transition-colors text-sm"
                >
                  <X className="w-4 h-4" /> Limpiar filtros
                </button>
              )}
            </motion.div>
          )}
        </main>
      </div>

      {/* ── Mobile filter bottom sheet ────────────────────── */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setFiltersOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white dark:bg-dark-surface rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              {/* Handle */}
              <div className="flex items-center justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>
              <div className="px-6 pb-8 pt-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-mint-500" /> Filtros
                  </h2>
                  <button
                    onClick={() => setFiltersOpen(false)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <FilterPanel {...filterProps} />
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="w-full mt-6 bg-mint-500 hover:bg-mint-600 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  Ver {results.length} resultado{results.length !== 1 ? 's' : ''}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchResults;
