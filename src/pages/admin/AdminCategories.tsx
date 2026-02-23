import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Check, X, Tag } from 'lucide-react';
import { sileo } from 'sileo';import { API } from '../../lib/api';
interface Category {
  id: string;
  name: string;
}

interface Book {
  id: string;
  category: string;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [books,      setBooks]      = useState<Book[]>([]);
  const [newName,    setNewName]    = useState('');
  const [editId,     setEditId]     = useState<string | null>(null);
  const [editName,   setEditName]   = useState('');
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, bRes] = await Promise.all([
          fetch(`${API}/categories`),
          fetch(`${API}/books?_fields=id,category`),
        ]);
        setCategories(await cRes.json());
        setBooks(await bRes.json());
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const bookCount = (catName: string) =>
    books.filter(b => b.category === catName).length;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    if (categories.find(c => c.name.toLowerCase() === name.toLowerCase())) {
      sileo.error({ title: 'Ya existe esa categoría' });
      return;
    }
    try {
      const nextId = String(Math.max(0, ...categories.map(c => parseInt(c.id) || 0)) + 1);
      const res = await fetch(`${API}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: nextId, name }),
      });
      const created = await res.json();
      setCategories(cs => [...cs, created]);
      setNewName('');
      sileo.success({ title: 'Categoría creada' });
    } catch {
      sileo.error({ title: 'Error al crear' });
    }
  };

  const handleRename = async (cat: Category) => {
    const name = editName.trim();
    if (!name || name === cat.name) { setEditId(null); return; }
    try {
      await fetch(`${API}/categories/${cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...cat, name }),
      });
      setCategories(cs => cs.map(c => c.id === cat.id ? { ...c, name } : c));
      setEditId(null);
      sileo.success({ title: 'Categoría renombrada' });
    } catch {
      sileo.error({ title: 'Error al renombrar' });
    }
  };

  const handleDelete = async (cat: Category) => {
    const count = bookCount(cat.name);
    if (count > 0) {
      sileo.error({
        title: 'No se puede eliminar',
        description: `Hay ${count} libro${count !== 1 ? 's' : ''} en esta categoría.`,
      });
      return;
    }
    if (!window.confirm(`¿Eliminar la categoría "${cat.name}"?`)) return;
    try {
      await fetch(`${API}/categories/${cat.id}`, { method: 'DELETE' });
      setCategories(cs => cs.filter(c => c.id !== cat.id));
      sileo.success({ title: 'Categoría eliminada' });
    } catch {
      sileo.error({ title: 'Error al eliminar' });
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Add form */}
      <form onSubmit={handleAdd} className="flex gap-3">
        <input
          type="text" placeholder="Nombre de nueva categoría..."
          value={newName} onChange={e => setNewName(e.target.value)}
          className="flex-1 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-mint-500"
        />
        <button type="submit"
          className="flex items-center gap-2 bg-mint-500 hover:bg-mint-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Añadir
        </button>
      </form>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        {categories.length} categor{categories.length !== 1 ? 'ías' : 'ía'}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {categories.map(cat => {
            const count = bookCount(cat.name);
            const isEditing = editId === cat.id;
            return (
              <motion.div
                key={cat.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-white/8 shadow-sm p-4 flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-mint-50 dark:bg-mint-400/10 flex items-center justify-center shrink-0">
                  <Tag className="w-4 h-4 text-mint-500" />
                </div>

                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        autoFocus
                        type="text" value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleRename(cat);
                          if (e.key === 'Escape') setEditId(null);
                        }}
                        className="flex-1 min-w-0 text-sm font-medium rounded-lg border border-mint-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-0.5 focus:outline-none"
                      />
                      <button onClick={() => handleRename(cat)} className="text-green-500 hover:text-green-600 p-0.5">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditId(null)} className="text-gray-400 hover:text-gray-600 p-0.5">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{cat.name}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {count} libro{count !== 1 ? 's' : ''}
                  </p>
                </div>

                {!isEditing && (
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => { setEditId(cat.id); setEditName(cat.name); }}
                      className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-400/10 transition-colors" title="Renombrar">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        count > 0
                          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                          : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-400/10'
                      }`} title={count > 0 ? `${count} libros en esta categoría` : 'Eliminar'}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminCategories;
