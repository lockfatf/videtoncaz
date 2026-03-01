import { useState, useEffect, useMemo } from 'react';
import { MapPin, List, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Event } from '../lib/types';
import EventCard from '../components/EventCard';
import FilterBar from '../components/FilterBar';
import MapView from '../components/MapView';

type ViewMode = 'map' | 'list';

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'vide_grenier' | 'vide_maison'>('all');
  const [showPast, setShowPast] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('events')
      .select('*, profiles(username)')
      .eq('status', 'active')
      .order('date', { ascending: true });

    if (!error && data) setEvents(data);
    setLoading(false);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filtered = useMemo(() => {
    return events.filter(e => {
      const eventDate = new Date(e.date);
      if (!showPast && eventDate < today) return false;
      if (typeFilter !== 'all' && e.type !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          e.city.toLowerCase().includes(q) ||
          e.address.toLowerCase().includes(q) ||
          (e.description || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [events, search, typeFilter, showPast]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        showPast={showPast}
        onShowPastChange={setShowPast}
        count={filtered.length}
      />

      {/* View toggle */}
      <div className="bg-white px-4 py-2 flex items-center justify-between border-b border-gray-100">
        <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-all ${
              viewMode === 'map' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Carte
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-all ${
              viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Liste
          </button>
        </div>
        <div className="flex gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-orange-400 inline-block"></span>
            Vide-grenier
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-sky-400 inline-block"></span>
            Vide-maison
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Chargement des événements...</p>
          </div>
        </div>
      ) : viewMode === 'map' ? (
        <div className="flex flex-1 overflow-hidden">
          {/* Map */}
          <div className="flex-1 relative">
            <MapView events={filtered} selectedEventId={selectedEventId} />
          </div>

          {/* Side list on large screens */}
          <div className="hidden lg:flex flex-col w-80 xl:w-96 bg-gray-50 border-l border-gray-100 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <MapPin className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm font-medium">Aucun événement trouvé</p>
                <p className="text-gray-400 text-xs mt-1">Modifiez vos filtres ou revenez plus tard</p>
              </div>
            ) : (
              <div className="p-3 space-y-3">
                {filtered.map(event => (
                  <div
                    key={event.id}
                    onMouseEnter={() => setSelectedEventId(event.id)}
                    onMouseLeave={() => setSelectedEventId(null)}
                    className={`transition-all rounded-2xl ${selectedEventId === event.id ? 'ring-2 ring-primary-400' : ''}`}
                  >
                    <EventCard event={event} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <MapPin className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">Aucun événement trouvé</p>
              <p className="text-gray-400 text-sm mt-1">Modifiez vos filtres ou revenez plus tard</p>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto px-4 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
