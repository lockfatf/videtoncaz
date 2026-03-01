# 🏷️ Vide Ton Caz – La Réunion 974

Application web/mobile (PWA) pour localiser les **vide-greniers** et **vide-maisons** à La Réunion.

## Fonctionnalités

- 🗺️ **Carte interactive** de La Réunion avec tous les événements géolocalisés
- 📋 **Vue liste** avec recherche et filtres (type, dates passées)
- 👁️ **Consultation libre** sans compte requis
- 🔐 **Authentification** (inscription / connexion) via Supabase
- ➕ **Publier un événement** avec positionnement sur carte
- ✏️ **Modifier / Supprimer / Annuler** ses propres événements
- 📱 **Responsive** – fonctionne parfaitement sur mobile (PWA installable)
- 🔗 **Partage** d'événements (Web Share API / copie du lien)

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| Carte | Leaflet + react-leaflet |
| Backend/Auth/DB | Supabase (PostgreSQL) |

## Installation & Configuration

### 1. Créer un projet Supabase

1. Rendez-vous sur [supabase.com](https://supabase.com) et créez un projet
2. Allez dans **SQL Editor** et exécutez le contenu de `supabase_migration.sql`
3. Dans **Project Settings → API**, copiez l'URL et la clé anon

### 2. Variables d'environnement

```bash
cp .env.example .env
```

Éditez `.env` :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon
```

### 3. Lancer l'application

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:5173](http://localhost:5173)

### 4. Build production

```bash
npm run build
```

Le dossier `dist/` est prêt à déployer sur Vercel, Netlify, ou tout hébergeur statique.

## Structure du projet

```
src/
├── components/
│   ├── Navbar.tsx        – Navigation principale
│   ├── EventCard.tsx     – Carte d'un événement
│   ├── MapView.tsx       – Carte Leaflet
│   └── FilterBar.tsx     – Barre de recherche/filtres
├── contexts/
│   └── AuthContext.tsx   – Contexte d'authentification
├── lib/
│   ├── supabase.ts       – Client Supabase
│   └── types.ts          – Types TypeScript
└── pages/
    ├── Home.tsx          – Page d'accueil (carte + liste)
    ├── EventDetail.tsx   – Détail d'un événement
    ├── CreateEvent.tsx   – Créer / modifier un événement
    ├── Login.tsx         – Connexion
    ├── Register.tsx      – Inscription
    └── Profile.tsx       – Mon profil + mes événements
```

## Déploiement

### Vercel (recommandé)

```bash
npm install -g vercel
vercel --prod
```

Ajoutez les variables d'environnement dans le dashboard Vercel.

### Netlify

```bash
npm run build
# Glissez le dossier dist/ sur netlify.com
```
