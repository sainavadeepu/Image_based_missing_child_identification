import axios from 'axios';
import toast from 'react-hot-toast';

const getBaseURL = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    // In development with Vite proxy, use relative path '/api/'
    if (import.meta.env.DEV && !envUrl) {
        return '/api/';
    }
    // Otherwise, use the full URL from env or fallback to localhost
    const base = (envUrl || 'http://localhost:8000').replace(/\/$/, '');
    return `${base}/api/`;
};

const api = axios.create({
    baseURL: getBaseURL(),
});

// Add a request interceptor to inject JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.detail || 'Something went wrong';

        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        } else if (error.response?.status !== 422) {
            // Don't toast for validation errors as they are handled in forms
            toast.error(message);
        }

        return Promise.reject(error);
    }
);

export default api;
