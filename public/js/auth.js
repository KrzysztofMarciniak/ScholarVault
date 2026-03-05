// public/js/auth.js

// 0. Send auth request (login)
function login(email, password) {
    return axios.post('/api/v1/login', { email, password })
        .then(res => {
            saveToken(res.data.token);
            console.log('Login successful', res.data.user);
            return res.data.user;
        })
        .catch(err => {
            console.error('Login failed:', err.response?.data || err);
            throw err;
        });
}

// 1. Save token to localStorage
function saveToken(token) {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Optional: load token from localStorage when page loads
function loadToken() {
    const token = localStorage.getItem('token');
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
}

// 2. Register a new user (AUTHOR)
function register(name, email, password, affiliation = '', orcid = '', bio = '') {
    return axios.post('/api/v1/register', {
        name,
        email,
        password,
        affiliation,
        orcid,
        bio
    })
    .then(res => {
        saveToken(res.data.token);
        console.log('Registration successful', res.data.user);
        return res.data.user;
    })
    .catch(err => {
        console.error('Registration failed:', err.response?.data || err);
        throw err;
    });
}

// Load token automatically on script load
loadToken();
