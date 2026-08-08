# Əmlak CRM

AI-powered CRM Azərbaycan əmlak agentlikləri üçün. Repetitor CRM-dəki multi-tenant
Firebase arxitekturasına əsaslanır.

## Stack
- React + Vite + Tailwind CSS
- Firebase Realtime Database (multi-tenant, agentlik başına ayrı node)
- Groq API (llama-3.3-70b-versatile) — AI söhbət üçün, `/api/chat` serverless funksiyası üzərindən
- Vercel — hosting + serverless functions

## Hazır olanlar (v0.1)
- Landing səhifə (parallax hero, animasiyalar, xüsusiyyətlər bölməsi)
- AI chat widget (sayt üzərində) — nümunə obyekt datası ilə işləyir
- `/api/chat.js` — Groq API-yə təhlükəsiz proxy
- `/api/whatsapp-webhook.js` — WhatsApp Cloud API üçün skelet (Meta təsdiqi gözlənilir)
- Admin panel skeleti (`/admin`)

## Növbəti mərhələ
1. Real Firebase layihəsi yaradıb `src/lib/firebase.js`-də konfiqurasiyanı doldurmaq
2. Admin paneldə obyekt əlavə etmə/redaktə/silmə (CRUD)
3. Müştəri və sövdələşmə (beh → bank → notariat → təhvil) modulları
4. WhatsApp Business API rəsmi qoşulması (Meta Business hesabı lazımdır)
5. Agentlik qeydiyyatı + çoxagentlikli (multi-tenant) struktur

## Environment Variables (Vercel-də əlavə olunmalıdır)
- `GROQ_API_KEY` — Groq Cloud-dan alınır (console.groq.com)
- `WHATSAPP_VERIFY_TOKEN` — WhatsApp webhook təsdiqi üçün (növbəti mərhələ)

---
By securtiy_group
# Deploy trigger: GROQ_API_KEY aktivləşdirildi 1786165086
