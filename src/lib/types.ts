export type EventType = 'vide_grenier' | 'vide_maison';

export interface Event {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: EventType;
  address: string;
  city: string;
  lat: number;
  lng: number;
  date: string;
  start_time: string | null;
  end_time: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  image_url: string | null;
  status: 'active' | 'cancelled' | 'finished';
  created_at: string;
  profiles?: Profile;
}

export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface CreateEventForm {
  title: string;
  description: string;
  type: EventType;
  address: string;
  city: string;
  lat: number;
  lng: number;
  date: string;
  start_time: string;
  end_time: string;
  contact_phone: string;
  contact_email: string;
}
