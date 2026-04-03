// src/utils/api.js
export const pathfinderFetch = async (url, options = {}) => {
    const token = localStorage.getItem('authToken');
    
    const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        // Cloudflare doesn't require a skip-warning header like ngrok does, 
        // but keeping it doesn't hurt.
    };

    return fetch(url, {
        ...options,
        headers: {
            ...authHeaders,
            ...options.headers, 
        }
    });
};