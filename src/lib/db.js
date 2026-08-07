import { db, auth } from './firebase.js'
import {
  ref,
  push,
  set,
  update,
  remove,
  onValue,
  query,
  orderByChild,
} from 'firebase/database'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'

// ---------- Auth ----------
export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}
export function logout() {
  return signOut(auth)
}
export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback)
}

// Hər agentlik öz node-unda saxlanılır: agencies/{agencyId}/...
// MVP mərhələsində agencyId = istifadəçinin uid-i (sonra ayrıca "agentlik" konsepti əlavə oluna bilər)
function agencyPath(uid, sub) {
  return `agencies/${uid}/${sub}`
}

// ---------- Properties (Obyektlər) ----------
export function watchProperties(uid, callback) {
  const q = query(ref(db, agencyPath(uid, 'properties')), orderByChild('createdAt'))
  return onValue(q, (snap) => {
    const val = snap.val() || {}
    const list = Object.entries(val).map(([id, v]) => ({ id, ...v })).reverse()
    callback(list)
  })
}
export function addProperty(uid, data) {
  const r = push(ref(db, agencyPath(uid, 'properties')))
  return set(r, { ...data, createdAt: Date.now(), status: data.status || 'aktiv' })
}
export function updateProperty(uid, id, data) {
  return update(ref(db, `${agencyPath(uid, 'properties')}/${id}`), data)
}
export function deleteProperty(uid, id) {
  return remove(ref(db, `${agencyPath(uid, 'properties')}/${id}`))
}

// ---------- Clients (Müştərilər) ----------
export function watchClients(uid, callback) {
  return onValue(ref(db, agencyPath(uid, 'clients')), (snap) => {
    const val = snap.val() || {}
    callback(Object.entries(val).map(([id, v]) => ({ id, ...v })).reverse())
  })
}
export function addClient(uid, data) {
  const r = push(ref(db, agencyPath(uid, 'clients')))
  return set(r, { ...data, createdAt: Date.now() })
}
export function deleteClient(uid, id) {
  return remove(ref(db, `${agencyPath(uid, 'clients')}/${id}`))
}

// ---------- Deals (Sövdələşmələr) ----------
// Mərhələlər: beh -> bank_tesdiqi -> notariat -> tehvil_teslim -> bitib
export const DEAL_STAGES = ['beh', 'bank_tesdiqi', 'notariat', 'tehvil_teslim', 'bitib']

export function watchDeals(uid, callback) {
  return onValue(ref(db, agencyPath(uid, 'deals')), (snap) => {
    const val = snap.val() || {}
    callback(Object.entries(val).map(([id, v]) => ({ id, ...v })).reverse())
  })
}
export function addDeal(uid, data) {
  const r = push(ref(db, agencyPath(uid, 'deals')))
  return set(r, { ...data, stage: 'beh', createdAt: Date.now() })
}
export function updateDealStage(uid, id, stage) {
  return update(ref(db, `${agencyPath(uid, 'deals')}/${id}`), { stage })
}
export function deleteDeal(uid, id) {
  return remove(ref(db, `${agencyPath(uid, 'deals')}/${id}`))
}
