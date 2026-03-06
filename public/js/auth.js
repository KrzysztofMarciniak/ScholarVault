// public/js/auth.js

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

function saveToken(token) {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

function loadToken() {
    const token = localStorage.getItem('token');
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
}

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

loadToken();
