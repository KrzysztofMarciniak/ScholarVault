// self_update.js

import { renderForm, resetFormErrors, markInvalid } from './form.js';
import { getToken } from './get_token.js';
import { setCurrentUser } from './user_store.js';
import { createContentContainer } from './layout.js';

const app = document.getElementById("app");

/* ---------------- FETCH CURRENT USER ---------------- */

async function fetchCurrentUser() {

  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch("/api/v1/users/me", {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    const msg = errJson.message || res.statusText;
    throw new Error(msg);
  }

  const data = await res.json();
  return data?.data ?? data;
}

/* ---------------- UPDATE SELF ---------------- */

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
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },

    body: JSON.stringify(payload)

  });

  if (!res.ok) {

    const errJson = await res.json().catch(() => ({}));
    const msg = errJson.message || res.statusText;

    const error = new Error(msg);
    error.isServer = true;

    throw error;
  }

  const result = await res.json();
  return result?.data ?? result;
}

/* ---------------- RENDER PROFILE FORM ---------------- */

export function renderSelfUpdate(currentUser = {}, renderCallback = () => {}) {

  let user = (currentUser && Object.keys(currentUser).length)
    ? currentUser
    : null;

  const container = createContentContainer({
    padded: true,
    margin: "2rem auto",
    border: "1px solid #ccc",
    extraClasses: "max-w-xl",
    title: "Update Profile",
    icon: "fa-solid fa-user-gear"
  });

  app.innerHTML = "";
  app.appendChild(container);

  const fields = [

    { label: "Name", name: "name", type: "text" },

    { label: "Email", name: "email", type: "email", required: true },

    { label: "Affiliation", name: "affiliation", type: "text" },

    { label: "ORCID", name: "orcid", type: "text" },

    { label: "Bio", name: "bio", type: "text" }

  ];

  const { form, errorBox } = renderForm({
    container,
    title: "",
    fields,
    submitText: "Save"
  });

  if (!form) return;

  const populateForm = (u = {}) => {

    [...form.elements].forEach(el => {

      if (!el.name) return;

      if (u[el.name] !== undefined) {
        el.value = u[el.name] || "";
      }

    });
  };

  /* ---------- LOAD USER ---------- */

  (async () => {

    if (!user) {

      try {

        const fresh = await fetchCurrentUser();

        user = fresh;

        populateForm(user);

        setCurrentUser(user);

      } catch (err) {

        console.error("Failed to load profile:", err);

      }

    } else {

      populateForm(user);

    }

  })();

  /* ---------- FORM SUBMIT ---------- */

  form.onsubmit = async (e) => {

    e.preventDefault();

    resetFormErrors(form, errorBox);

    const formData = Object.fromEntries(
      new FormData(form).entries()
    );

    try {

      await updateSelf(formData, user || {});

      const fresh = await fetchCurrentUser();

      user = fresh;

      setCurrentUser(user);

      populateForm(user);

      errorBox.textContent = "Profile updated successfully";

      if (typeof renderCallback === "function") {
        renderCallback(user);
      }

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
