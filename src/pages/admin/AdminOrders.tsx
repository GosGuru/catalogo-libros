import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { sileo } from 'sileo';

// ─── Types ───────────────────────────────────────────────────────────────────

type Status = 'pendiente' | 'procesando' | 'enviado' | 'entregado' | 'cancelado';

interface OrderItem {
  bookId: string;
  title: string;
  price: number;
  qty: number;
}

interface Order {
  id: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: Status;
  createdAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_STATUSES: Status[] = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];

const STATUS_META: Record<Status, { label: string; cls: string }> = {
  pendiente:  { label: 'Pendiente',  cls: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-400/15 dark:text-yellow-300' },
  procesando: { label: 'Procesando', cls: 'bg-blue-100   text-blue-800   dark:bg-blue-400/15   dark:text-blue-300' },
  enviado:    { label: 'Enviado',    cls: 'bg-purple-100 text-purple-800 dark:bg-purple-400/15 dark:text-purple-300' },
  entregado:  { label: 'Entregado',  cls: 'bg-green-100  text-green-800  dark:bg-green-400/15  dark:text-green-300' },
  cancelado:  { label: 'Cancelado',  cls: 'bg-red-100    text-red-800    dark:bg-red-400/15    dark:text-red-300' },
};

// ─── Row component ────────────────────────────────────────────────────────────

function OrderRow({ order, onStatusChange }: {
  order: Order;
  onStatusChange: (id: string, status: Status) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const meta = STATUS_META[order.status];

  const handleStatus = async (newStatus: Status) => {
    setSaving(true);
    try {
      await fetch(`http://localhost:3001/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      onStatusChange(order.id, newStatus);
      sileo.success({ title: 'Estado actualizado' });
    } catch {
      sileo.error({ title: 'Error al actualizar' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <tr
        className="hover:bg-gray-50 dark:hover:bg-white/4 transition-colors cursor-pointer"
        onClick={() => setOpen(o => !o)}
      >
        <td className="px-4 py-3 text-xs font-mono text-gray-400">{order.id}</td>
        <td className="px-4 py-3">
          <p className="font-medium text-gray-900 dark:text-white text-sm">{order.customer}</p>
          <p className="text-xs text-gray-400">{order.email}</p>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 hidden sm:table-cell">
          {order.items.length} libro{order.items.length !== 1 ? 's' : ''}
        </td>
        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm">
          ${order.total.toLocaleString('es-AR')}
        </td>
        <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500 dark:text-gray-400">
          {new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${meta.cls}`}>
            {meta.label}
          </span>
        </td>
        <td className="px-4 py-3 text-gray-400">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </td>
      </tr>

      <AnimatePresence>
        {open && (
          <tr>
            <td colSpan={7} className="px-0 py-0 border-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="bg-gray-50 dark:bg-gray-900/40 px-6 py-4 space-y-4 border-y border-gray-100 dark:border-white/6">
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Dirección</p>
                      <p className="text-gray-800 dark:text-gray-200">{order.address}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Contacto</p>
                      <p className="text-gray-800 dark:text-gray-200">{order.phone}</p>
                      <p className="text-gray-500 dark:text-gray-400">{order.email}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Items</p>
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300">
                            {item.qty}× {item.title}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            ${(item.price * item.qty).toLocaleString('es-AR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase">Cambiar estado:</p>
                    <select
                      value={order.status}
                      disabled={saving}
                      onChange={e => handleStatus(e.target.value as Status)}
                      onClick={e => e.stopPropagation()}
                      className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-mint-500 disabled:opacity-50"
                    >
                      {ALL_STATUSES.map(s => (
                        <option key={s} value={s}>{STATUS_META[s].label}</option>
                      ))}
                    </select>
                    {saving && <span className="text-xs text-gray-400">Guardando...</span>}
                  </div>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── AdminOrders Page ─────────────────────────────────────────────────────────

const AdminOrders = () => {
  const [orders,     setOrders]     = useState<Order[]>([]);
  const [filter,     setFilter]     = useState<Status | 'todos'>('todos');
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/orders')
      .then(r => r.json())
      .then(data => {
        setOrders(data.sort((a: Order, b: Order) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = (id: string, status: Status) =>
    setOrders(os => os.map(o => o.id === id ? { ...o, status } : o));

  const counts = { todos: orders.length } as Record<string, number>;
  for (const s of ALL_STATUSES) counts[s] = orders.filter(o => o.status === s).length;

  const displayed = filter === 'todos' ? orders : orders.filter(o => o.status === filter);

  const tabs = [
    { key: 'todos' as const, label: 'Todos' },
    ...ALL_STATUSES.map(s => ({ key: s, label: STATUS_META[s].label })),
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-mint-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:border-mint-300 dark:hover:border-mint-500/40'
            }`}
          >
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
              filter === key
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              {counts[key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-white/8 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Cargando pedidos...</div>
        ) : displayed.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No hay pedidos en este estado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900/40">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3 hidden md:table-cell">Fecha</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/6">
                {displayed.map(order => (
                  <OrderRow key={order.id} order={order} onStatusChange={handleStatusChange} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
