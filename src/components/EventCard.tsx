import { Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, Phone, Tag } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Event } from '../lib/types';

interface EventCardProps {
  event: Event;
}

const TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  vide_grenier: { label: 'Vide-grenier', color: 'text-orange-700', bg: 'bg-orange-100' },
  vide_maison: { label: 'Vide-maison', color: 'text-sky-700', bg: 'bg-sky-100' },
};

export default function EventCard({ event }: EventCardProps) {
  const typeInfo = TYPE_LABELS[event.type] || TYPE_LABELS.vide_grenier;
  const formattedDate = format(parseISO(event.date), 'EEEE d MMMM yyyy', { locale: fr });
  const isPast = new Date(event.date) < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <Link to={`/evenement/${event.id}`} className="card block group">
      {/* Image or gradient placeholder */}
      <div className="relative h-36 overflow-hidden">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${
            event.type === 'vide_maison' ? 'bg-gradient-to-br from-sky-400 to-blue-600' : 'bg-gradient-to-br from-orange-400 to-primary-600'
          }`}>
            <Tag className="w-10 h-10 text-white opacity-50" />
          </div>
        )}
        {isPast && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
            <span className="bg-white text-gray-700 text-xs font-semibold px-2 py-1 rounded-full">Terminé</span>
          </div>
        )}
        <div className={`absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-full ${typeInfo.bg} ${typeInfo.color}`}>
          {typeInfo.label}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-base line-clamp-1 group-hover:text-primary-600 transition-colors">
          {event.title}
        </h3>

        {event.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{event.description}</p>
        )}

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
            <span className="capitalize">{formattedDate}</span>
          </div>

          {event.start_time && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
              <span>
                {event.start_time.slice(0, 5)}
                {event.end_time ? ` – ${event.end_time.slice(0, 5)}` : ''}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
            <span className="line-clamp-1">{event.address}, {event.city}</span>
          </div>

          {event.contact_phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
              <span>{event.contact_phone}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
