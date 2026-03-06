import { getToken } from "./get_token.js";

/**
 * Deactivate a user (admin only)
 * DELETE /api/v1/users/{id}
 *
 * @param {number|string} id
 * @returns {Promise<object>}
 */
export async function deleteUserAdmin(id) {

    const token = getToken();
    if (!token) {
        throw new Error("Not authenticated");
    }

    const res = await fetch(`/api/v1/users/${id}`, {
        method: "DELETE",
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    if (!res.ok) {

        let errJson = {};
        try {
            errJson = await res.json();
        } catch {}

        const msg =
            errJson?.message ||
            res.statusText ||
            `HTTP ${res.status}`;

        throw new Error(msg);
    }

    // expected: { message: "User deactivated" }
    try {
        return await res.json();
    } catch {
        return { message: "User deactivated" };
    }
}
