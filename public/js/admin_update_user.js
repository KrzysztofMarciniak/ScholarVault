// admin_update_user.js

export async function updateUserAdmin(id, data) {
    const token = localStorage.getItem("api_token");
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`/api/v1/users/${id}`, {
        method: "PATCH",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        let err = {};
        try { err = await res.json(); } catch {}
        throw new Error(err.message || `HTTP ${res.status}`);
    }

    return await res.json();
}
