import React from "react";
import { Link } from "react-router-dom";
import logoLoopyBook from "../assets/logo/logo-loopybook.svg";

const LegalNotice: React.FC = () => {
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
            <h1 className="text-3xl font-bold mb-2">Mentions légales – LoopyBook</h1>
            <p className="text-sm text-gray-600 mb-8">Dernière mise à jour : 13/12/2025</p>

            <section className="space-y-10">
                <div>
                    <h2 className="text-xl font-semibold mb-3">1. Éditeur du site</h2>
                    <p className="text-gray-700 mb-3">
                        LoopyBook est un projet réalisé dans le cadre d’une formation Concepteur Développeur
                        d’Applications (CDA). Il s’agit d’un projet pédagogique et non commercial.
                    </p>
                    <p className="text-gray-700">
                        Responsable de publication : <span className="font-semibold">Audrey Lepelletier</span>
                        <br />
                        Contact : <span className="font-semibold">audreyl.dev@gmail.com</span>
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-3">2. Hébergement</h2>
                    <p className="text-gray-700 mb-3">
                        L’application est exécutée dans un environnement de développement local et/ou dans un
                        environnement d’hébergement de démonstration.
                    </p>
                    <p className="text-gray-700">
                        Hébergeur : <span className="font-semibold">Pas d'hébergement en ligne</span>
                        <br />
                        Adresse : <span className="font-semibold">Pas d'hébergement en ligne</span>
                        <br />
                        Contact : <span className="font-semibold">Pas d'hébergement en ligne</span>
                    </p>

                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-3">3. Propriété intellectuelle</h2>
                    <p className="text-gray-700">
                        Les contenus, textes, éléments d’interface et codes sources relatifs au projet LoopyBook sont
                        fournis dans un cadre pédagogique. Toute reproduction ou réutilisation non autorisée est
                        interdite, sauf accord explicite de l’éditeur.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-3">4. Données personnelles</h2>
                    <p className="text-gray-700 mb-3">
                        LoopyBook traite des données personnelles nécessaires à son fonctionnement (comptes
                        utilisateurs, profils enfants, commandes, avis). Les traitements sont réalisés dans le respect
                        du RGPD.
                    </p>
                    <p className="text-gray-700">
                        Pour plus d’informations, consultez la{" "}
                        <a href="/privacy" className="underline">
                            politique de confidentialité
                        </a>
                        .
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-3">5. Cookies</h2>
                    <p className="text-gray-700">
                        L’application utilise uniquement des cookies techniques strictement nécessaires à la
                        sécurisation de l’authentification et au fonctionnement du service. Aucun cookie de suivi ou
                        publicitaire n’est utilisé.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-3">6. Limitation de responsabilité</h2>
                    <p className="text-gray-700">
                        LoopyBook est un projet pédagogique. Malgré le soin apporté, l’éditeur ne saurait être tenu
                        responsable d’éventuelles erreurs, indisponibilités ou conséquences liées à l’utilisation du
                        service dans un contexte autre que la démonstration.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-3">7. Contact</h2>
                    <p className="text-gray-700">
                        Pour toute question, vous pouvez contacter le responsable du projet :
                        <br />
                        <span className="font-semibold">Audrey LEPELLETIER</span> –{" "}
                        <span className="font-semibold">audreyl.dev@gmail.com</span>
                    </p>
                </div>
            </section>
        </main>
    );
};

export default LegalNotice;
