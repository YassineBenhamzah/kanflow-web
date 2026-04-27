import Axios from 'axios';

const axios = Axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json'
    }
});

// Interceptor: This automatically injects your security token into every request!
axios.interceptors.request.use((config) => {
    // Next.js warning fix: Make sure we are on the browser before checking LocalStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
});

export default axios;
