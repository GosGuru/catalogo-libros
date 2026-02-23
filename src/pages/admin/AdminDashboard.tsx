import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Tag, ShoppingBag, DollarSign } from 'lucide-react';
import { BOOKS, CATEGORIES, ORDERS } from '../../lib/data';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Order {
  id: string;
  customer: string;
  total: number;
  status: string;
  createdAt: string;
  items: { bookId: string; title: string; price: number; qty: number }[];
}

type ChartPeriod = 'dia' | 'semana' | 'mes';

interface ChartBar {
  label: string;
  orders: number;
  revenue: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildChartData(orders: Order[], period: ChartPeriod): ChartBar[] {
  const now = new Date();

  if (period === 'dia') {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (29 - i));
      const key = d.toISOString().slice(0, 10);
      const matched = orders.filter(o => o.createdAt.slice(0, 10) === key);
      return {
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        orders: matched.length,
        revenue: matched.reduce((s, o) => s + o.total, 0),
      };
    });
  }

  if (period === 'semana') {
    return Array.from({ length: 12 }, (_, i) => {
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - i * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 6);
      const matched = orders.filter(o => {
        const d = new Date(o.createdAt);
        return d >= weekStart && d <= weekEnd;
      });
      return {
        label: `S${12 - i}`,
        orders: matched.length,
        revenue: matched.reduce((s, o) => s + o.total, 0),
      };
    }).reverse();
  }

  const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const matched = orders.filter(o => {
      const od = new Date(o.createdAt);
      return od.getFullYear() === d.getFullYear() && od.getMonth() === d.getMonth();
    });
    return {
      label: MONTHS[d.getMonth()],
      orders: matched.length,
      revenue: matched.reduce((s, o) => s + o.total, 0),
    };
  });
}

const STATUS_COLORS: Record<string, string> = {
  pendiente:  'bg-yellow-100 text-yellow-800 dark:bg-yellow-400/15 dark:text-yellow-300',
  procesando: 'bg-blue-100   text-blue-800   dark:bg-blue-400/15   dark:text-blue-300',
  enviado:    'bg-purple-100 text-purple-800 dark:bg-purple-400/15 dark:text-purple-300',
  entregado:  'bg-green-100  text-green-800  dark:bg-green-400/15  dark:text-green-300',
  cancelado:  'bg-red-100    text-red-800    dark:bg-red-400/15    dark:text-red-300',
};

// ─── SVG Bar Chart ────────────────────────────────────────────────────────────

function BarChart({ data, metric }: { data: ChartBar[]; metric: 'orders' | 'revenue' }) {
  const [tooltip, setTooltip] = useState<{ idx: number; x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const values = data.map(d => metric === 'orders' ? d.orders : d.revenue);
  const maxVal = Math.max(...values, 1);

  const W = 760, H = 200;
  const PAD = { top: 16, right: 8, bottom: 32, left: 48 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const gap = 4;
  const barW = Math.max(4, (chartW / data.length) - gap);

  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => maxVal * (i / ticks));

  return (
    <div className="relative overflow-x-auto">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ minWidth: data.length > 15 ? `${data.length * 28}px` : undefined }}
        onMouseLeave={() => setTooltip(null)}
      >
        {yTicks.map((tick, i) => {
          const y = PAD.top + chartH - (tick / maxVal) * chartH;
          return (
            <g key={i}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y}
                stroke="currentColor" strokeOpacity={0.08} strokeWidth={1} />
              <text x={PAD.left - 6} y={y + 4} textAnchor="end"
                fontSize={10} fill="currentColor" fillOpacity={0.45}>
                {metric === 'revenue'
                  ? tick >= 1000 ? `$${(tick / 1000).toFixed(0)}k` : `$${tick}`
                  : tick.toFixed(0)}
              </text>
            </g>
          );
        })}

        {data.map((bar, i) => {
          const val  = metric === 'orders' ? bar.orders : bar.revenue;
          const bh   = (val / maxVal) * chartH;
          const x    = PAD.left + i * (barW + gap);
          const y    = PAD.top + chartH - bh;
          return (
            <g key={i} onMouseEnter={() => setTooltip({ idx: i, x, y })} style={{ cursor: 'pointer' }}>
              <motion.rect
                initial={{ height: 0, y: PAD.top + chartH }}
                animate={{ height: bh, y }}
                transition={{ duration: 0.4, delay: i * 0.015, ease: 'easeOut' }}
                x={x} width={barW} rx={3}
                fill="url(#barGrad)"
              />
              {(data.length <= 12 || i % Math.ceil(data.length / 12) === 0) && (
                <text x={x + barW / 2} y={PAD.top + chartH + 18}
                  textAnchor="middle" fontSize={9}
                  fill="currentColor" fillOpacity={0.45}>
                  {bar.label}
                </text>
              )}
            </g>
          );
        })}

        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#40C4A7" stopOpacity={0.95} />
            <stop offset="100%" stopColor="#40C4A7" stopOpacity={0.40} />
          </linearGradient>
        </defs>
      </svg>

      {tooltip !== null && (
        <div
          className="absolute pointer-events-none bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 shadow-xl"
          style={{
            left: `${(tooltip.x / W) * 100}%`,
            top:  `${(tooltip.y / H) * 100}%`,
            transform: 'translate(-50%, -110%)',
          }}
        >
          <p className="font-semibold">{data[tooltip.idx].label}</p>
          <p>{data[tooltip.idx].orders} pedido{data[tooltip.idx].orders !== 1 ? 's' : ''}</p>
          <p>${data[tooltip.idx].revenue.toLocaleString('es-AR')}</p>
        </div>
      )}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  icon, label, value, sub, color,
}: {
  icon: React.ReactNode; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-white/8 shadow-sm flex items-start gap-4"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const orders   = ORDERS as Order[];
  const bookCount = BOOKS.length;
  const catCount  = CATEGORIES.length;
  const [period,    setPeriod]    = useState<ChartPeriod>('mes');
  const [metric,    setMetric]    = useState<'orders' | 'revenue'>('orders');
  const loading   = false;

  const now = new Date();
  const thisMonth = orders.filter(o => {
    const d = new Date(o.createdAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const monthRevenue = thisMonth.reduce((s, o) => s + o.total, 0);

  const chartData = buildChartData(orders, period);
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const PERIODS: { key: ChartPeriod; label: string }[] = [
    { key: 'dia',    label: 'Por Día'    },
    { key: 'semana', label: 'Por Semana' },
    { key: 'mes',    label: 'Por Mes'    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<BookOpen className="w-5 h-5 text-mint-500" />}
          label="Total libros" value={bookCount.toString()}
          sub="En catálogo"
          color="bg-mint-50 dark:bg-mint-400/10"
        />
        <KpiCard
          icon={<Tag className="w-5 h-5 text-violet-500" />}
          label="Categorías" value={catCount.toString()}
          color="bg-violet-50 dark:bg-violet-400/10"
        />
        <KpiCard
          icon={<ShoppingBag className="w-5 h-5 text-blue-500" />}
          label="Pedidos este mes" value={thisMonth.length.toString()}
          color="bg-blue-50 dark:bg-blue-400/10"
        />
        <KpiCard
          icon={<DollarSign className="w-5 h-5 text-green-500" />}
          label="Ingresos este mes"
          value={`$${monthRevenue.toLocaleString('es-AR')}`}
          color="bg-green-50 dark:bg-green-400/10"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-white/8 shadow-sm p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white text-base">Actividad de Pedidos</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden text-xs font-medium">
              {(['orders', 'revenue'] as const).map((m) => (
                <button key={m} onClick={() => setMetric(m)}
                  className={`px-3 py-1.5 transition-colors ${metric === m
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                  {m === 'orders' ? 'Pedidos' : 'Ingresos'}
                </button>
              ))}
            </div>
            <div className="flex rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden text-xs font-medium">
              {PERIODS.map(({ key, label }) => (
                <button key={key} onClick={() => setPeriod(key)}
                  className={`px-3 py-1.5 transition-colors ${period === key
                    ? 'bg-mint-500 text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <BarChart data={chartData} metric={metric} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-white/8 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/8">
          <h2 className="font-semibold text-gray-900 dark:text-white text-base">Pedidos Recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900/40">
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Items</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/6">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/4 transition-colors">
                  <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">{order.customer}</td>
                  <td className="px-6 py-3 text-gray-500 dark:text-gray-400">
                    {order.items.length} libro{order.items.length !== 1 ? 's' : ''}
                  </td>
                  <td className="px-6 py-3 font-semibold text-gray-900 dark:text-white">
                    ${order.total.toLocaleString('es-AR')}
                  </td>
                  <td className="px-6 py-3 text-gray-500 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[order.status] ?? ''}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
