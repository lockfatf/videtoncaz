import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, Phone, Mail, User, ArrowLeft, Trash2, Pencil, Share2, Tag, Euro } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Event } from '../lib/types';
import MapView from '../components/MapView';

const TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  vide_grenier: { label: 'Vide-grenier', color: 'text-orange-700', bg: 'bg-orange-100' },
  vide_maison: { label: 'Vide-maison', color: 'text-sky-700', bg: 'bg-sky-100' },
};

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) fetchEvent(id);
  }, [id]);

  const fetchEvent = async (eventId: string) => {
    const { data, error } = await supabase
      .from('events')
      .select('*, profiles(username)')
      .eq('id', eventId)
      .single();

    if (!error && data) setEvent(data);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!event || !window.confirm('Supprimer cet événement ?')) return;
    setDeleting(true);
    await supabase.from('events').delete().eq('id', event.id);
    navigate('/profil');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié !');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <MapPin className="w-12 h-12 text-gray-300 mb-3" />
        <h2 className="text-xl font-bold text-gray-700">Événement introuvable</h2>
        <Link to="/" className="mt-4 btn-primary text-sm">Retour à l'accueil</Link>
      </div>
    );
  }

  const typeInfo = TYPE_LABELS[event.type];
  const formattedDate = format(parseISO(event.date), 'EEEE d MMMM yyyy', { locale: fr });
  const isOwner = user?.id === event.user_id;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm mb-5 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Retour
      </button>

      <div className="card">
        {/* Hero image */}
        {event.image_url ? (
          <img src={event.image_url} alt={event.title} className="w-full h-52 object-cover" />
        ) : (
          <div className={`w-full h-40 ${event.type === 'vide_maison' ? 'bg-gradient-to-br from-sky-400 to-blue-600' : 'bg-gradient-to-br from-orange-400 to-primary-600'}`} />
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeInfo.bg} ${typeInfo.color}`}>
                {typeInfo.label}
              </span>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">{event.title}</h1>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={handleShare} className="btn-secondary p-2 !px-2">
                <Share2 className="w-4 h-4" />
              </button>
              {isOwner && (
                <>
                  <Link to={`/modifier/${event.id}`} className="btn-secondary p-2 !px-2">
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="p-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {event.description && (
            <p className="text-gray-600 leading-relaxed mb-6">{event.description}</p>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-700 mb-1">
                <Calendar className="w-4 h-4 text-primary-500" />
                <span className="font-medium text-sm">Date</span>
              </div>
              <p className="text-gray-900 capitalize text-sm">{formattedDate}</p>
            </div>

            {event.start_time && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-700 mb-1">
                  <Clock className="w-4 h-4 text-primary-500" />
                  <span className="font-medium text-sm">Horaires</span>
                </div>
                <p className="text-gray-900 text-sm">
                  {event.start_time.slice(0, 5)}
                  {event.end_time ? ` – ${event.end_time.slice(0, 5)}` : ''}
                </p>
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-4 sm:col-span-2">
              <div className="flex items-center gap-2 text-gray-700 mb-1">
                <MapPin className="w-4 h-4 text-primary-500" />
                <span className="font-medium text-sm">Adresse</span>
              </div>
              <p className="text-gray-900 text-sm">{event.address}</p>
              <p className="text-gray-600 text-sm">{event.city}, La Réunion</p>
            </div>

            {event.contact_phone && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-700 mb-1">
                  <Phone className="w-4 h-4 text-primary-500" />
                  <span className="font-medium text-sm">Téléphone</span>
                </div>
                <a href={`tel:${event.contact_phone}`} className="text-primary-600 hover:underline text-sm font-medium">
                  {event.contact_phone}
                </a>
              </div>
            )}

            {event.contact_email && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-700 mb-1">
                  <Mail className="w-4 h-4 text-primary-500" />
                  <span className="font-medium text-sm">Email</span>
                </div>
                <a href={`mailto:${event.contact_email}`} className="text-primary-600 hover:underline text-sm truncate block">
                  {event.contact_email}
                </a>
              </div>
            )}

            {event.profiles?.username && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-700 mb-1">
                  <User className="w-4 h-4 text-primary-500" />
                  <span className="font-medium text-sm">Organisateur</span>
                </div>
                <p className="text-gray-900 text-sm">{event.profiles.username}</p>
              </div>
            )}
          </div>

          {/* Tags */}
          {event.tags?.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-primary-500" />
                <span className="text-sm font-semibold text-gray-700">Ce qu'on y trouve</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {event.tags.map(tag => (
                  <span key={tag} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Top articles */}
          {event.top_articles?.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Euro className="w-4 h-4 text-primary-500" />
                <span className="text-sm font-semibold text-gray-700">Articles vedettes</span>
              </div>
              <div className="space-y-3">
                {event.top_articles.map((a, i) => (
                  <div key={i} className="bg-gradient-to-br from-primary-50 to-orange-50 border border-primary-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gray-900 text-base">{a.name}</p>
                      <span className="text-xl font-bold text-primary-600 ml-4 flex-shrink-0">{a.price} €</span>
                    </div>
                    {a.description && (
                      <p className="text-sm text-gray-600 mb-3">{a.description}</p>
                    )}
                    {a.images?.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {a.images.map((url, pi) => (
                          <a key={pi} href={url} target="_blank" rel="noreferrer"
                            className="flex-shrink-0 w-28 h-28 rounded-xl overflow-hidden border border-white shadow-sm hover:shadow-md transition-shadow">
                            <img src={url} alt={`${a.name} photo ${pi + 1}`} className="w-full h-full object-cover" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mini map */}
          <div className="rounded-xl overflow-hidden" style={{ height: 280 }}>
            <MapView events={[event]} />
          </div>
        </div>
      </div>
    </div>
  );
}
