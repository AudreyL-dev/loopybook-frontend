import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Users, Shield, Sparkles } from "lucide-react";
import Header from "../components/layout/Header.tsx";
//import BookList from "../components/BookList";
import BookTopRatedList from "../features/books/BookTopRatedList.tsx";


/**
 * Page d'accueil LoopyBook
 *
 * Structure principale :
 * - Header (déjà géré par le composant Header)
 * - Hero avec gros dégradé et deux boutons
 * - Section "Pourquoi choisir LoopyBook ?"
 * - Section "Livres Populaires"
 * - Section CTA "Prêt à commencer l'aventure ?"
 * - Footer sombre
 */

const HomePage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Header global (logo + bouton Connexion) */}
            <Header  />

            {/* HERO : gros dégradé + titre central */}
            <section className="bg-linear-to-r from-kiwi to-mint shadow-md text-white py-16 sm:py-24">
                <div className="container mx-auto px-4 flex flex-col items-center text-center">
                    <h1 className="font-comic text-3xl sm:text-5xl md:text-6xl font-bold mb-4 drop-shadow">
                        Bienvenue chez Loopy Book !
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl max-w-2xl mb-8">
                        La boutique de livres où chaque enfant trouve son histoire
                        préférée.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link to="/auth" className="btn-primary">
                            Commencer l&apos;aventure
                        </Link>
                        <Link to="/search" className="btn-secondary">
                            Découvrir les livres
                        </Link>
                    </div>
                </div>
            </section>

            {/* Bloc central  */}
            <main className="flex-1 py-12 sm:py-16">
                <div className="container mx-auto px-4 space-y-16">
                    {/* Pourquoi choisir LoopyBook ? */}
                    <section>
                        <h2 className="font-comic text-2xl sm:text-3xl text-center text-[var(--mint-dark)] mb-8">
                            Pourquoi choisir Loopy Book ?
                        </h2>

                        <div className="grid gap-6 md:grid-cols-3">
                            {/* Profils multiples */}
                            <article className="card text-center">
                                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-[var(--kiwi)] flex items-center justify-center">
                                    <Users className="h-6 w-6 text-gray-800" />
                                </div>
                                <h3 className="font-comic text-xl mb-2">Profils multiples</h3>
                                <p className="text-sm text-gray-600">
                                    Crée des profils personnalisés pour chaque enfant avec une
                                    interface adaptée à son âge.
                                </p>
                            </article>

                            {/* Sécurisé */}
                            <article className="card text-center">
                                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-[var(--apricot)] flex items-center justify-center">
                                    <Shield className="h-6 w-6 text-gray-800" />
                                </div>
                                <h3 className="font-comic text-xl mb-2">Sécurisé</h3>
                                <p className="text-sm text-gray-600">
                                    Contrôle parental avec code PIN et notifications pour chaque
                                    ajout au panier.
                                </p>
                            </article>

                            {/* Ludique */}
                            <article className="card text-center">
                                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-[var(--mint)] flex items-center justify-center">
                                    <Sparkles className="h-6 w-6 text-gray-800" />
                                </div>
                                <h3 className="font-comic text-xl mb-2">Ludique</h3>
                                <p className="text-sm text-gray-600">
                                    Interface colorée et amusante qui donne envie de lire et de
                                    découvrir.
                                </p>
                            </article>
                        </div>
                    </section>

                    {/* Livres populaires */}
                    <section>
                        <h2 className="font-comic text-2xl sm:text-3xl text-center text-[var(--mint-dark)] mb-8">
                            Livres populaires
                        </h2>

                        {/* Liste des 3 livres les mieux classés récupérés depuis l'API backend */}
                        <BookTopRatedList />
                    </section>
                </div>
            </main>

            {/* CTA final */}
            <section className="py-12 sm:py-16 bg-gradient-to-r from-[var(--mint)] to-[var(--kiwi)]">
                <div className="container mx-auto px-4 text-center text-white">
                    <h2 className="font-comic text-2xl sm:text-3xl mb-4">
                        Prêt à commencer l&apos;aventure ?
                    </h2>
                    <p className="text-sm sm:text-lg mb-6">
                        Rejoins des milliers de familles qui font confiance à LoopyBook.
                    </p>
                    <Link to="/auth" className="btn-secondary">
                        Créer un compte gratuit
                    </Link>
                </div>
            </section>

            {/* Footer sombre */}
            <footer className="bg-gray-900 text-gray-200 py-8">
                <div className="container mx-auto px-4">
                    <div className="grid gap-8 md:grid-cols-4 text-sm">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <BookOpen className="h-5 w-5" />
                                <span className="font-comic font-bold text-lg">LoopyBook</span>
                            </div>
                            <p className="text-gray-400">
                                La boutique de livres qui grandit avec les enfants.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold mb-3">LoopyBook</h4>
                            <ul className="space-y-1 text-gray-400">
                                <li>Boutique de livres</li>
                                <li>Univers enfant & parent</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold mb-3">Navigation</h4>
                            <ul className="space-y-1 text-gray-400">
                                <li>
                                    <Link to="/search" className="hover:text-white">
                                        Rechercher
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/auth" className="hover:text-white">
                                        Se connecter
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold mb-3">Support</h4>
                            <ul className="space-y-1 text-gray-400">
                                <li>
                                    <Link to="/privacy" className="hover:text-white">
                                        Politique de confidentialité
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/legal" className="hover:text-white">
                                        Mentions légales
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/contact" className="hover:text-white">
                                        Contact
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-gray-700 text-center text-xs text-gray-500">
                        © 2025 LoopyBook. Tous droits réservés.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
