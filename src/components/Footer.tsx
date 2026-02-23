import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-50 dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border py-12 mt-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-serif font-bold text-2xl text-mint-500 mb-4">Florida</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Tienda de libros. EST 22.07.19.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Enlaces</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-mint-500 dark:hover:text-mint-400 transition-colors text-sm">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/catalogo" className="text-gray-600 dark:text-gray-400 hover:text-mint-500 dark:hover:text-mint-400 transition-colors text-sm">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link to="/favoritos" className="text-gray-600 dark:text-gray-400 hover:text-mint-500 dark:hover:text-mint-400 transition-colors text-sm">
                  Favoritos
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Admin</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/admin" className="text-gray-600 dark:text-gray-400 hover:text-mint-500 dark:hover:text-mint-400 transition-colors text-sm">
                  Panel de Administración
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-dark-border text-center">
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Florida Tienda de Libros. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
