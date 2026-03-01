import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Plus, User, LogOut, LogIn, Home } from 'lucide-react';
import LogoIcon from './LogoIcon';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-primary-100 text-primary-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-primary-600 transition-colors">
              <LogoIcon className="w-6 h-6" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-gray-900 text-lg leading-tight">Vide Ton Caz</span>
              <div className="text-xs text-gray-400 -mt-0.5">La Réunion 974</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className={linkClass('/')}>
              <Home className="w-4 h-4" />
              Accueil
            </Link>
            {user ? (
              <>
                <Link to="/creer" className={linkClass('/creer')}>
                  <Plus className="w-4 h-4" />
                  Publier
                </Link>
                <Link to="/profil" className={linkClass('/profil')}>
                  <User className="w-4 h-4" />
                  Mon profil
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/connexion" className={linkClass('/connexion')}>
                  <LogIn className="w-4 h-4" />
                  Connexion
                </Link>
                <Link to="/inscription" className="btn-primary flex items-center gap-2 text-sm ml-1">
                  <Plus className="w-4 h-4" />
                  Publier un événement
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 space-y-1">
            <Link to="/" className={linkClass('/')} onClick={() => setMenuOpen(false)}>
              <Home className="w-4 h-4" />
              Accueil
            </Link>
            {user ? (
              <>
                <Link to="/creer" className={linkClass('/creer')} onClick={() => setMenuOpen(false)}>
                  <Plus className="w-4 h-4" />
                  Publier un événement
                </Link>
                <Link to="/profil" className={linkClass('/profil')} onClick={() => setMenuOpen(false)}>
                  <User className="w-4 h-4" />
                  Mon profil
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/connexion" className={linkClass('/connexion')} onClick={() => setMenuOpen(false)}>
                  <LogIn className="w-4 h-4" />
                  Connexion
                </Link>
                <Link
                  to="/inscription"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-primary-500 text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  <Plus className="w-4 h-4" />
                  Créer un compte
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
