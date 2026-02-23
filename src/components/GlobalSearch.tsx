import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, BookOpen, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

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

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Strip accents and lowercase: "Hábitos" → "habitos" */
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function filterBooks(books: Book[], q: string): Book[] {
  const norm = normalize(q);
  return books.filter(
    b =>
      normalize(b.title).includes(norm) ||
      normalize(b.author).includes(norm) ||
      normalize(b.category).includes(norm) ||
      normalize(b.description ?? '').includes(norm)
  );
}

/** Highlight the matching substring inside a piece of text */
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const normText = normalize(text);
  const normQuery = normalize(query.trim());
  const idx = normText.indexOf(normQuery);
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

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [results, setResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const navigate = useNavigate();

  // Fetch all books once when the modal first opens
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelectedIndex(-1);
      return;
    }
    setTimeout(() => inputRef.current?.focus(), 80);
    if (allBooks.length === 0) {
      setIsLoading(true);
      fetch('http://localhost:3001/books')
        .then(r => r.json())
        .then((data: Book[]) => {
          setAllBooks(data);
          setResults(data);
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    } else {
      setResults(query.trim() ? filterBooks(allBooks, query) : allBooks);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Filter locally on every keystroke
  useEffect(() => {
    if (!isOpen) return;
    setResults(query.trim() ? filterBooks(allBooks, query) : allBooks);
    setSelectedIndex(-1);
  }, [query, allBooks, isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('li');
      items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleSelect = (id: string) => {
    onClose();
    navigate(`/libro/${id}`);
  };

  const goToSearch = (q: string) => {
    if (!q.trim()) return;
    onClose();
    navigate(`/buscador?q=${encodeURIComponent(q.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, -1));
        break;
      case 'Enter':
        if (selectedIndex >= 0 && results[selectedIndex]) {
          // Specific book selected → go to detail
          handleSelect(results[selectedIndex].id);
        } else {
          // No selection → go to full search results page
          goToSearch(query);
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-28 px-4 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="w-full max-w-2xl bg-white dark:bg-dark-surface rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-dark-border"
            onClick={e => e.stopPropagation()}
          >
            {/* ── Input row ── */}
            <div className="relative flex items-center border-b border-gray-100 dark:border-dark-border">
              {isLoading ? (
                <div className="absolute left-5 w-5 h-5 border-2 border-mint-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-5 h-5 text-mint-500 absolute left-5" />
              )}
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar libros, autores, categorías..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-12 pr-20 py-5 text-base sm:text-lg bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none"
              />
              {/* Clear query */}
              {query && (
                <button
                  tabIndex={-1}
                  onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                  className="absolute right-12 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {/* Close modal */}
              <button
                onClick={onClose}
                className="absolute right-3 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-dark-bg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ── Results ── */}
            <div className="max-h-[55vh] overflow-y-auto">
              {results.length > 0 ? (
                <>
                  <p className="px-4 pt-3 pb-1 text-[11px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-widest">
                    {query.trim()
                      ? `${results.length} resultado${results.length !== 1 ? 's' : ''}`
                      : 'Todos los libros'}
                  </p>
                  <ul ref={listRef} className="p-2 pb-3">
                    {results.map((book, idx) => (
                      <li key={book.id}>
                        <button
                          onClick={() => handleSelect(book.id)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`w-full flex items-center gap-4 p-3 rounded-xl transition-colors text-left group ${
                            idx === selectedIndex
                              ? 'bg-mint-50 dark:bg-mint-900/25'
                              : 'hover:bg-gray-50 dark:hover:bg-dark-bg/60'
                          }`}
                        >
                          {/* Cover thumbnail */}
                          <div className="w-10 h-14 bg-gray-100 dark:bg-dark-bg rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                            {book.image ? (
                              <img
                                src={book.image}
                                alt={book.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h4
                              className={`font-semibold text-sm truncate transition-colors ${
                                idx === selectedIndex
                                  ? 'text-mint-600 dark:text-mint-400'
                                  : 'text-gray-900 dark:text-white group-hover:text-mint-600 dark:group-hover:text-mint-400'
                              }`}
                            >
                              <Highlight text={book.title} query={query} />
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                              <Highlight text={book.author} query={query} />
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] bg-mint-100 dark:bg-mint-900/40 text-mint-700 dark:text-mint-300 px-2 py-0.5 rounded-full font-medium">
                                <Highlight text={book.category} query={query} />
                              </span>
                              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                ${book.price.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Arrow */}
                          <ArrowRight
                            className={`w-4 h-4 flex-shrink-0 transition-all ${
                              idx === selectedIndex
                                ? 'text-mint-500 opacity-100 translate-x-0'
                                : 'text-gray-300 dark:text-gray-600 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0'
                            }`}
                          />
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : isLoading ? (
                <div className="p-10 text-center text-gray-400 dark:text-gray-500 text-sm">Cargando…</div>
              ) : (
                <div className="p-10 text-center">
                  <Search className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Sin resultados para &ldquo;{query}&rdquo;</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Probá con otro título, autor o categoría</p>
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="px-4 py-2.5 border-t border-gray-100 dark:border-dark-border flex items-center gap-4">
              <div className="flex items-center gap-4 text-[11px] text-gray-400 dark:text-gray-500 flex-1">
                <span className="flex items-center gap-1">
                  <kbd className="font-sans bg-gray-100 dark:bg-dark-bg px-1.5 py-0.5 rounded text-[10px] border border-gray-200 dark:border-dark-border">↑↓</kbd>
                  navegar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="font-sans bg-gray-100 dark:bg-dark-bg px-1.5 py-0.5 rounded text-[10px] border border-gray-200 dark:border-dark-border">↵</kbd>
                  abrir
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="font-sans bg-gray-100 dark:bg-dark-bg px-1.5 py-0.5 rounded text-[10px] border border-gray-200 dark:border-dark-border">Esc</kbd>
                  cerrar
                </span>
              </div>
              {query.trim() && (
                <Link
                  to={`/buscador?q=${encodeURIComponent(query.trim())}`}
                  onClick={onClose}
                  className="flex items-center gap-1 text-[11px] text-mint-500 hover:text-mint-600 font-semibold flex-shrink-0 transition-colors"
                >
                  Ver todos <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalSearch;
