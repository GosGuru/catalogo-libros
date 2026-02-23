import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowRight } from 'lucide-react';
import { sileo } from 'sileo';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Contraseña hardcodeada para la primera fase
    if (password === 'florida2026') {
      sessionStorage.setItem('adminAuth', 'true');
      sileo.success({ title: 'Bienvenido', description: 'Panel de administración abierto.' });
      navigate('/admin/dashboard');
    } else {
      sileo.error({ title: 'Contraseña incorrecta', description: 'Intenta nuevamente.' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white dark:bg-dark-surface p-10 rounded-3xl shadow-2xl border border-gray-100 dark:border-dark-border"
      >
        <div>
          <div className="mx-auto h-16 w-16 bg-mint-100 dark:bg-mint-900/30 rounded-full flex items-center justify-center mb-6">
            <Lock className="h-8 w-8 text-mint-500" />
          </div>
          <h2 className="text-center text-3xl font-serif font-bold text-gray-900 dark:text-white">
            Acceso Admin
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Ingresa la contraseña para gestionar el catálogo
          </p>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            <span className="text-black-500 font-bold">Contraseña de prueba: florida2026</span>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 dark:border-dark-border placeholder-gray-500 text-gray-900 dark:text-white bg-gray-50 dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-mint-500 focus:z-10 sm:text-sm transition-colors"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-mint-500 hover:bg-mint-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mint-500 transition-all hover:shadow-lg hover:shadow-mint-500/30 active:scale-[0.98]"
            >
              Ingresar
              <span className="absolute right-0 inset-y-0 flex items-center pr-3">
                <ArrowRight className="h-5 w-5 text-mint-200 group-hover:text-white transition-colors" aria-hidden="true" />
              </span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
