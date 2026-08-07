import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, push, update, remove, onValue } from "firebase/database";

// TODO (Samir): Firebase Console-da yaratdığın "emlak-crm" layihəsinin
// tam config-ini bura yapışdır (Project Settings -> General -> Your apps -> Web app).
// Digər proektlərdən (an-psixoloji-33442, reperitor və s.) tamamilə ayrı, müstəqil layihədir.
const firebaseConfig = {
  apiKey: "AIzaSyA1uY35pJ3SzWRVWAPO2mCjFyCTO6rtpag",
  authDomain: "emlak-crm-75240.firebaseapp.com",
  databaseURL: "https://emlak-crm-75240-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "emlak-crm-75240",
  storageBucket: "emlak-crm-75240.firebasestorage.app",
  messagingSenderId: "314538863960",
  appId: "1:314538863960:web:dbb5fe28f8094b2aba892d",
  measurementId: "G-32TSJS9RJR",
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

const ROOT = "emlak_crm/tenants";

export const tenantPath = (tenantId, ...segments) =>
  [ROOT, tenantId, ...segments].filter(Boolean).join("/");

export { ref, get, set, push, update, remove, onValue };

// Verilənlər strukturu:
// emlak_crm/
//   phone_index/{phoneKey}            -> tenantId
//   tenants/{tenantId}/profil         -> { ad, telefon, pin, yaradilib, access_until, plan }
//   tenants/{tenantId}/properties/{id} -> obyektlər
//   tenants/{tenantId}/clients/{id}    -> müştərilər
//   tenants/{tenantId}/deals/{id}      -> sövdələşmələr
