import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Loader2, CheckCircle, X, Navigation, Tag, Plus, Trash2, Euro, Camera, ImageOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { CreateEventForm, TopArticle } from '../lib/types';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Bounding box La Réunion
const RE_BOUNDS = { minLat: -21.41, maxLat: -20.87, minLng: 55.21, maxLng: 55.84 };
const inReunion = (lat: number, lng: number) =>
  lat > RE_BOUNDS.minLat && lat < RE_BOUNDS.maxLat &&
  lng > RE_BOUNDS.minLng && lng < RE_BOUNDS.maxLng;

interface Suggestion {
  label: string;
  street: string;
  city: string;
  postcode: string;
  lat: number;
  lng: number;
}

const TAGS = [
  'Meubles', 'Vêtements adultes', 'Vêtements enfants', 'Chaussures', 'Sacs',
  'Livres', 'Jouets', 'Jeux vidéo', 'Électronique', 'Électroménager',
  'Décoration', 'Vaisselle', 'Outillage', 'Jardin', 'Vélos & sport',
  'Informatique', 'Téléphones', 'Montres & bijoux', 'Tableaux & art',
  'Literie', 'Puériculture', 'Voiture & auto', 'Divers',
];

const COMMUNES = [
  'Saint-Denis','Saint-Paul','Saint-Pierre','Le Tampon','Saint-Louis',
  'Saint-André','Saint-Benoît','Saint-Joseph','Sainte-Marie','Sainte-Suzanne',
  'Petite-Île','Saint-Philippe','Saint-Leu','Trois-Bassins','Les Avirons',
  "L'Étang-Salé",'La Possession','Le Port','Bras-Panon','La Plaine-des-Palmistes',
  'Cilaos','Entre-Deux','Salazie',
].sort();

// Déplace la carte vers les nouvelles coords
function FlyTo({ lat, lng, zoom = 16 }: { lat: number; lng: number; zoom?: number }) {
  const map = useMap();
  const prev = useRef('');
  useEffect(() => {
    const key = `${lat},${lng}`;
    if (key !== prev.current && inReunion(lat, lng)) {
      map.flyTo([lat, lng], zoom, { duration: 0.8 });
      prev.current = key;
    }
  }, [lat, lng]);
  return null;
}

// Clic sur carte = repositionne le repère
function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({ click: e => onChange(e.latlng.lat, e.latlng.lng) });
  return null;
}

const defaultForm: CreateEventForm = {
  title: '', description: '', type: 'vide_grenier',
  address: '', city: 'Saint-Denis',
  lat: -21.115141, lng: 55.536384,
  date: '', start_time: '', end_time: '',
  contact_phone: '', contact_email: '',
  tags: [], top_articles: [],
};

export default function CreateEvent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState<CreateEventForm>(defaultForm);
  const [addressQuery, setAddressQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [pinPlaced, setPinPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const isEditing = !!id;

  useEffect(() => {
    if (!user) { navigate('/connexion'); return; }
    if (isEditing) loadEvent();
  }, [user, id]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node))
        setShowSuggestions(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

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
        tags: data.tags || [], top_articles: data.top_articles || [],
      });
      setAddressQuery(`${data.address}, ${data.city}`);
      setPinPlaced(true);
    }
  };

  const set = (field: keyof CreateEventForm, value: string | number) =>
    setForm(f => ({ ...f, [field]: value }));

  const toggleTag = (tag: string) =>
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
    }));

  const addArticle = () =>
    setForm(f => ({ ...f, top_articles: [...f.top_articles, { name: '', price: 0, description: '', images: [] }] }));

  const updateArticle = (i: number, field: keyof TopArticle, value: string | number | string[]) =>
    setForm(f => ({
      ...f,
      top_articles: f.top_articles.map((a, idx) => idx === i ? { ...a, [field]: value } : a),
    }));

  const removeArticle = (i: number) =>
    setForm(f => ({ ...f, top_articles: f.top_articles.filter((_, idx) => idx !== i) }));

  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null); // "articleIndex-photoSlot"

  const handlePhotoUpload = async (articleIdx: number, file: File) => {
    if (!user) return;
    const article = form.top_articles[articleIdx];
    if (article.images.length >= 3) return;
    const key = `${articleIdx}`;
    setUploadingPhoto(key);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}-${articleIdx}.${ext}`;
      const { error } = await supabase.storage.from('article-images').upload(path, file, { upsert: true });
      if (!error) {
        const { data } = supabase.storage.from('article-images').getPublicUrl(path);
        updateArticle(articleIdx, 'images', [...article.images, data.publicUrl]);
      }
    } finally {
      setUploadingPhoto(null);
    }
  };

  const removePhoto = async (articleIdx: number, photoIdx: number) => {
    const article = form.top_articles[articleIdx];
    const url = article.images[photoIdx];
    // Extraire le path depuis l'URL publique
    const path = url.split('/article-images/')[1];
    if (path) await supabase.storage.from('article-images').remove([path]);
    updateArticle(articleIdx, 'images', article.images.filter((_, i) => i !== photoIdx));
  };

  // Recherche via BAN (Base Adresse Nationale — couvre La Réunion 974)
  const search = useCallback(async (q: string) => {
    if (q.trim().length < 3) { setSuggestions([]); return; }
    setSearching(true);
    try {
      // On ajoute "réunion" pour orienter la recherche
      const encoded = encodeURIComponent(`${q} réunion`);
      const res = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encoded}&limit=6&autocomplete=1`
      );
      const json = await res.json();
      const items: Suggestion[] = (json.features || [])
        .map((f: {
          properties: { label: string; name: string; city: string; postcode: string };
          geometry: { coordinates: [number, number] };
        }) => ({
          label: f.properties.label,
          street: f.properties.name,
          city: f.properties.city || '',
          postcode: f.properties.postcode || '',
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
        }))
        .filter((s: Suggestion) => inReunion(s.lat, s.lng));
      setSuggestions(items);
      setShowSuggestions(items.length > 0);
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleQueryChange = (v: string) => {
    setAddressQuery(v);
    setPinPlaced(false);
    setSuggestions([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(v), 350);
  };

  const handleSelect = (s: Suggestion) => {
    setAddressQuery(s.label);
    setForm(f => ({
      ...f,
      address: s.street,
      city: COMMUNES.includes(s.city) ? s.city : (f.city),
      lat: s.lat,
      lng: s.lng,
    }));
    setSuggestions([]);
    setShowSuggestions(false);
    setPinPlaced(true);
  };

  const handleMapClick = (lat: number, lng: number) => {
    set('lat', lat);
    set('lng', lng);
    setPinPlaced(true);
  };

  const handleClear = () => {
    setAddressQuery('');
    setSuggestions([]);
    setPinPlaced(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!pinPlaced) { setError("Veuillez localiser l'adresse sur la carte."); return; }
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
    const { error: err } = isEditing
      ? await supabase.from('events').update(payload).eq('id', id)
      : await supabase.from('events').insert([payload]);
    setLoading(false);
    if (err) setError(err.message);
    else { setSuccess(true); setTimeout(() => navigate('/profil'), 1500); }
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
        <p className="text-gray-500 text-sm">Redirection...</p>
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
          <label className="block text-sm font-semibold text-gray-700 mb-2">Type *</label>
          <div className="grid grid-cols-2 gap-3">
            {([
              ['vide_grenier', 'Vide-grenier', 'bg-orange-50 border-orange-300 text-orange-700'],
              ['vide_maison', 'Vide-maison', 'bg-sky-50 border-sky-300 text-sky-700'],
            ] as const).map(([val, label, active]) => (
              <button key={val} type="button" onClick={() => set('type', val)}
                className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all ${form.type === val ? active : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Titre */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Titre *</label>
          <input required className="input-field"
            placeholder="Ex: Grand vide-grenier de famille"
            value={form.title} onChange={e => set('title', e.target.value)} />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
          <textarea className="input-field resize-none" rows={3}
            placeholder="Ce que vous vendez, ambiance, etc."
            value={form.description} onChange={e => set('description', e.target.value)} />
        </div>

        {/* Date & Horaires */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-3 sm:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date *</label>
            <input required type="date" className="input-field"
              value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Début</label>
            <input type="time" className="input-field"
              value={form.start_time} onChange={e => set('start_time', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fin</label>
            <input type="time" className="input-field"
              value={form.end_time} onChange={e => set('end_time', e.target.value)} />
          </div>
        </div>

        {/* === ADRESSE + CARTE === */}
        <div className="bg-gray-50 rounded-2xl p-4 space-y-3 border border-gray-100">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-semibold text-gray-700">Localisation *</span>
            {pinPlaced && (
              <span className="ml-auto flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                <MapPin className="w-3 h-3" /> Localisé
              </span>
            )}
          </div>

          {/* Champ de recherche d'adresse */}
          <div className="relative" ref={searchBoxRef}>
            <div className="relative flex items-center">
              <MapPin className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                className="input-field pl-9 pr-9 bg-white"
                placeholder="Recherchez votre adresse..."
                value={addressQuery}
                onChange={e => handleQueryChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                autoComplete="off"
              />
              <div className="absolute right-3 flex items-center">
                {searching
                  ? <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />
                  : addressQuery && (
                    <button type="button" onClick={handleClear}
                      className="text-gray-400 hover:text-gray-600 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )
                }
              </div>
            </div>

            {/* Dropdown suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                {suggestions.map((s, i) => (
                  <li key={i}>
                    <button type="button"
                      className="w-full text-left px-4 py-3 hover:bg-primary-50 flex items-start gap-3 border-b border-gray-50 last:border-0 transition-colors"
                      onMouseDown={() => handleSelect(s)}>
                      <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{s.street}</div>
                        <div className="text-xs text-gray-400">{s.postcode} {s.city}</div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Aucun résultat */}
            {!searching && addressQuery.length >= 3 && suggestions.length === 0 && !showSuggestions && !pinPlaced && (
              <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                <span>Adresse non trouvée — cliquez directement sur la carte ci-dessous</span>
              </p>
            )}
          </div>

          {/* Commune */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Commune *</label>
            <select required className="input-field bg-white text-sm py-2.5"
              value={form.city} onChange={e => set('city', e.target.value)}>
              {COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Carte */}
          <div>
            <p className="text-xs text-gray-500 mb-2">
              {pinPlaced
                ? 'Cliquez sur la carte pour affiner la position du repère'
                : 'Ou cliquez directement sur la carte pour placer le repère'}
            </p>
            <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: 320 }}>
              <MapContainer center={[form.lat, form.lng]} zoom={11} className="w-full h-full">
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FlyTo lat={form.lat} lng={form.lng} />
                <ClickHandler onChange={handleMapClick} />
                {pinPlaced && <Marker position={[form.lat, form.lng]} />}
              </MapContainer>
            </div>
          </div>
        </div>

        {/* === MOTS-CLÉS === */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-semibold text-gray-700">Mots-clés</span>
            <span className="text-xs text-gray-400">— ce que vous vendez</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                  form.tags.includes(tag)
                    ? 'bg-primary-500 border-primary-500 text-white shadow-sm'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600'
                }`}
              >
                {form.tags.includes(tag) && <span className="mr-1">✓</span>}
                {tag}
              </button>
            ))}
          </div>
          {form.tags.length > 0 && (
            <p className="text-xs text-primary-600 mt-2 font-medium">
              {form.tags.length} catégorie{form.tags.length > 1 ? 's' : ''} sélectionnée{form.tags.length > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* === TOP ARTICLES === */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Euro className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-semibold text-gray-700">Articles vedettes</span>
              <span className="text-xs text-gray-400">— pour donner envie</span>
            </div>
            {form.top_articles.length < 6 && (
              <button
                type="button"
                onClick={addArticle}
                className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-semibold border border-primary-200 hover:border-primary-400 px-2.5 py-1 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter
              </button>
            )}
          </div>

          {form.top_articles.length === 0 ? (
            <button
              type="button"
              onClick={addArticle}
              className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 text-sm text-gray-400 hover:border-primary-300 hover:text-primary-500 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter un article vedette (ex: Frigo Samsung — 80€)
            </button>
          ) : (
            <div className="space-y-3">
              {form.top_articles.map((article, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-3">
                  {/* Nom + Prix + Supprimer */}
                  <div className="flex items-center gap-2">
                    <input
                      className="input-field flex-1 py-2 text-sm bg-white"
                      placeholder="Nom de l'article (ex: Frigo, Vélo, TV...)"
                      value={article.name}
                      onChange={e => updateArticle(i, 'name', e.target.value)}
                      maxLength={60}
                    />
                    <div className="relative flex-shrink-0">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        className="input-field py-2 text-sm bg-white pr-7 w-24"
                        placeholder="Prix"
                        value={article.price || ''}
                        onChange={e => updateArticle(i, 'price', parseFloat(e.target.value) || 0)}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                    </div>
                    <button type="button" onClick={() => removeArticle(i)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Description */}
                  <textarea
                    className="input-field text-sm bg-white resize-none"
                    rows={2}
                    placeholder="Description (état, marque, dimensions, couleur...)"
                    value={article.description || ''}
                    onChange={e => updateArticle(i, 'description', e.target.value)}
                    maxLength={200}
                  />

                  {/* Photos — 3 slots */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5" />
                      Photos ({article.images.length}/3)
                    </p>
                    <div className="flex gap-2">
                      {/* Slots existants */}
                      {article.images.map((url, pi) => (
                        <div key={pi} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0 group">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(i, pi)}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            <X className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      ))}

                      {/* Slot upload si < 3 photos */}
                      {article.images.length < 3 && (
                        <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary-300 flex flex-col items-center justify-center cursor-pointer transition-colors flex-shrink-0 bg-white">
                          {uploadingPhoto === `${i}` ? (
                            <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />
                          ) : (
                            <>
                              <Camera className="w-5 h-5 text-gray-300" />
                              <span className="text-xs text-gray-400 mt-1">Photo</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingPhoto === `${i}`}
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) handlePhotoUpload(i, file);
                              e.target.value = '';
                            }}
                          />
                        </label>
                      )}

                      {/* Slots vides grisés pour visualiser les 3 emplacements */}
                      {Array.from({ length: Math.max(0, 2 - article.images.length) }).map((_, pi) => (
                        <div key={`empty-${pi}`} className="w-20 h-20 rounded-xl border border-dashed border-gray-100 bg-gray-50 flex items-center justify-center flex-shrink-0">
                          <ImageOff className="w-5 h-5 text-gray-200" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Téléphone</label>
            <input type="tel" className="input-field" placeholder="0692 00 00 00"
              value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <input type="email" className="input-field" placeholder="contact@email.com"
              value={form.contact_email} onChange={e => set('contact_email', e.target.value)} />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
          {loading
            ? <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {isEditing ? 'Modification...' : 'Publication...'}
              </span>
            : isEditing ? 'Enregistrer les modifications' : "Publier l'événement"
          }
        </button>
      </form>
    </div>
  );
}
