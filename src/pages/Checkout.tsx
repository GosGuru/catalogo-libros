import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, CheckCircle, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { sileo } from 'sileo';

type Step = 'info' | 'payment' | 'done';

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('info');
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    address: '', city: '', zip: '',
    card: '', expiry: '', cvv: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleOrder = () => {
    sileo.promise(
      new Promise<void>(resolve => setTimeout(resolve, 2000)),
      {
        loading: { title: 'Procesando pago...' },
        success: { title: '¡Pago exitoso!', description: 'Recibirás tu pedido pronto.' },
        error: { title: 'Error al procesar', description: 'Intenta nuevamente.' },
      }
    ).then(() => {
      clearCart();
      setStep('done');
    });
  };

  if (items.length === 0 && step !== 'done') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-200 dark:text-gray-700 mb-4" />
        <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-2">
          Tu carrito está vacío
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Agrega libros al carrito antes de hacer checkout.</p>
        <Link
          to="/catalogo"
          className="bg-mint-500 hover:bg-mint-600 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-mint-500/30"
        >
          Ir al catálogo
        </Link>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          <CheckCircle className="w-24 h-24 text-mint-500 mx-auto mb-6" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white mb-3">
            ¡Gracias por tu compra!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
            Tu pedido fue procesado con éxito. Recibirás un email de confirmación a la brevedad.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-mint-500 hover:bg-mint-600 text-white px-10 py-4 rounded-2xl font-semibold text-lg transition-all hover:shadow-lg hover:shadow-mint-500/30 active:scale-[0.98]"
          >
            Volver al inicio
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-mint-500 transition-colors mb-8 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Volver
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Form */}
        <div className="lg:col-span-3 space-y-8">
          {/* Steps indicator */}
          <div className="flex items-center gap-3">
            {(['info', 'payment'] as Step[]).map((s, idx) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step === s
                    ? 'bg-mint-500 text-white'
                    : 'bg-gray-100 dark:bg-dark-surface text-gray-400'
                }`}>
                  {idx + 1}
                </div>
                <span className={`text-sm font-medium ${step === s ? 'text-mint-600 dark:text-mint-400' : 'text-gray-400'}`}>
                  {s === 'info' ? 'Datos de envío' : 'Pago'}
                </span>
                {idx < 1 && <div className="w-12 h-px bg-gray-200 dark:bg-dark-border" />}
              </div>
            ))}
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-dark-surface rounded-3xl p-8 border border-gray-100 dark:border-dark-border shadow-sm"
          >
            {step === 'info' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Datos de envío</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Nombre completo', name: 'name', type: 'text', colSpan: 2 },
                    { label: 'Email', name: 'email', type: 'email', colSpan: 1 },
                    { label: 'Teléfono', name: 'phone', type: 'tel', colSpan: 1 },
                    { label: 'Dirección', name: 'address', type: 'text', colSpan: 2 },
                    { label: 'Ciudad', name: 'city', type: 'text', colSpan: 1 },
                    { label: 'Código Postal', name: 'zip', type: 'text', colSpan: 1 },
                  ].map(field => (
                    <div key={field.name} className={field.colSpan === 2 ? 'sm:col-span-2' : ''}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        name={field.name}
                        value={form[field.name as keyof typeof form]}
                        onChange={handleChange}
                        className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mint-500 transition-all"
                        placeholder={field.label}
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setStep('payment')}
                  className="w-full bg-mint-500 hover:bg-mint-600 text-white py-4 rounded-2xl font-semibold text-lg transition-all hover:shadow-lg hover:shadow-mint-500/30 active:scale-[0.98]"
                >
                  Continuar al pago
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Datos de pago</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Número de tarjeta
                    </label>
                    <input
                      type="text"
                      name="card"
                      value={form.card}
                      onChange={handleChange}
                      maxLength={19}
                      className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mint-500 transition-all font-mono"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Vencimiento
                      </label>
                      <input
                        type="text"
                        name="expiry"
                        value={form.expiry}
                        onChange={handleChange}
                        maxLength={5}
                        className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mint-500 transition-all font-mono"
                        placeholder="MM/AA"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={form.cvv}
                        onChange={handleChange}
                        maxLength={4}
                        className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mint-500 transition-all font-mono"
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleOrder}
                  className="w-full bg-mint-500 hover:bg-mint-600 text-white py-4 rounded-2xl font-semibold text-lg transition-all hover:shadow-lg hover:shadow-mint-500/30 active:scale-[0.98]"
                >
                  Confirmar pedido · ${totalPrice.toFixed(2)}
                </button>
                <button
                  onClick={() => setStep('info')}
                  className="w-full text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  ← Volver a datos de envío
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-dark-surface rounded-3xl p-6 border border-gray-100 dark:border-dark-border shadow-sm sticky top-24">
            <h3 className="font-serif font-bold text-xl text-gray-900 dark:text-white mb-6">Resumen del pedido</h3>
            <div className="space-y-4 mb-6">
              {items.map(item => (
                <div key={item.id} className="flex gap-3">
                  <img src={item.image} alt={item.title} className="w-12 h-16 object-cover rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{item.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">x{item.quantity}</p>
                    <p className="text-sm font-bold text-mint-600 dark:text-mint-400">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 dark:border-dark-border pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Envío</span>
                <span className="text-mint-500 font-medium">Gratis</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-dark-border">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
