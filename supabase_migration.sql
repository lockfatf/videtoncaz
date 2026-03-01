-- ============================================================
-- Vide Ton Caz - Migration Supabase
-- À exécuter dans l'éditeur SQL de votre projet Supabase
-- ============================================================

-- Table des profils (liée à auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des événements
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('vide_grenier', 'vide_maison')),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  contact_phone TEXT,
  contact_email TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'finished')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour la recherche géographique
CREATE INDEX IF NOT EXISTS events_lat_lng_idx ON public.events (lat, lng);
CREATE INDEX IF NOT EXISTS events_date_idx ON public.events (date);
CREATE INDEX IF NOT EXISTS events_status_idx ON public.events (status);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Profiles : lecture publique, écriture par le propriétaire
CREATE POLICY "Profils visibles par tous" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Utilisateur modifie son profil" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Events : lecture publique, écriture par le propriétaire
CREATE POLICY "Événements visibles par tous" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Utilisateur crée ses événements" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateur modifie ses événements" ON public.events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Utilisateur supprime ses événements" ON public.events
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- Trigger : créer automatiquement le profil à l'inscription
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.raw_user_meta_data ->> 'username')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Données de test (optionnel)
-- ============================================================

-- INSERT INTO public.events (user_id, title, description, type, address, city, lat, lng, date, start_time, end_time, contact_phone)
-- VALUES (
--   '00000000-0000-0000-0000-000000000000', -- remplacer par un vrai user_id
--   'Grand vide-grenier de famille',
--   'Meubles, vêtements, jouets, électroménager en bon état',
--   'vide_grenier',
--   '12 Allée des Badamiers',
--   'Saint-Denis',
--   -20.8823, 55.4504,
--   '2026-03-15',
--   '07:00', '13:00',
--   '0692 00 00 00'
-- );
