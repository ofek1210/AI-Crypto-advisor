# AI Crypto Advisor

דשבורד קריפטו אישי עם הרשמה/התחברות, Onboarding, תובנה יומית מבוססת AI, חדשות, מחירי מטבעות ומם, כולל מערכת הצבעות לשיפור ההמלצות.

---

## Table of Contents
1. [Demo](#demo)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Environment Variables](#environment-variables)
6. [Setup](#setup)
7. [API Endpoints](#api-endpoints)
8. [Usage](#usage)
9. [AI Tools Usage](#ai-tools-usage)
10. [Database Access](#database-access)
11. [Bonus](#bonus)

---

## Demo
**Live App (Frontend):** https://ai-crypto-advisor-vert.vercel.app

**Backend API:** https://ai-crypto-advisor-mc8s.onrender.com

**Demo Video:** 
https://drive.google.com/file/d/1roOQ9m_2Zh54mkDrcuGjYRPc_5Xjaqi4/view?usp=sharing

### Screenshots
![Login](assets/login.png)
![Onboarding](assets/onboarding.png)
![Dashboard](assets/dashborad.png)

---

## Features
- הרשמה והתחברות (JWT)
- Onboarding קצר ושמירת העדפות משתמש ב־DB
- Dashboard עם 4 אזורים:
  - חדשות קריפטו (CryptoPanic + fallback)
  - מחירי מטבעות (CoinGecko + fallback ל־CoinCap)
  - תובנת AI יומית (OpenRouter)
  - Meme דינמי
- מערכת Voting לכל אזור
- נתונים נשמרים ב־MongoDB

---

## Tech Stack
**Frontend:** React 18, Vite, React Router, TypeScript
**Backend:** Node.js, Express (ES Modules), TypeScript
**Database:** MongoDB (Mongoose)
**Auth:** JWT
**APIs:** CoinGecko, CoinCap (fallback), CryptoPanic, OpenRouter
**Dev Tools:** npm

---

## Project Structure
```
project-root/
├── client/                 # React (Vite) Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── types/
│   │   ├── main.tsx
│   │   └── router.tsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── server/                 # Node.js (Express) Backend
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Environment Variables

### Client (.env)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL של ה־Backend (למשל `http://localhost:4000`) |

**Example:**
```
VITE_API_URL=http://localhost:4000
```

### Server (.env)
| Variable | Description |
|---|---|
| `NODE_ENV` | מצב סביבה (development / production) |
| `PORT` | פורט שרת (ברירת מחדל 4000) |
| `MONGODB_URI` | Connection String ל־MongoDB |
| `JWT_SECRET` | סוד חתימת JWT |
| `JWT_EXPIRES_IN` | תוקף JWT (למשל `7d`) |
| `CORS_ORIGIN` | דומיינים מורשים (מופרדים בפסיק) |
| `CRYPTOPANIC_TOKEN` | מפתח API ל־CryptoPanic (אופציונלי) |
| `OPENROUTER_API_KEY` | מפתח API ל־OpenRouter (אופציונלי) |
| `OPENROUTER_MODEL` | שם מודל (למשל `openai/gpt-4o-mini`) |

**Example:**
```
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb+srv://user:pass@cluster.example.mongodb.net/ai-crypto-advisor?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
CRYPTOPANIC_TOKEN=
OPENROUTER_API_KEY=
OPENROUTER_MODEL=openai/gpt-4o-mini
```

---

## Setup
**Prerequisites:** Node.js (v18+), MongoDB (local או Atlas), npm

### Clone
```bash
git clone https://github.com/ofek1210/AI-Crypto-advisor.git
cd AI-Crypto-advisor
```

### Backend
```bash
cd server
npm install
cp .env.example .env
npm run dev
```
ה־API ירוץ ב־`http://localhost:4000`

### Frontend (טרמינל נוסף)
```bash
cd client
npm install
cp .env.example .env
npm run dev
```
האפליקציה תרוץ ב־`http://localhost:5173`

**שים לב:** הפרויקט לא יעבוד בלי קבצי `.env` בשני הצדדים.

---

## API Endpoints
**Auth**
- `POST /api/auth/register` — הרשמה
- `POST /api/auth/login` — התחברות

**Onboarding**
- `POST /api/onboarding` — שמירת העדפות (מאובטח)
- `GET /api/onboarding/me` — שליפת העדפות (מאובטח)

**Dashboard**
- `GET /api/dashboard/summary` — מחירים + חדשות + מם
- `GET /api/insight/daily` — תובנת AI יומית (תומך העדפות)

**Voting**
- `POST /api/votes` — שליחת פידבק (מאובטח)

---

## Usage
1. הרשמה או התחברות
2. השלמת Onboarding (פעם ראשונה)
3. כניסה ל־Dashboard לצפייה בתוכן
4. שימוש בכפתורי Voting לשיפור עתידי

---

## AI Tools Usage
במהלך הפרויקט נעשה שימוש בכלי AI (ChatGPT/Codex) לצורך:
- תכנון ארכיטקטורה
- כתיבת API endpoints
- חיבור Frontend↔Backend
- תיקוני דיפלוי ותקלות (CORS, Build, Rate Limit)
- שיפור UX ועיצוב

---

## Database Access
ה־Backend מתחבר ל־MongoDB באמצעות `MONGODB_URI`.
ה־DB מכיל collections: `users`, `onboardings`, `votes`.
ניתן ליצור משתמש read-only ב־Atlas ולהעביר Connection String לפי דרישה.

---

## Bonus
נתוני Voting נשמרים כדי לאפשר שיפור עתידי של ההמלצות והתוכן הדינמי.
