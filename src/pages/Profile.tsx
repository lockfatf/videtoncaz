import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Calendar, MapPin, Loader2, User } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Event } from '../lib/types';

const TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  vide_grenier: { label: 'Vide-grenier', color: 'text-orange-700', bg: 'bg-orange-100' },
  vide_maison: { label: 'Vide-maison', color: 'text-sky-700', bg: 'bg-sky-100' },
};

export default function Profile() {
  const { user, signOut } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchUserEvents();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();
    if (data) setUsername(data.username || '');
  };

  const fetchUserEvents = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    if (data) setEvents(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cet événement ?')) return;
    await supabase.from('events').delete().eq('id', id);
    setEvents(e => e.filter(ev => ev.id !== id));
  };

  const handleStatusToggle = async (event: Event) => {
    const newStatus = event.status === 'active' ? 'cancelled' : 'active';
    await supabase.from('events').update({ status: newStatus }).eq('id', event.id);
    setEvents(e => e.map(ev => ev.id === event.id ? { ...ev, status: newStatus } : ev));
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center">
              <User className="w-7 h-7 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{username || 'Mon profil'}</h2>
              <p className="text-gray-500 text-sm">{user.email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="text-sm text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* Events section */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Mes événements</h3>
        <Link to="/creer" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          Nouveau
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-7 h-7 text-primary-500 animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="card p-10 text-center">
          <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Aucun événement publié</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">Partagez votre prochain vide-grenier avec la communauté</p>
          <Link to="/creer" className="btn-primary inline-flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            Publier un événement
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(event => {
            const typeInfo = TYPE_LABELS[event.type];
            const isPast = new Date(event.date) < new Date(new Date().setHours(0, 0, 0, 0));
            return (
              <div key={event.id} className={`card p-4 ${event.status === 'cancelled' ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${event.type === 'vide_maison' ? 'bg-sky-100' : 'bg-orange-100'}`}>
                    <MapPin className={`w-5 h-5 ${event.type === 'vide_maison' ? 'text-sky-600' : 'text-orange-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeInfo.bg} ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                        <Link to={`/evenement/${event.id}`} className="block font-semibold text-gray-900 mt-1 hover:text-primary-600 transition-colors">
                          {event.title}
                        </Link>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <Link
                          to={`/modifier/${event.id}`}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span className="capitalize">
                          {format(parseISO(event.date), 'd MMM yyyy', { locale: fr })}
                        </span>
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {event.city}
                      </span>
                      {isPast && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Terminé</span>
                      )}
                      {event.status === 'cancelled' && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Annulé</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleStatusToggle(event)}
                      className={`mt-2 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors ${
                        event.status === 'active'
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {event.status === 'active' ? 'Marquer annulé' : 'Réactiver'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
