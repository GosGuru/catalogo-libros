import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, X, Save } from 'lucide-react';
import { sileo } from 'sileo';
import { API } from '../../lib/api';
import { BOOKS, CATEGORIES } from '../../lib/data';

// ─── Types ───────────────────────────────────────────────────────────────────

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

interface Category {
  id: string;
  name: string;
}

const EMPTY_BOOK: Omit<Book, 'id'> = {
  title: '', author: '', price: 0,
  coverType: 'Tapa Blanda', category: '',
  description: '', image: '',
};

// ─── Book Modal ───────────────────────────────────────────────────────────────

interface ModalProps {
  book: Partial<Book> | null;
  categories: Category[];
  onSave: (data: Omit<Book, 'id'>) => Promise<void>;
  onClose: () => void;
}

function BookModal({ book, categories, onSave, onClose }: ModalProps) {
  const [form, setForm] = useState<Omit<Book, 'id'>>({
    title:       book?.title       ?? EMPTY_BOOK.title,
    author:      book?.author      ?? EMPTY_BOOK.author,
    price:       book?.price       ?? EMPTY_BOOK.price,
    coverType:   book?.coverType   ?? EMPTY_BOOK.coverType,
    category:    book?.category    ?? EMPTY_BOOK.category,
    description: book?.description ?? EMPTY_BOOK.description,
    image:       book?.image       ?? EMPTY_BOOK.image,
  });
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form, v: string | number) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim()) {
      sileo.error({ title: 'Título y autor son obligatorios' });
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const Field = ({
    label, value, onChange, type = 'text', options,
  }: {
    label: string; value: string | number; onChange: (v: string) => void;
    type?: string; options?: string[];
  }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">{label}</label>
      {options ? (
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint-500"
        >
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          rows={3}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint-500 resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint-500"
        />
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 320 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/8">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {book?.id ? 'Editar Libro' : 'Nuevo Libro'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Field label="Título"      value={form.title}  onChange={v => set('title', v)} />
          <Field label="Autor"       value={form.author} onChange={v => set('author', v)} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Precio (ARS)" value={form.price} type="number" onChange={v => set('price', parseFloat(v) || 0)} />
            <Field label="Tipo de tapa" value={form.coverType}
              options={['Tapa Blanda', 'Tapa Dura']}
              onChange={v => set('coverType', v)} />
          </div>
          <Field label="Categoría" value={form.category}
            options={['', ...categories.map(c => c.name)]}
            onChange={v => set('category', v)} />
          <Field label="URL de imagen" value={form.image} onChange={v => set('image', v)} />
          {form.image && (
            <img src={form.image} alt="preview"
              className="w-16 h-24 object-cover rounded-lg border border-gray-100 dark:border-white/8"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          )}
          <Field label="Descripción" value={form.description} type="textarea" onChange={v => set('description', v)} />

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-mint-500 hover:bg-mint-600 text-white transition-colors disabled:opacity-50">
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── AdminBooks Page ──────────────────────────────────────────────────────────

const AdminBooks = () => {
  const [books,      setBooks]      = useState<Book[]>(BOOKS as Book[]);
  const categories = CATEGORIES as Category[];
  const [query,      setQuery]      = useState('');
  const [catFilter,  setCatFilter]  = useState('');
  const [modal,      setModal]      = useState<Partial<Book> | null | false>(false);
  const loading = false;

  const filtered = books.filter(b => {
    const q = query.toLowerCase();
    const matchQ = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
    const matchC = !catFilter || b.category === catFilter;
    return matchQ && matchC;
  });

  const handleSave = async (data: Omit<Book, 'id'>) => {
    const editing = modal && (modal as Book).id;
    try {
      if (editing) {
        const res = await fetch(`${API}/books/${(modal as Book).id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...(modal as Book), ...data }),
        });
        const updated = await res.json();
        setBooks(bs => bs.map(b => b.id === updated.id ? updated : b));
        sileo.success({ title: 'Libro actualizado' });
      } else {
        const nextId = String(Math.max(0, ...books.map(b => parseInt(b.id) || 0)) + 1);
        const res = await fetch(`${API}/books`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: nextId, ...data }),
        });
        const created = await res.json();
        setBooks(bs => [...bs, created]);
        sileo.success({ title: 'Libro creado' });
      }
      setModal(false);
    } catch {
      sileo.error({ title: 'Error al guardar' });
    }
  };

  const handleDelete = async (book: Book) => {
    if (!window.confirm(`¿Eliminar "${book.title}"?`)) return;
    try {
      await fetch(`${API}/books/${book.id}`, { method: 'DELETE' });
      setBooks(bs => bs.filter(b => b.id !== book.id));
      sileo.success({ title: 'Libro eliminado' });
    } catch {
      sileo.error({ title: 'Error al eliminar' });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" placeholder="Buscar por título o autor..."
            value={query} onChange={e => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-mint-500"
          />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-mint-500">
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <button
          onClick={() => setModal({})}
          className="flex items-center gap-2 bg-mint-500 hover:bg-mint-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap">
          <Plus className="w-4 h-4" />
          Nuevo Libro
        </button>
      </div>

      {/* Count */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {filtered.length} libro{filtered.length !== 1 ? 's' : ''} {catFilter || query ? 'encontrados' : 'en catálogo'}
      </p>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-white/8 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900/40">
                  <th className="px-4 py-3">Libro</th>
                  <th className="px-4 py-3 hidden md:table-cell">Categoría</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Tapa</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/6">
                {filtered.map(book => (
                  <tr key={book.id} className="hover:bg-gray-50 dark:hover:bg-white/4 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={book.image} alt={book.title}
                          className="w-8 h-12 object-cover rounded bg-gray-100 dark:bg-gray-700 shrink-0"
                          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{book.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{book.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-mint-50 dark:bg-mint-400/10 text-mint-700 dark:text-mint-400">
                        {book.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-xs text-gray-500 dark:text-gray-400">{book.coverType}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                      ${book.price.toLocaleString('es-AR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setModal(book)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-400/10 transition-colors" title="Editar">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(book)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors" title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal !== false && (
          <BookModal
            book={modal || null}
            categories={categories}
            onSave={handleSave}
            onClose={() => setModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBooks;
