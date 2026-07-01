import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, onAuthStateChanged,
  signInWithPopup, signInWithRedirect, signOut
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { firebaseConfig, firebaseConfigured } from "./firebase-config.js";

const base = new URL("../", import.meta.url);
const routes = {
  login: new URL("index.html", base).href,
  prof: new URL("accueil.html", base).href,
  eleve: new URL("eleves.html", base).href
};

let auth = null;
let profsPromise = null;

function normalized(email) {
  return String(email || "").trim().toLowerCase();
}

async function profEmails() {
  if (!profsPromise) {
    profsPromise = fetch(new URL("profs.json", import.meta.url), { cache: "no-store" })
      .then(response => {
        if (!response.ok) throw new Error("Liste des professeurs inaccessible.");
        return response.json();
      })
      .then(values => new Set(values.map(normalized)));
  }
  return profsPromise;
}

export async function roleFor(user) {
  if (!user?.email) return "guest";
  return (await profEmails()).has(normalized(user.email)) ? "prof" : "eleve";
}

export function configured() {
  return firebaseConfigured;
}

export function authInstance() {
  if (!firebaseConfigured) return null;
  if (!auth) auth = getAuth(initializeApp(firebaseConfig));
  return auth;
}

export function observe(callback) {
  const instance = authInstance();
  if (!instance) {
    callback(null, "guest", { configured: false });
    return () => {};
  }
  return onAuthStateChanged(instance, async user => {
    try {
      callback(user, await roleFor(user), { configured: true });
    } catch (error) {
      callback(user, "guest", { configured: true, error });
    }
  });
}

export async function loginGoogle() {
  const instance = authInstance();
  if (!instance) throw new Error("Firebase n'est pas encore configuré.");
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try {
    return await signInWithPopup(instance, provider);
  } catch (error) {
    if (["auth/popup-blocked", "auth/cancelled-popup-request"].includes(error.code)) {
      await signInWithRedirect(instance, provider);
      return null;
    }
    throw error;
  }
}

export async function logoutGoogle() {
  const instance = authInstance();
  if (instance) await signOut(instance);
}

export function redirectFor(role) {
  location.href = role === "prof" ? routes.prof : routes.eleve;
}

export function guardProf() {
  document.documentElement.classList.add("auth-checking");
  return observe((user, role, state) => {
    if (!state.configured || !user || role !== "prof") {
      const target = new URL(routes.login);
      target.searchParams.set("auth", state.configured ? "prof-required" : "setup-required");
      location.replace(target.href);
      return;
    }
    document.documentElement.classList.remove("auth-checking");
    document.dispatchEvent(new CustomEvent("sakura-auth", { detail: { user, role } }));
  });
}
