import { Search, SlidersHorizontal, CalendarDays, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface FilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  typeFilter: 'all' | 'vide_grenier' | 'vide_maison';
  onTypeChange: (v: 'all' | 'vide_grenier' | 'vide_maison') => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  onResetDates: () => void;
  count: number;
}

export default function FilterBar({
  search, onSearchChange,
  typeFilter, onTypeChange,
  dateFrom, dateTo,
  onDateFromChange, onDateToChange, onResetDates,
  count,
}: FilterBarProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const hasCustomDates = dateFrom !== today || dateTo !== '';

  return (
    <div className="bg-white border-b border-gray-100 px-4 py-3">
      <div className="max-w-6xl mx-auto space-y-3">

        {/* Ligne 1 : Recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Ville, titre, catégorie, article (ex: frigo, vélo, meuble...)"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="input-field pl-9 py-2.5 text-sm"
          />
        </div>

        {/* Ligne 2 : Filtres type + dates */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-gray-400 text-xs font-medium flex-shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>

          {/* Type */}
          <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
            {([
              ['all', 'Tous'],
              ['vide_grenier', 'Vide-grenier'],
              ['vide_maison', 'Vide-maison'],
            ] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => onTypeChange(val)}
                className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all ${
                  typeFilter === val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Dates */}
          <div className="flex items-center gap-1.5 ml-auto">
            <CalendarDays className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <div className="flex items-center gap-1">
              <div className="relative">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => onDateFromChange(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent cursor-pointer"
                  title="Date de début"
                />
              </div>
              <span className="text-xs text-gray-400">→</span>
              <div className="relative">
                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom}
                  onChange={e => onDateToChange(e.target.value)}
                  placeholder="Sans limite"
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent cursor-pointer"
                  title="Date de fin (optionnel)"
                />
              </div>
            </div>
            {hasCustomDates && (
              <button
                onClick={onResetDates}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title="Réinitialiser les dates"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Compteur */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {count} événement{count !== 1 ? 's' : ''} trouvé{count !== 1 ? 's' : ''}
            {dateFrom && (
              <span className="ml-1 text-primary-500 font-medium">
                · À partir du {format(new Date(dateFrom + 'T00:00:00'), 'd MMM', { locale: fr })}
                {dateTo ? ` jusqu'au ${format(new Date(dateTo + 'T00:00:00'), 'd MMM yyyy', { locale: fr })}` : ''}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
