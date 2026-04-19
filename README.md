# VistaTribe

> A full-stack travel platform built around authentic, community-driven stays and experiences in Nepal — from Himalayan mountain villages to lakeside heritage homes.

VistaTribe is a production-grade Node.js + Express web application that lets travellers discover, review, and list culturally rooted Nepali stays. It pairs a complete authentication system, cloud-backed media pipeline, and category-driven discovery with a clean server-rendered UI — deployed and running on Render with a managed MongoDB Atlas backend.

---

## Key Highlights

- **End-to-end full-stack build** — authentication, authorization, image uploads, reviews, search, and deployment all wired together from scratch.
- **Session-backed auth** using Passport.js + `passport-local-mongoose` with sessions persisted in MongoDB via `connect-mongo`.
- **Cloudinary-powered media pipeline** with Multer streaming uploads directly to a cloud CDN — no local disk storage.
- **Server-side validation** with Joi schemas plus ownership-aware middleware that enforces per-resource access control.
- **Discovery-first UX**: 10 curated Nepal-themed categories, location/price filtering, GeoJSON API endpoint, and an embedded Google Maps view per listing.
- **Deployed on Render** with MongoDB Atlas, secure session cookies, and environment-driven configuration.

---

## Why This Project Matters

Mainstream travel platforms surface the same polished hotels everywhere in the world — the parts of Nepal that matter most (farm stays, hiking bases, heritage homes, cultural events) rarely get a voice. VistaTribe solves that gap:

- **For travellers** — a single place to browse authentic, regionally grouped Nepali experiences instead of generic hotel listings.
- **For hosts** — a self-serve tool to publish stays, upload photos, and receive verified reviews without needing a marketing team.
- **As engineering work** — a from-scratch build that demonstrates the full lifecycle of a real web product: schema design, auth, cloud storage, validation, deployment, and UX.

---

## Key Features

### Listings & Discovery
- Full CRUD for listings (create, read, update, delete) with image upload.
- Ten themed categories: *Mountain Villages, Heritage Homes, Wellness, Homely Food, Farm Stays, Lake View, Cultural Events, Hiking Base, Handicrafts, Rustic Retreats*.
- Filter by **location** (case-insensitive regex), **category**, and **price range** (min/max) directly from the URL query.
- Embedded Google Maps view rendered per listing using the Google Maps Embed API.

### Reviews & Ratings
- Authenticated users can post star-based reviews (1–5) with written feedback.
- Star ratings rendered via the Starability CSS library for accessible UX.
- Only the original author can delete their own review, enforced server-side.
- Cascade delete: removing a listing automatically removes its reviews via a Mongoose `findOneAndDelete` post-hook.

### Authentication & Authorization
- Username + password registration handled by `passport-local-mongoose` (salted + hashed, never stored in plaintext).
- Persistent login via Express sessions stored in MongoDB.
- `isLoggedIn`, `isOwner`, and `isReviewAuthor` middleware guard every sensitive route.
- Post-login redirect: users are returned to the exact page they were trying to reach before being prompted to authenticate.

### Media & Cloud
- Image uploads streamed directly to **Cloudinary** via `multer-storage-cloudinary` — no local filesystem dependency, making the app deploy-friendly on ephemeral platforms like Render.

### Developer & Infra
- Centralized async error handling via a `wrapAsync` helper and a custom `ExpressError` class.
- Global Joi validation middleware prevents malformed payloads from hitting the database.
- Flash messaging for user feedback (success, error) on every action.
- Read-only GeoJSON API endpoint (`/api/listings/geojson`) ready for frontend map integrations.

---

## Tech Stack

| Layer | Technology | Why it's used |
| --- | --- | --- |
| Runtime | **Node.js** | Non-blocking I/O runtime for the server. |
| Framework | **Express 5** | Routing, middleware pipeline, and request lifecycle. |
| Database | **MongoDB Atlas + Mongoose** | Flexible document model for listings, reviews, and user docs; cloud-hosted for production. |
| Auth | **Passport.js + passport-local-mongoose** | Battle-tested authentication with automatic password hashing. |
| Sessions | **express-session + connect-mongo** | Server-side sessions persisted in MongoDB so logins survive restarts. |
| Validation | **Joi** | Declarative schema validation on the server before writes. |
| Templating | **EJS + ejs-mate** | Server-rendered views with layout inheritance (`boilerplate.ejs`). |
| File Uploads | **Multer + multer-storage-cloudinary** | Streams multipart form data straight to Cloudinary. |
| Media CDN | **Cloudinary** | Remote image hosting + delivery, independent of the app server. |
| Styling | **Bootstrap 5, Font Awesome, Starability** | Responsive grid, iconography, and accessible star ratings. |
| Maps | **Google Maps Embed API** | Lightweight location preview per listing. |
| Utilities | **method-override, connect-flash, dotenv, cookie-parser** | REST-style form verbs, flash messaging, environment config. |
| Hosting | **Render** | Production deployment with env vars and automatic restarts. |

---

## How It Works

```
┌──────────────┐    HTTP     ┌──────────────────────────────┐     ┌─────────────────┐
│   Browser    │ ──────────▶ │   Express 5 (app.js)         │ ──▶ │  MongoDB Atlas  │
│  (EJS views) │ ◀────────── │  Routes → Controllers → Model│     │ listings/users/ │
└──────────────┘   HTML      └──────────────────────────────┘     │    reviews      │
                                    │           │                 └─────────────────┘
                                    │           │
                                    │           ▼
                                    │    ┌──────────────┐
                                    │    │  Cloudinary  │  (image storage + CDN)
                                    │    └──────────────┘
                                    ▼
                              ┌──────────────┐
                              │  Passport.js │  (local strategy, sessions in Mongo)
                              └──────────────┘
```

1. **Request lifecycle** — each request flows through session + Passport middleware, which attaches `req.user` and the flash locals used by every view.
2. **Route layer** — modular routers (`routes/listing.js`, `routes/reviews.js`, `routes/user.js`, `routes/api.js`) are mounted under distinct paths and delegate to controller functions.
3. **Controller layer** — thin controllers (`controllers/listings.js`, `controllers/review.js`, `controllers/users.js`) handle business logic and talk to Mongoose models.
4. **Data layer** — Mongoose models define schemas for `Listing`, `Review`, and `User`, with references and cascade deletes between them.
5. **Guards** — before any write, `isLoggedIn` / `isOwner` / `isReviewAuthor` verify auth and ownership. Joi schemas (`schema.js`) validate the payload shape before it touches MongoDB.
6. **Rendering** — EJS views extend a shared `layouts/boilerplate.ejs`, pulling in navbar, flash messages, and footer partials.
7. **Errors** — any thrown error is caught by `wrapAsync`, funneled to the global error handler, and rendered with the appropriate status code.

---

## Project Structure

```
MAJORPROJECT_vistratribe/
├── app.js                  # Entry point — Express setup, DB, sessions, Passport, routes, error handler
├── cloudConfig.js          # Cloudinary + Multer storage configuration
├── middleware.js           # Auth, ownership, and validation middleware
├── schema.js               # Joi validation schemas for listings & reviews
│
├── controllers/            # Business logic
│   ├── listings.js
│   ├── review.js
│   └── users.js
│
├── models/                 # Mongoose schemas
│   ├── listing.js
│   ├── review.js
│   └── user.js
│
├── routes/                 # Modular Express routers
│   ├── listing.js
│   ├── reviews.js
│   ├── user.js
│   └── api.js              # GeoJSON endpoint
│
├── views/                  # EJS templates
│   ├── layouts/boilerplate.ejs
│   ├── includes/           # navbar, footer, flash partials
│   ├── listings/           # index, show, new, edit
│   └── users/              # login, register
│
├── public/                 # Static assets (CSS, JS, images)
├── utils/                  # wrapAsync + ExpressError helpers
├── init/                   # Seed script + sample data
└── package.json
```

---

## Installation and Setup

### Prerequisites
- Node.js `v20+` (the app targets `v24.3.0` per `package.json`)
- A MongoDB Atlas cluster (or a local MongoDB instance)
- A Cloudinary account (free tier works)
- A Google Maps Embed API key

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/vistatribe.git
cd vistatribe
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
ATLASDB_URL=your_mongodb_connection_string
SECRET=your_session_secret
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
MAP_TOKEN=your_google_maps_embed_api_key
PORT=8080
```

### 3. (Optional) Seed sample data

```bash
node init/index.js
```

### 4. Run the app

```bash
npm run dev      # with nodemon (hot reload)
# or
npm start        # plain node
```

Visit [http://localhost:8080](http://localhost:8080).

---

## Usage

- Head to `/listings` to browse every available stay.
- Use the navbar search to filter by location and price, or click a category icon to narrow results.
- Register at `/register`, then log in at `/login`.
- Hit **Add New Listing** to publish your own stay (title, description, price, location, country, category, cover image).
- Open any listing to read its full details, view the embedded map, and leave a star-rated review.
- Owners see **Edit / Delete** controls on their own listings; review authors can remove their own reviews.

---

## Future Improvements

- Interactive map with clustered markers on the index page using the existing GeoJSON endpoint (`/api/listings/geojson`).
- Real booking flow (check-in / check-out, availability calendar, payment integration).
- Per-listing precise geocoding (currently seeds a Kathmandu coordinate placeholder) via Mapbox or Google Geocoding API.
- Dashboard for hosts to manage all their listings in one place.
- Full-text search across title and description, plus sort-by-rating.
- Social login (Google, GitHub) in addition to local auth.
- REST / JSON API layer so a future React or mobile client can consume the same backend.

---

## Why This Project Stands Out

- **Complete vertical slice, not a tutorial clone** — schema, auth, cloud storage, validation, deployment, and UX are all real working pieces built intentionally, not copied.
- **Production-minded decisions** — sessions persisted in MongoDB (survive restarts), media offloaded to Cloudinary (Render's filesystem is ephemeral), secrets sourced from `.env`, and a global error boundary.
- **Security by default** — Passport handles password hashing, Joi validates every payload, ownership checks guard every mutation, and `httpOnly` cookies protect sessions from XSS.
- **Thoughtful UX** — post-login redirect-back, flash messaging on every action, progressive review loading with a "See More" toggle, and accessible star ratings via Starability.
- **Clean separation of concerns** — MVC layout with dedicated routers, controllers, models, middleware, utils, and views makes the codebase easy to read and extend.
- **Live and deployed** — the app runs on Render against MongoDB Atlas, not just on localhost.

---

## Author

**Prashan Adhikari**

Full-stack developer with a focus on practical, user-facing web products.
- Email: [prashanadhikari2486@gmail.com](mailto:prashanadhikari2486@gmail.com)

> VistaTribe is a solo-built project designed to showcase end-to-end web engineering — from database schema and authentication to cloud media, deployment, and a polished user experience.
