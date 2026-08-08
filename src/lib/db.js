import { db, ref, push, set, update, remove, onValue, tenantPath } from "./firebase.js";

// ---------- Properties (Obyektlər) ----------
export function watchProperties(tenantId, callback) {
  return onValue(ref(db, tenantPath(tenantId, "properties")), (snap) => {
    const val = snap.val() || {};
    callback(Object.entries(val).map(([id, v]) => ({ id, ...v })).reverse());
  });
}
export function addProperty(tenantId, data) {
  const r = push(ref(db, tenantPath(tenantId, "properties")));
  return set(r, { ...data, createdAt: Date.now(), status: data.status || "aktiv" });
}
export function updateProperty(tenantId, id, data) {
  return update(ref(db, tenantPath(tenantId, "properties", id)), data);
}
export function deleteProperty(tenantId, id) {
  return remove(ref(db, tenantPath(tenantId, "properties", id)));
}

// ---------- Clients (Müştərilər) ----------
export function watchClients(tenantId, callback) {
  return onValue(ref(db, tenantPath(tenantId, "clients")), (snap) => {
    const val = snap.val() || {};
    callback(Object.entries(val).map(([id, v]) => ({ id, ...v })).reverse());
  });
}
export function addClient(tenantId, data) {
  const r = push(ref(db, tenantPath(tenantId, "clients")));
  return set(r, { ...data, createdAt: Date.now() });
}
export function deleteClient(tenantId, id) {
  return remove(ref(db, tenantPath(tenantId, "clients", id)));
}

// ---------- Deals (Sövdələşmələr) ----------
export const DEAL_STAGES = ["beh", "bank_tesdiqi", "notariat", "tehvil_teslim", "bitib"];
export const RENT_STAGES = ["muqavile", "depozit", "acar_teslim", "bitib"];

export function watchDeals(tenantId, callback) {
  return onValue(ref(db, tenantPath(tenantId, "deals")), (snap) => {
    const val = snap.val() || {};
    callback(Object.entries(val).map(([id, v]) => ({ id, ...v })).reverse());
  });
}
export function addDeal(tenantId, data) {
  const r = push(ref(db, tenantPath(tenantId, "deals")));
  const initialStage = data.dealType === "kirayə" ? "muqavile" : "beh";
  return set(r, { ...data, stage: initialStage, createdAt: Date.now() });
}
export function updateDealStage(tenantId, id, stage) {
  return update(ref(db, tenantPath(tenantId, "deals", id)), { stage });
}
export function deleteDeal(tenantId, id) {
  return remove(ref(db, tenantPath(tenantId, "deals", id)));
}

// ---------- Profil (trial/plan) ----------
export function watchProfil(tenantId, callback) {
  return onValue(ref(db, tenantPath(tenantId, "profil")), (snap) => callback(snap.val()));
}
