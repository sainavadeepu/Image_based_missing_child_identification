import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Search from './pages/Search';
import Reports from './pages/Reports';
import Landing from './pages/Landing';

const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            borderRadius: '12px',
                            background: '#0f172a',
                            color: '#fff',
                        },
                    }}
                />
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={
                        <Layout>
                            <Landing />
                        </Layout>
                    } />

                    {/* Protected Dashboard Routes */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Layout>
                                <Dashboard />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/register" element={
                        <Layout>
                            <Register />
                        </Layout>
                    } />

                    <Route path="/search" element={
                        <Layout>
                            <Search />
                        </Layout>
                    } />

                    <Route path="/reports" element={
                        <ProtectedRoute>
                            <Layout>
                                <Reports />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    {/* Catch-all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;
