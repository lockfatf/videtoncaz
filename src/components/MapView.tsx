import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Event } from '../lib/types';
import 'leaflet/dist/leaflet.css';

// Fix default icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createIcon = (type: string) => {
  const color = type === 'vide_maison' ? '#0ea5e9' : '#f97316';
  return L.divIcon({
    html: `<div style="
      width: 28px; height: 28px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 3px 10px rgba(0,0,0,0.3);
    "></div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -32],
  });
};

function FlyToSelected({ selectedId, events }: { selectedId: string | null; events: Event[] }) {
  const map = useMap();
  useEffect(() => {
    if (selectedId) {
      const event = events.find(e => e.id === selectedId);
      if (event) {
        map.flyTo([event.lat, event.lng], 15, { duration: 1 });
      }
    }
  }, [selectedId, events, map]);
  return null;
}

interface MapViewProps {
  events: Event[];
  selectedEventId?: string | null;
}

export default function MapView({ events, selectedEventId }: MapViewProps) {
  const markerRefs = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    if (selectedEventId && markerRefs.current[selectedEventId]) {
      markerRefs.current[selectedEventId].openPopup();
    }
  }, [selectedEventId]);

  // La Réunion center
  const center: [number, number] = [-21.115141, 55.536384];

  return (
    <MapContainer
      center={center}
      zoom={10}
      className="w-full h-full rounded-2xl overflow-hidden"
      style={{ minHeight: '400px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyToSelected selectedId={selectedEventId ?? null} events={events} />
      {events.map(event => (
        <Marker
          key={event.id}
          position={[event.lat, event.lng]}
          icon={createIcon(event.type)}
          ref={(ref) => {
            if (ref) markerRefs.current[event.id] = ref;
          }}
        >
          <Popup>
            <div className="min-w-[180px]">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                event.type === 'vide_maison' ? 'bg-sky-100 text-sky-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {event.type === 'vide_maison' ? 'Vide-maison' : 'Vide-grenier'}
              </span>
              <h3 className="font-semibold text-gray-900 mt-1.5 text-sm">{event.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {format(parseISO(event.date), 'EEEE d MMMM', { locale: fr })}
                {event.start_time ? ` · ${event.start_time.slice(0, 5)}` : ''}
              </p>
              <p className="text-xs text-gray-500">{event.city}</p>
              <Link
                to={`/evenement/${event.id}`}
                className="mt-2 inline-block text-xs font-semibold text-primary-600 hover:text-primary-700"
              >
                Voir le détail →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
