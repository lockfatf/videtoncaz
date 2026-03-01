import { Search, SlidersHorizontal } from 'lucide-react';

interface FilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  typeFilter: 'all' | 'vide_grenier' | 'vide_maison';
  onTypeChange: (v: 'all' | 'vide_grenier' | 'vide_maison') => void;
  showPast: boolean;
  onShowPastChange: (v: boolean) => void;
  count: number;
}

export default function FilterBar({
  search, onSearchChange,
  typeFilter, onTypeChange,
  showPast, onShowPastChange,
  count,
}: FilterBarProps) {
  return (
    <div className="bg-white border-b border-gray-100 px-4 py-3">
      <div className="max-w-6xl mx-auto">
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par ville, titre..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="input-field pl-9 py-2.5 text-sm"
          />
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-gray-500 text-xs font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filtres :
          </div>

          {/* Type filter */}
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
                  typeFilter === val
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Past events toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none ml-auto">
            <span className="text-xs text-gray-600">Inclure les passés</span>
            <div
              onClick={() => onShowPastChange(!showPast)}
              className={`relative w-9 h-5 rounded-full transition-colors ${showPast ? 'bg-primary-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${showPast ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
          </label>
        </div>

        <p className="text-xs text-gray-400 mt-2">{count} événement{count !== 1 ? 's' : ''} trouvé{count !== 1 ? 's' : ''}</p>
      </div>
    </div>
  );
}
