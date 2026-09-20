# Ridgeline — SaaS Resource Tracker & Workflow Engine

A full-stack team workspace tool: project boards, task tracking, role-based
access, and live team analytics. Built with React (Vite + Tailwind) on the
frontend and Node.js/Express + MongoDB on the backend, using a
controller-service layer architecture, JWT authentication, and role-based
access control (RBAC).

## Stack

- **Frontend:** React 18, Vite, React Router, Tailwind CSS, Recharts, a
  hand-built fetch client (no Axios)
- **Backend:** Node.js, Express.js, Mongoose (MongoDB), JWT, bcryptjs, Zod
- **Security:** Helmet, express-rate-limit, httpOnly refresh-token cookies,
  centralized error handling
- **Database:** MongoDB Atlas
- **Deployment target:** Frontend → Vercel/Netlify · Backend → Render/Railway

## Project structure

saas-tracker/
  backend/
    server.js
    src/
      config/        MongoDB connection
      models/         Mongoose schemas (User, Workspace, Board, Task)
      middleware/     auth, RBAC, error handling, rate limiting
      controllers/     thin HTTP layer
      services/       business logic (controller-service architecture)
      routes/         Express routers
      utils/          ApiError, asyncHandler, Zod schemas, query validation
  frontend/
    src/
      api/            Custom fetch-based HTTP client (retry + cache + auto
                       token refresh — see "Custom HTTP client" below)
      context/        AuthContext (login/register/logout), ThemeContext
                       (light/dark mode)
      components/     Sidebar, TaskCard, TaskFormModal, ErrorBoundary,
                       Skeletons, etc.
      pages/          Login, Register, Workspaces, Board, Analytics, Members


## Core features

- JWT auth (register/login) with short-lived access tokens and a rotating
  refresh token stored in an httpOnly cookie; logout revokes it server-side
- Passwords hashed with bcrypt
- Workspaces with admin/member roles (RBAC middleware)
- Boards and tasks with full CRUD
- Kanban-style board (To do / In progress / In review / Done) with
  debounced search and priority filtering, backed by real server-side
  filtering, sorting and pagination (`GET .../tasks?search=&priority=&page=`)
- Task priority, assignee, due date
- Team analytics: completion rate, status/priority breakdown, workload per
  member, per-board progress (MongoDB aggregation pipelines)
- Light/dark theme toggle, persisted per browser
- Loading skeletons and a top-level error boundary instead of blank
  screens or unhandled crashes
- A small reusable Tailwind design system (`btn-primary`, `input-field`,
  `card`, etc. defined once via `@apply` and CSS custom-property color
  tokens) instead of copy-pasted utility strings
- Global error handling with consistent JSON responses and correct HTTP
  status codes (200, 201, 400, 401, 403, 404, 500)
- Rate-limited auth endpoints, Helmet security headers, input validation
  with Zod on every write endpoint and every query string

### Custom HTTP client

`frontend/src/api/httpClient.js` is a small fetch wrapper written from
scratch instead of pulling in Axios, because handling this by hand is part
of what this project is meant to demonstrate:

- **Retry with backoff** — network failures and 5xx responses are retried
  up to twice with exponential backoff before failing.
- **Response caching** — `GET` requests are cached in memory for 15
  seconds; any write (`POST`/`PATCH`/`DELETE`) invalidates the cache so
  stale data is never shown after a mutation.
- **Silent token refresh** — a `401` triggers one automatic call to
  `/api/auth/refresh` (using the httpOnly cookie) to get a new access
  token and retries the original request once; if that also fails, the
  user is signed out and redirected to `/login`.

## 1. Prerequisites

Install these once on your machine:

- **Node.js** 18 or newer — check with `node -v`
- **npm** (comes with Node)
- A free **MongoDB Atlas** account → https://www.mongodb.com/cloud/atlas
- A free **Vercel** or **Netlify** account (frontend hosting)
- A free **Render** or **Railway** account (backend hosting)
- **Git** and a **GitHub** account (both hosts deploy from a GitHub repo)

## 2. Set up MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas and create a free cluster
   (the M0 free tier is enough).
2. Under **Database Access**, create a database user with a username and
   password — save these, you'll need them.
3. Under **Network Access**, click **Add IP Address** → **Allow Access from
   Anywhere** (`0.0.0.0/0`) so Render/Railway can reach it.
4. Click **Connect** on your cluster → **Drivers** → copy the connection
   string. It looks like:
   
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   
5. Replace `<username>` and `<password>` with your database user's
   credentials, and add a database name before the `?`, e.g.
   `.../resource-tracker?retryWrites=true...`. Keep this string — it's your
   `MONGO_URI`.

## 3. Run the backend locally

cd backend
npm install
cp .env.example .env

Open `.env` and fill in:

PORT=5000
NODE_ENV=development
MONGO_URI=<your Atlas connection string>
JWT_SECRET=<any long random string>
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<a different long random string>
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173

`JWT_SECRET` signs short-lived access tokens; `JWT_REFRESH_SECRET` signs the
longer-lived refresh token stored in an httpOnly cookie. **They must be two
different values.** Generate strong secrets quickly with:

node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

Run that twice and use one output for each secret.

Start the server:

npm run dev

You should see `MongoDB connected: ...` and `Server running on port 5000`.
Test it: open http://localhost:5000/api/health — you should get
`{"success":true,"message":"API is healthy"}`.

## 4. Run the frontend locally

Open a **new terminal tab** (keep the backend running):

cd frontend
npm install
cp .env.example .env

`.env` should contain:

VITE_API_URL=http://localhost:5000/api

Start the dev server:

npm run dev

Open http://localhost:5173 — you should see the Ridgeline login screen.
Click **Create one**, register an account, create a workspace, create a
board, and add a task to confirm everything is wired up end to end.

## 5. Push the code to GitHub

From the project root:

cd saas-tracker
git init
git add .
git commit -m "Initial commit: Ridgeline resource tracker"

Create a new empty repository on GitHub, then:

git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main

Both the frontend and backend deploy directly from this one repo — each
host will be told which subfolder (`backend` or `frontend`) to build.

## 6. Deploy the backend (Render)

1. Go to https://render.com and sign in with GitHub.
2. **New** → **Web Service** → select your repository.
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
4. Under **Environment Variables**, add the same keys from your backend
   `.env`:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `JWT_REFRESH_SECRET`
   - `JWT_REFRESH_EXPIRES_IN`
   - `NODE_ENV` = `production`
   - `CLIENT_ORIGIN` = (leave a placeholder for now — you'll update this
     after the frontend is deployed, e.g. `https://your-app.vercel.app`)
5. Click **Create Web Service**. Render will build and start it; once live
   it gives you a URL like `https://ridgeline-api.onrender.com`.
6. Confirm it works: visit `https://ridgeline-api.onrender.com/api/health`.

### Alternative: Railway

1. Go to https://railway.app → **New Project** → **Deploy from GitHub repo**.
2. Set the **Root Directory** to `backend`.
3. Add the same environment variables as above under the **Variables** tab.
4. Railway auto-detects `npm start`. Once deployed, copy the public URL it
   gives you.

---

## 7. Deploy the frontend (Vercel)

1. Go to https://vercel.com and sign in with GitHub.
2. **Add New** → **Project** → select your repository.
3. Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (auto-detected)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_URL` = your Render/Railway backend URL + `/api`, e.g.
     `https://ridgeline-api.onrender.com/api`
5. Click **Deploy**. Vercel gives you a URL like
   `https://ridgeline.vercel.app`.

### Alternative: Netlify

1. Go to https://netlify.com → **Add new site** → **Import an existing
   project** → select your repository.
2. **Base directory:** `frontend`, **Build command:** `npm run build`,
   **Publish directory:** `frontend/dist`.
3. Add the `VITE_API_URL` environment variable as above.
4. Deploy.

---

## 8. Connect the two (final step)

Go back to your backend host's environment variables (Render or Railway)
and set:

CLIENT_ORIGIN=https://ridgeline.vercel.app

(use your actual frontend URL). Redeploy/restart the backend service so
the new CORS setting takes effect. Then open your live frontend URL,
register an account, and confirm you can create a workspace, board, and
task — this proves the deployed frontend, backend, and database are all
talking to each other correctly.

The refresh token is stored in an httpOnly cookie, which only works
cross-site over HTTPS with matching cookie settings — this is handled
automatically by `NODE_ENV=production` on the backend (Render and Vercel
both serve over HTTPS by default, so no extra setup is needed).

## 9. Everyday commands reference

| Task                          | Command                              |
| Install backend deps          | `cd backend && npm install`          |
| Run backend (dev, auto-reload)| `cd backend && npm run dev`          |
| Run backend (production mode) | `cd backend && npm start`            |
| Install frontend deps         | `cd frontend && npm install`         |
| Run frontend dev server       | `cd frontend && npm run dev`         |
| Build frontend for production | `cd frontend && npm run build`       |
| Preview production build      | `cd frontend && npm run preview`     |


## 10. Troubleshooting

- **"MongoDB connected" never prints:** double-check `MONGO_URI` — a wrong
  password or missing database-user permission is the usual cause.
- **CORS error in the browser console:** `CLIENT_ORIGIN` on the backend
  must exactly match the frontend's URL (no trailing slash).
- **401 errors after login:** make sure `VITE_API_URL` on the frontend
  points at `.../api` (not just the bare backend URL).
- **Render free instance feels slow on first request:** free instances
  sleep after inactivity and take ~30–60s to wake up — this is normal on
  the free tier.
