window.API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://kampus-qready-api.onrender.com';

const API_BASE_URL = window.API_BASE_URL;