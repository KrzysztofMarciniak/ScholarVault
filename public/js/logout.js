// logout.js
import { getToken } from './get_token.js';
export async function logout(render) {
    const token = getToken();

    if (token) {
        try {
            await axios.post('/api/v1/login/logout', null, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (err) {
            console.warn('Logout API call failed:', err.response?.data?.message || err.message);
        }
    }

    // clear client state
    localStorage.removeItem('api_token');
    localStorage.removeItem('current_user');
    delete axios.defaults.headers.common['Authorization'];

    if (typeof render === 'function') render();
}
