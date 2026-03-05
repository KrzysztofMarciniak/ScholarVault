// logout.js
export async function logout(render) {
    const token = localStorage.getItem('api_token');

    if (token) {
        try {
            // call logout endpoint to revoke token
            await axios.post('/api/v1/login/logout', null, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (err) {
            // log but continue clearing client state
            console.warn('Logout API call failed:', err.response?.data?.message || err.message);
        }
    }

    // clear client state
    localStorage.removeItem('api_token');
    localStorage.removeItem('current_user');
    delete axios.defaults.headers.common['Authorization'];

    if (typeof render === 'function') render();
}
