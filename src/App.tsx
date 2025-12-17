import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProfileProvider } from "./contexts/ProfileContext";
import ProtectedRoute from "./components/layout/ProtectedRoute.tsx";

import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import RegisterPage from "./pages/RegisterPage";
import ProfileSelector from "./pages/ProfileSelector";
import ChildSpace from "./pages/ChildSpace";
import ParentSpace from "./pages/ParentSpace";
import AdminSpace from "./pages/AdminSpace";
import EmployeeSpace from "./pages/EmployeeSpace";
import SearchPage from "./pages/SearchPage";
import Library from "./pages/Library";
import BookDetails from "./pages/BookDetails";
import BooksPage from "./pages/BooksPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import LegalNotice from "./pages/LegalNotice";

// NOUVEAU : page wishlist enfant
import ChildWishlistPage from "./pages/ChildWishlistPage";

const App: React.FC = () => {
    return (
        <AuthProvider>
            <ProfileProvider>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/books" element={<BooksPage />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/legal" element={<LegalNotice />} />

                    <Route
                        path="/profiles"
                        element={
                            <ProtectedRoute>
                                <ProfileSelector />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/child/:profileId"
                        element={
                            <ProtectedRoute>
                                <ChildSpace />
                            </ProtectedRoute>
                        }
                    />

                    {/* NOUVEAU : Wishlist enfant */}
                    <Route
                        path="/child/:profileId/wishlist"
                        element={
                            <ProtectedRoute>
                                <ChildWishlistPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/parent"
                        element={
                            <ProtectedRoute>
                                <ParentSpace />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute>
                                <AdminSpace />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/employee"
                        element={
                            <ProtectedRoute>
                                <EmployeeSpace />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="/search" element={<SearchPage />} />

                    <Route
                        path="/library/:profileId"
                        element={
                            <ProtectedRoute>
                                <Library />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="/books/:id" element={<BookDetails />} />
                </Routes>
            </ProfileProvider>
        </AuthProvider>
    );
};

export default App;
