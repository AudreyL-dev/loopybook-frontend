import React from "react";
import { Link } from "react-router-dom";
import logoLoopyBook from "../assets/logo/logo-loopybook.svg";

const PrivacyPolicy: React.FC = () => {
    return (
        <main className="max-w-4xl mx-auto px-6 py-10 text-gray-800">
            <div className="flex justify-center mb-6">
                <Link to="/" aria-label="Retour à l’accueil LoopyBook">
                    <img
                        src={logoLoopyBook}
                        alt="LoopyBook"
                        className="h-30 w-auto hover:opacity-90 transition"
                    />
                </Link>
            </div>
            <h1 className="text-3xl font-bold mb-2">Politique de confidentialité – LoopyBook</h1>
            <p className="text-sm text-gray-600 mb-8">Dernière mise à jour : 13/12/2025</p>

            <section className="space-y-10">
                <div>
                    <h2 className="text-xl font-semibold mb-3">1. Responsable du traitement</h2>
                    <p className="mb-3">
                        Le responsable du traitement des données personnelles est :
                    </p>
                    <p className="mb-1 font-semibold">LoopyBook</p>
                    <p className="text-gray-700">
                        Projet réalisé dans le cadre d’une formation Concepteur Développeur d’Applications (CDA).
                        Ce projet est à vocation pédagogique et non commerciale.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-3">2. Données personnelles collectées</h2>
                    <p className="mb-4">
                        Dans le cadre de l’utilisation de l’application LoopyBook, les données suivantes peuvent être collectées :
                    </p>

                    <h3 className="font-semibold mb-2">Données des utilisateurs parents :</h3>
                    <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
                        <li>prénom et nom</li>
                        <li>adresse e-mail</li>
                        <li>date de naissance</li>
                        <li>adresse postale</li>
                        <li>numéro de téléphone</li>
                        <li>informations de connexion (identifiant, mot de passe chiffré)</li>
                        <li>code PIN (stocké de manière sécurisée)</li>
                    </ul>

                    <h3 className="font-semibold mb-2">Données des profils enfants :</h3>
                    <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
                        <li>prénom ou pseudonyme</li>
                        <li>date de naissance</li>
                        <li>avatar et couleur associée</li>
                    </ul>

                    <h3 className="font-semibold mb-2">Données liées à l’utilisation :</h3>
                    <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
                        <li>livres ajoutés au panier</li>
                        <li>historique des commandes</li>
                        <li>avis et commentaires laissés sur les livres</li>
                    </ul>

                    <p className="text-gray-700">
                        Aucune donnée sensible au sens de l’article 9 du RGPD n’est collectée.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-3">3. Finalités du traitement</h2>
                    <p className="mb-4">
                        Les données personnelles sont collectées uniquement pour les finalités suivantes :
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
                        <li>création et gestion des comptes utilisateurs</li>
                        <li>gestion des profils enfants</li>
                        <li>fonctionnement du panier et des commandes</li>
                        <li>sécurisation de l’accès à l’application</li>
                        <li>affichage personnalisé des contenus selon l’âge et le rôle</li>
                        <li>gestion des avis et commentaires</li>
                    </ul>
                    <p className="text-gray-700">
                        Les données ne sont jamais utilisées à des fins commerciales ou publicitaires.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-3">4. Base légale du traitement</h2>
                    <p className="mb-4">
                        Le traitement des données repose sur :
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-1">
                        <li>l’exécution du contrat (utilisation de l’application)</li>
                        <li>l’intérêt légitime lié à la sécurité et au bon fonctionnement du service</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-3">5. Durée de conservation des données</h2>
                    <p className="mb-4">
                        Les données personnelles sont conservées :
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-1">
                        <li>pendant la durée d’existence du compte utilisateur</li>
                        <li>puis supprimées ou anonymisées en cas de suppression du compte</li>
                        <li>certaines données (commandes) peuvent être conservées à des fins de traçabilité pédagogique</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-3">6. Cookies et traceurs</h2>
                    <p className="mb-4">
                        L’application LoopyBook utilise uniquement des cookies techniques strictement nécessaires à son fonctionnement :
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
                        <li>maintien de la session utilisateur</li>
                        <li>sécurisation de l’authentification</li>
                        <li>gestion des accès selon les rôles</li>
                    </ul>
                    <p className="text-gray-700">
                        Aucun cookie de mesure d’audience, publicitaire ou de suivi tiers n’est utilisé.
                        Conformément aux recommandations de la CNIL, aucun consentement préalable n’est requis.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-3">7. Sécurité des données</h2>
                    <p className="mb-4">
                        Des mesures techniques et organisationnelles sont mises en place afin de garantir la sécurité des données :
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-1">
                        <li>mots de passe stockés sous forme chiffrée</li>
                        <li>authentification sécurisée par jeton (JWT)</li>
                        <li>accès restreint aux données selon le rôle (parent, enfant, employé, administrateur)</li>
                        <li>aucune exposition directe des données sensibles côté client</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-3">8. Droits des utilisateurs</h2>
                    <p className="mb-4">
                        Conformément au RGPD, chaque utilisateur dispose des droits suivants :
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
                        <li>droit d’accès à ses données</li>
                        <li>droit de rectification</li>
                        <li>droit à l’effacement (suppression du compte)</li>
                        <li>droit à la limitation du traitement</li>
                    </ul>
                    <p className="text-gray-700">
                        Ces droits peuvent être exercés directement depuis l’application ou sur simple demande.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-3">9. Contact</h2>
                    <p className="mb-3">
                        Pour toute question relative à la protection des données personnelles, l’utilisateur peut contacter :
                    </p>
                    <p className="font-semibold">Responsable du projet LoopyBook</p>
                    <p className="text-gray-700">Contact : audreyl.dev@gmail.com</p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-3">10. Évolution de la politique</h2>
                    <p className="text-gray-700">
                        Cette politique de confidentialité peut être mise à jour afin de refléter les évolutions de l’application
                        ou de la réglementation.
                    </p>
                </div>
            </section>
        </main>
    );
};

export default PrivacyPolicy;
