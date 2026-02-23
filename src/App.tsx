import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'sileo'
import Layout from './components/Layout'
import AdminLayout from './components/admin/AdminLayout'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import BookDetail from './pages/BookDetail'
import Favorites from './pages/Favorites'
import Checkout from './pages/Checkout'
import SearchResults from './pages/SearchResults'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminBooks from './pages/admin/AdminBooks'
import AdminCategories from './pages/admin/AdminCategories'
import AdminOrders from './pages/admin/AdminOrders'
import CartDrawer from './components/CartDrawer'
import { useTheme } from './context/ThemeContext'

function ThemedToaster() {
  const { theme } = useTheme()
  return <Toaster position="top-center" theme={theme as 'light' | 'dark'} />
}

// ── Main site (with Navbar + Footer) ────────────────────────────────────────
function MainSite() {
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/libro/:id" element={<BookDetail />} />
          <Route path="/favoritos" element={<Favorites />} />
          <Route path="/buscador" element={<SearchResults />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </AnimatePresence>
      <CartDrawer />
    </Layout>
  )
}

// ── Admin section (sidebar layout, no Navbar/Footer) ────────────────────────
function AdminSection() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="libros"    element={<AdminBooks />} />
        <Route path="categorias" element={<AdminCategories />} />
        <Route path="pedidos"   element={<AdminOrders />} />
      </Routes>
    </AdminLayout>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Standalone admin login */}
        <Route path="/admin" element={<AdminLogin />} />
        {/* Admin panel with sidebar */}
        <Route path="/admin/*" element={<AdminSection />} />
        {/* Main public site */}
        <Route path="/*" element={<MainSite />} />
      </Routes>
      <ThemedToaster />
    </Router>
  )
}

export default App
