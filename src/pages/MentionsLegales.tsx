import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MentionsLegales() {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Retour
      </button>

      <div className="card p-6 sm:p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mentions légales</h1>
            <p className="text-sm text-gray-400">Conformément à la loi n°2004-575 du 21 juin 2004</p>
          </div>
        </div>

        {/* Éditeur */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">1. Éditeur du site</h2>
          <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm text-gray-700">
            <p><span className="font-semibold">Site :</span> Vide Ton Caz</p>
            <p><span className="font-semibold">Responsable de publication :</span> Florian LOCK-FAT</p>
            <p><span className="font-semibold">Île de La Réunion</span> — 974</p>
            <p><span className="font-semibold">Contact :</span>{' '}
              <a href="mailto:contact@videtoncaz.re" className="text-primary-600 hover:underline">
                contact@videtoncaz.re
              </a>
            </p>
          </div>
        </section>

        {/* Hébergement */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">2. Hébergement</h2>
          <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm text-gray-700">
            <p><span className="font-semibold">Hébergeur :</span> Supabase Inc.</p>
            <p><span className="font-semibold">Adresse :</span> 970 Toa Payoh North, Singapour</p>
            <p><span className="font-semibold">Site :</span>{' '}
              <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">
                supabase.com
              </a>
            </p>
          </div>
        </section>

        {/* Propriété intellectuelle */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">3. Propriété intellectuelle</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            L'ensemble du contenu de ce site (textes, images, logo, structure) est la propriété exclusive de
            Florian LOCK-FAT, sauf mention contraire. Toute reproduction, distribution ou utilisation
            sans autorisation préalable est interdite.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mt-2">
            Les annonces publiées par les utilisateurs restent leur propriété. En publiant une annonce,
            l'utilisateur accorde à Vide Ton Caz une licence non exclusive d'affichage sur le site.
          </p>
        </section>

        {/* Données personnelles */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">4. Données personnelles & RGPD</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi
            Informatique et Libertés, vous disposez des droits suivants sur vos données :
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-2">
            <li>Droit d'accès à vos données personnelles</li>
            <li>Droit de rectification</li>
            <li>Droit à l'effacement (« droit à l'oubli »)</li>
            <li>Droit d'opposition au traitement</li>
            <li>Droit à la portabilité des données</li>
          </ul>
          <p className="text-sm text-gray-600 leading-relaxed mt-3">
            Les données collectées (email, pseudo, annonces) sont utilisées uniquement pour le
            fonctionnement du service. Elles ne sont ni vendues ni transmises à des tiers.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mt-2">
            Pour exercer vos droits, contactez :{' '}
            <a href="mailto:contact@videtoncaz.re" className="text-primary-600 hover:underline">
              contact@videtoncaz.re
            </a>
          </p>
        </section>

        {/* Cookies */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">5. Cookies</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Ce site utilise uniquement des cookies techniques nécessaires au fonctionnement du service
            (authentification, session). Aucun cookie publicitaire ou de traçage tiers n'est utilisé.
          </p>
        </section>

        {/* Responsabilité */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">6. Limitation de responsabilité</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Vide Ton Caz est une plateforme de mise en relation entre particuliers. L'éditeur ne peut être
            tenu responsable des informations publiées par les utilisateurs, ni des transactions effectuées
            entre eux. Chaque utilisateur est responsable du contenu qu'il publie.
          </p>
        </section>

        {/* Droit applicable */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">7. Droit applicable</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Le présent site et ses mentions légales sont soumis au droit français. En cas de litige,
            les tribunaux compétents sont ceux du ressort de Saint-Denis de La Réunion.
          </p>
        </section>

        <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">
          Dernière mise à jour : mars 2026
        </p>
      </div>
    </div>
  );
}
