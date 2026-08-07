import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth } from 'firebase/auth'

// TODO: Buraya real Firebase config-i əlavə et (Google Drive arxivindəki
// credentials qovluğundan, ya da yeni Firebase layihəsi yaradıb buradan götür:
// https://console.firebase.google.com/
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'emlak-crm.firebaseapp.com',
  databaseURL: 'https://emlak-crm-default-rtdb.firebaseio.com',
  projectId: 'emlak-crm',
  storageBucket: 'emlak-crm.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
}

export const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
export const auth = getAuth(app)

// Verilənlər bazası strukturu (Realtime Database):
// emlak_crm/
//   agencies/{agencyId}/            -> agentlik profili (ad, telefon, plan)
//   agencies/{agencyId}/properties/{propertyId}  -> obyektlər
//   agencies/{agencyId}/clients/{clientId}       -> müştərilər
//   agencies/{agencyId}/deals/{dealId}           -> sövdələşmələr (beh -> bank -> notariat -> təhvil)
//   agencies/{agencyId}/agents/{agentId}         -> agentlər və PIN-ləri
//   chat_sessions/{sessionId}/messages/          -> AI chat tarixçəsi (sayt + WhatsApp)
