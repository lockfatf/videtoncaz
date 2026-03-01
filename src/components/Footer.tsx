import { Link } from 'react-router-dom';
import LogoIcon from './LogoIcon';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
            <LogoIcon className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold text-gray-700">Vide Ton Caz</span>
          <span className="text-xs text-gray-400">· La Réunion 974</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>© 2026 Florian LOCK-FAT</span>
          <span>·</span>
          <Link to="/mentions-legales" className="hover:text-primary-600 hover:underline transition-colors">
            Mentions légales
          </Link>
        </div>
      </div>
    </footer>
  );
}
