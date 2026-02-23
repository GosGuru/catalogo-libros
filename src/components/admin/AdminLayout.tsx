import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  Tag,
  ShoppingBag,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { sileo } from 'sileo';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',   icon: <LayoutDashboard className="w-5 h-5" />, path: '/admin/dashboard'   },
  { label: 'Libros',      icon: <BookOpen        className="w-5 h-5" />, path: '/admin/libros'      },
  { label: 'Categorías',  icon: <Tag             className="w-5 h-5" />, path: '/admin/categorias'  },
  { label: 'Pedidos',     icon: <ShoppingBag     className="w-5 h-5" />, path: '/admin/pedidos'     },
];

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard':  'Dashboard',
  '/admin/libros':     'Gestión de Libros',
  '/admin/categorias': 'Gestión de Categorías',
  '/admin/pedidos':    'Pedidos',
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!sessionStorage.getItem('adminAuth')) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const currentTitle = PAGE_TITLES[location.pathname] ?? 'Admin';

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    sileo.info({ title: 'Sesión cerrada' });
    navigate('/admin');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <img
          src="/logo.jpg"
          alt="Florida"
          className="w-8 h-8 rounded-full object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
        <div>
          <p className="font-serif font-bold text-white text-sm leading-tight">Florida</p>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-mint-400 bg-mint-400/15 px-1.5 py-0.5 rounded">
            Admin
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? 'bg-mint-500 text-white shadow-lg shadow-mint-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/8'
              }`}
            >
              {item.icon}
              {item.label}
              {active && <ChevronRight className="w-4 h-4 ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950 overflow-hidden">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-gray-900 dark:bg-black border-r border-white/8">
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-56 bg-gray-900 z-50 lg:hidden flex flex-col"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main area ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="flex items-center gap-4 px-4 sm:px-6 h-14 shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-white/8 shadow-sm">
          {/* Hamburger (mobile) */}
          <button
            className="lg:hidden text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Page title */}
          <h1 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">
            {currentTitle}
          </h1>

          {/* Breadcrumb spacer */}
          <div className="flex-1" />

          {/* Admin badge */}
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-mint-600 dark:text-mint-400 bg-mint-50 dark:bg-mint-400/10 border border-mint-200 dark:border-mint-400/20 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-mint-500 animate-pulse" />
            Panel Admin
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
