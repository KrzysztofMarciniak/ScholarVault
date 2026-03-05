// self_update.js
import { renderForm, resetFormErrors, markInvalid } from './form.js';
import { getToken } from './get_token.js';
import { setCurrentUser } from './user_store.js';

async function fetchCurrentUser() {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch("/api/v1/users/me", {
    method: "GET",
    headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` }
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    const msg = errJson.message || res.statusText;
    throw new Error(msg);
  }

  const data = await res.json();
  return data?.data ?? data;
}

async function updateSelf(data, currentUser = {}) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const payload = {};
  for (const key in data) {
    if (data[key] !== "" && data[key] !== (currentUser?.[key] ?? undefined)) {
      payload[key] = data[key];
    }
  }

  const res = await fetch("/api/v1/users/self", {
    method: "PUT",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    const msg = errJson.message || res.statusText;
    // keep server message in Error.message so caller can decide showing it
    const error = new Error(msg);
    error.isServer = true;
    throw error;
  }

  const result = await res.json();
  return result?.data ?? result;
}

export function renderSelfUpdate(currentUser = {}, renderCallback = () => {}) {
  // writable local user reference
  let user = (currentUser && Object.keys(currentUser).length) ? currentUser : null;

  const fields = [
    { label: "Name", name: "name", type: "text", required: false },
    { label: "Email", name: "email", type: "email", required: true },
    { label: "Affiliation", name: "affiliation", type: "text", required: false },
    { label: "ORCID", name: "orcid", type: "text", required: false },
    { label: "Bio", name: "bio", type: "text", required: false }
  ];

  const { form, errorBox } = renderForm({ title: "Update Profile", fields, submitText: "Save" });
  if (!form) return;

  const populateForm = (u = {}) => {
    [...form.elements].forEach(el => {
      if (!el.name) return;
      if (u[el.name] !== undefined) el.value = u[el.name] || "";
    });
  };

  // async populate in background if user not provided
  (async () => {
    if (!user) {
      try {
        const fresh = await fetchCurrentUser();
        user = fresh;
        populateForm(user);
        setCurrentUser(user); // keep store in sync
      } catch (err) {
        // only log; do not show JS/runtime errors to user
        console.error("Failed to load profile:", err);
        // show benign message if you want: errorBox.textContent = "Unable to load profile.";
      }
    } else {
      populateForm(user);
    }
  })();

  form.onsubmit = async (e) => {
    e.preventDefault();
    resetFormErrors(form, errorBox);

    const formData = Object.fromEntries(new FormData(form).entries());

    try {
      await updateSelf(formData, user || {});
      const fresh = await fetchCurrentUser();
      user = fresh;

      setCurrentUser(user);

      populateForm(user);
      errorBox.textContent = "Profile updated successfully!";
      if (typeof renderCallback === "function") renderCallback(user);
    } catch (err) {
      if (err?.isServer) {
        errorBox.textContent = err.message || "Update failed";
      } else {
        console.error(err);
        errorBox.textContent = "";
      }
      markInvalid(form);
    }
  };
}
