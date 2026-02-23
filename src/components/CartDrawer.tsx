import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const CartDrawer = () => {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-dark-surface shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-dark-border">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-mint-500" />
                <h2 className="font-serif font-bold text-xl text-gray-900 dark:text-white">
                  Tu carrito
                </h2>
                {totalItems > 0 && (
                  <span className="bg-mint-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {totalItems}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-20">
                  <ShoppingBag className="w-16 h-16 text-gray-200 dark:text-gray-700" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Tu carrito está vacío</p>
                  <Link
                    to="/catalogo"
                    onClick={closeCart}
                    className="text-mint-500 hover:text-mint-600 font-medium flex items-center gap-1 group"
                  >
                    Explorar catálogo
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {items.map(item => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                      className="flex gap-4 bg-gray-50 dark:bg-dark-bg rounded-2xl p-3"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-14 h-20 object-cover rounded-xl flex-shrink-0 shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-serif font-semibold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.author}</p>
                        <p className="text-mint-600 dark:text-mint-400 font-bold mt-1 text-sm">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border flex items-center justify-center hover:border-mint-400 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium w-4 text-center text-gray-900 dark:text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border flex items-center justify-center hover:border-mint-400 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="ml-auto p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 dark:border-dark-border px-6 py-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="block w-full bg-mint-500 hover:bg-mint-600 text-white text-center py-4 rounded-2xl font-semibold text-lg transition-all hover:shadow-lg hover:shadow-mint-500/30 active:scale-[0.98]"
                >
                  Proceder al pago
                </Link>
                <button
                  onClick={clearCart}
                  className="w-full text-sm text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  Vaciar carrito
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
