import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { CreateEventForm } from '../lib/types';
import 'leaflet/dist/leaflet.css';

interface AddressSuggestion {
  label: string;
  lat: number;
  lng: number;
  city: string;
  postcode: string;
}

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const COMMUNES = [
  'Saint-Denis', 'Saint-Paul', 'Saint-Pierre', 'Le Tampon', 'Saint-Louis',
  'Saint-André', 'Saint-Benoît', 'Saint-Joseph', 'Sainte-Marie', 'Sainte-Suzanne',
  'Petite-Île', 'Saint-Philippe', 'Saint-Leu', 'Trois-Bassins', 'Les Avirons',
  "L'Étang-Salé", 'La Possession', 'Le Port', 'Bras-Panon', 'La Plaine-des-Palmistes',
  'Cilaos', 'Entre-Deux', 'Salazie',
].sort();

// Déplace la vue de la carte vers les nouvelles coordonnées
function MapFlyTo({ lat, lng, trigger }: { lat: number; lng: number; trigger: number }) {
  const map = useMap();
  useEffect(() => {
    if (trigger > 0) map.flyTo([lat, lng], 16, { duration: 1 });
  }, [trigger]);
  return null;
}

// Clic sur la carte pour repositionner manuellement
function LocationPicker({ lat, lng, onChange }: {
  lat: number; lng: number;
  onChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) { onChange(e.latlng.lat, e.latlng.lng); },
  });
  return lat && lng ? <Marker position={[lat, lng]} /> : null;
}

const defaultForm: CreateEventForm = {
  title: '', description: '', type: 'vide_grenier',
  address: '', city: 'Saint-Denis',
  lat: -21.115141, lng: 55.536384,
  date: '', start_time: '', end_time: '',
  contact_phone: '', contact_email: '',
};

export default function CreateEvent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState<CreateEventForm>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [geocodeStatus, setGeocodeStatus] = useState<'idle' | 'found' | 'notfound'>('idle');
  const [flyTrigger, setFlyTrigger] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addressBoxRef = useRef<HTMLDivElement>(null);
  const isEditing = !!id;

  useEffect(() => {
    if (!user) { navigate('/connexion'); return; }
    if (isEditing) loadEvent();
  }, [user, id]);

  const loadEvent = async () => {
    if (!id) return;
    const { data } = await supabase.from('events').select('*').eq('id', id).single();
    if (data) {
      setForm({
        title: data.title, description: data.description || '',
        type: data.type, address: data.address, city: data.city,
        lat: data.lat, lng: data.lng, date: data.date,
        start_time: data.start_time || '', end_time: data.end_time || '',
        contact_phone: data.contact_phone || '', contact_email: data.contact_email || '',
      });
      setGeocodeStatus('found');
    }
  };

  const set = (field: keyof CreateEventForm, value: string | number) =>
    setForm(f => ({ ...f, [field]: value }));

  // Fermer les suggestions si clic en dehors
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (addressBoxRef.current && !addressBoxRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Photon (Komoot) — autocomplétion basée sur OSM, excellente couverture La Réunion
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 3) { setSuggestions([]); setShowSuggestions(false); return; }
    setGeocoding(true);
    try {
      const q = encodeURIComponent(query);
      // bbox : lon_min,lat_min,lon_max,lat_max autour de La Réunion
      const url = `https://photon.komoot.io/api/?q=${q}&limit=6&lang=fr&bbox=55.21,-21.41,55.84,-20.87`;
      const res = await fetch(url);
      const data = await res.json();
      const items: AddressSuggestion[] = (data.features || []).map((f: {
        properties: { name?: string; street?: string; housenumber?: string; city?: string; postcode?: string };
        geometry: { coordinates: [number, number] };
      }) => {
        const p = f.properties;
        const parts = [p.housenumber, p.street || p.name].filter(Boolean).join(' ');
        const city = p.city || '';
        return {
          label: parts || city,
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
          city,
          postcode: p.postcode || '',
        };
      }).filter((s: AddressSuggestion) => s.label);
      setSuggestions(items);
      setShowSuggestions(items.length > 0);
    } catch (e) {
      console.error('Geocoding error:', e);
    } finally {
      setGeocoding(false);
    }
  }, []);

  const handleAddressChange = (value: string) => {
    set('address', value);
    setGeocodeStatus('idle');
    setSuggestions([]);
    if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    geocodeTimer.current = setTimeout(() => fetchSuggestions(value), 350);
  };

  const handleSelectSuggestion = (s: AddressSuggestion) => {
    // Extrait juste la partie adresse (sans ville) depuis le label
    const labelWithoutCity = s.label.replace(new RegExp(`,?\\s*${s.city}.*$`, 'i'), '').trim();
    setForm(f => ({
      ...f,
      address: labelWithoutCity || s.label,
      city: s.city || f.city,
      lat: s.lat,
      lng: s.lng,
    }));
    setSuggestions([]);
    setShowSuggestions(false);
    setGeocodeStatus('found');
    setFlyTrigger(t => t + 1);
  };

  const handleCityChange = (city: string) => {
    set('city', city);
    setGeocodeStatus('idle');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);

    const payload = {
      ...form,
      user_id: user.id,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
      contact_phone: form.contact_phone || null,
      contact_email: form.contact_email || null,
      description: form.description || null,
    };

    let err;
    if (isEditing) {
      ({ error: err } = await supabase.from('events').update(payload).eq('id', id));
    } else {
      ({ error: err } = await supabase.from('events').insert([payload]));
    }

    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/profil'), 1500);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          {isEditing ? 'Événement modifié !' : 'Événement publié !'}
        </h2>
        <p className="text-gray-500 text-sm">Redirection vers votre profil...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? "Modifier l'événement" : 'Publier un événement'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {isEditing ? 'Mettez à jour les informations.' : 'Partagez votre vide-grenier ou vide-maison avec la communauté.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Type d'événement *</label>
          <div className="grid grid-cols-2 gap-3">
            {([
              ['vide_grenier', 'Vide-grenier', 'bg-orange-50 border-orange-300 text-orange-700', 'border-gray-200 text-gray-600'],
              ['vide_maison', 'Vide-maison', 'bg-sky-50 border-sky-300 text-sky-700', 'border-gray-200 text-gray-600'],
            ] as const).map(([value, label, activeClass, inactiveClass]) => (
              <button
                key={value}
                type="button"
                onClick={() => set('type', value)}
                className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all ${form.type === value ? activeClass : inactiveClass + ' hover:border-gray-300'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Titre *</label>
          <input
            required
            className="input-field"
            placeholder="Ex: Grand vide-grenier de famille"
            value={form.title}
            onChange={e => set('title', e.target.value)}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
          <textarea
            className="input-field resize-none"
            rows={3}
            placeholder="Décrivez ce que vous vendez, ambiance, etc."
            value={form.description}
            onChange={e => set('description', e.target.value)}
          />
        </div>

        {/* Date & time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date *</label>
            <input
              required
              type="date"
              className="input-field"
              value={form.date}
              onChange={e => set('date', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Début</label>
            <input
              type="time"
              className="input-field"
              value={form.start_time}
              onChange={e => set('start_time', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fin</label>
            <input
              type="time"
              className="input-field"
              value={form.end_time}
              onChange={e => set('end_time', e.target.value)}
            />
          </div>
        </div>

        {/* Address avec autocomplétion */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Adresse *</label>
          <div className="relative" ref={addressBoxRef}>
            <div className="relative">
              <input
                required
                className="input-field pr-9"
                placeholder="Tapez votre adresse..."
                value={form.address}
                onChange={e => handleAddressChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                autoComplete="off"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {geocoding
                  ? <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
                  : geocodeStatus === 'found'
                  ? <MapPin className="w-4 h-4 text-green-500" />
                  : <MapPin className="w-4 h-4 text-gray-300" />
                }
              </div>
            </div>

            {/* Dropdown suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                {suggestions.map((s, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      className="w-full text-left px-4 py-3 text-sm hover:bg-primary-50 flex items-start gap-2 border-b border-gray-50 last:border-0 transition-colors"
                      onMouseDown={() => handleSelectSuggestion(s)}
                    >
                      <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <span className="font-medium text-gray-900">{s.label.replace(`, ${s.city}`, '')}</span>
                        <span className="text-gray-400 ml-1 text-xs">{s.postcode} {s.city}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">Tapez au moins 4 caractères pour voir les suggestions</p>
        </div>

        {/* Commune */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Commune *</label>
          <select
            required
            className="input-field"
            value={form.city}
            onChange={e => handleCityChange(e.target.value)}
          >
            {COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Status */}
        {geocodeStatus === 'found' && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 -mt-2">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            Adresse localisée — vous pouvez affiner en cliquant sur la carte.
          </div>
        )}

        {/* Map */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Position sur la carte
            <span className="text-gray-400 font-normal ml-1 text-xs">(cliquez pour affiner)</span>
          </label>
          <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: 300 }}>
            <MapContainer
              center={[form.lat, form.lng]}
              zoom={11}
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapFlyTo lat={form.lat} lng={form.lng} trigger={flyTrigger} />
              <LocationPicker
                lat={form.lat}
                lng={form.lng}
                onChange={(lat, lng) => {
                  set('lat', lat);
                  set('lng', lng);
                  setGeocodeStatus('found');
                }}
              />
            </MapContainer>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {form.lat.toFixed(5)}, {form.lng.toFixed(5)}
          </p>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Téléphone</label>
            <input
              type="tel"
              className="input-field"
              placeholder="0692 00 00 00"
              value={form.contact_phone}
              onChange={e => set('contact_phone', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="contact@email.com"
              value={form.contact_email}
              onChange={e => set('contact_email', e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {isEditing ? 'Modification...' : 'Publication...'}
            </span>
          ) : (
            isEditing ? 'Enregistrer les modifications' : "Publier l'événement"
          )}
        </button>
      </form>
    </div>
  );
}
