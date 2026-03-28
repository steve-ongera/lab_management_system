# 🧪 LIMS — Laboratory Information Management System

A full-stack Laboratory Information Management System built with **Django REST Framework** (backend) and **React + Vite** (frontend). Designed for research laboratories to manage participant demographics, sample collection, processing, storage, and stock inventory — with a clean, responsive UI and full audit logging.

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Tech Stack](#-tech-stack)
3. [Full File Structure](#-full-file-structure)
4. [File Descriptions](#-file-descriptions)
5. [Data Dictionary](#-data-dictionary)
6. [Backend Setup](#-backend-setup)
7. [Frontend Setup](#-frontend-setup)
8. [Running the Full Stack](#-running-the-full-stack)
9. [API Reference](#-api-reference)
10. [Default Credentials](#-default-credentials)
11. [Hosting Options](#-hosting-options-no-domain-required)
12. [Deployment Guide](#-deployment-guide--github--railway-free-no-domain)
13. [Environment Variables](#-environment-variables)
14. [Troubleshooting](#-troubleshooting)
15. [Quick Reference Commands](#-quick-reference-commands)

---

## 🔬 Project Overview

LIMS covers the full laboratory sample lifecycle:

| Module | Description |
|---|---|
| **Participants** | Demographic records: ID, study, DOB, sex, enrollment date |
| **Phlebotomy** | Sample collection: collector, date/time, tube type, volume, consent, visit type |
| **Sample Processing** | Accession, tube counts, centrifugation/incubation timings, dispatch info |
| **Sample Storage** | Freezer/fridge/rack/box location, temperature, condition, retrieval tracking |
| **Stock Inventory** | Reagents & consumables: supplier, batch, expiry, quantity, location |
| **Audit Logs** | Automatic read-only log of every create, update, and delete with user + timestamp |
| **Dashboard** | Live stats, bar chart of daily collections, pie chart of sample type distribution, expiry alerts |

**Key Features:**
- Token-based authentication (Django REST Framework)
- Full CRUD with modal forms on every module
- Search, filter, and ordering on all list endpoints
- Excel export on every module (styled with teal headers)
- Low-stock and expiring-soon alerts on inventory
- Responsive layout — sidebar drawerable on mobile and desktop
- Slugs on all models for clean URL-friendly identifiers
- Django Admin panel for superuser management
- Pagination on all list views (20 per page)
- Audit trail auto-logged on every write operation

---

## 🛠 Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.10+ | Runtime |
| Django | 4.2.x | Web framework |
| Django REST Framework | 3.14.x | REST API |
| django-cors-headers | 4.3.x | CORS for React dev server |
| django-filter | 23.3.x | Query filtering |
| openpyxl | 3.1.x | Excel export |
| SQLite | built-in | Database (dev) — swap for PostgreSQL in prod |
| Gunicorn | 21.x | WSGI server for production |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.x | UI library |
| Vite | 5.x | Build tool & dev server |
| React Router DOM | 6.x | Client-side routing |
| Recharts | 2.x | Dashboard charts |
| Axios | 1.x | HTTP client |
| Bootstrap Icons | 1.11.x | Icon set (CDN, no npm install needed) |

---

## 📁 Full File Structure

```
lims/                                        ← Project root
│
├── manage.py                                ← Django management CLI
├── requirements.txt                         ← Python dependencies
├── start.sh                                 ← One-command startup script (runs both servers)
├── README.md                                ← This file
│
├── config/                                  ← Django project configuration package
│   ├── __init__.py                          ← Makes config a Python package
│   ├── settings.py                          ← All Django settings (DB, apps, CORS, DRF, static, media)
│   ├── urls.py                              ← Root URL router: /admin/ and /api/
│   ├── asgi.py                              ← ASGI entry point (async/websocket support)
│   └── wsgi.py                              ← WSGI entry point (used by Gunicorn in production)
│
├── core/                                    ← Single Django application (all LIMS business logic)
│   ├── __init__.py                          ← Makes core a Python package
│   ├── apps.py                              ← App config: name = "core"
│   ├── models.py                            ← All 6 database models with slugs
│   ├── serializers.py                       ← DRF serializers: validation + representation
│   ├── views.py                             ← ViewSets, auth views, dashboard, Excel exports
│   ├── urls.py                              ← DRF DefaultRouter + manual auth/dashboard paths
│   ├── admin.py                             ← Django Admin registration with list_display & filters
│   ├── tests.py                             ← Test file (extend as needed)
│   └── migrations/                          ← Database migration files
│       ├── __init__.py
│       └── 0001_initial.py                  ← Auto-generated migration: creates all 6 tables
│
└── frontend/                                ← React + Vite single-page application
    ├── index.html                           ← HTML shell: mounts #root, loads Bootstrap Icons CDN
    ├── package.json                         ← Node dependencies, npm scripts (dev/build/deploy)
    ├── vite.config.js                       ← Vite: React plugin + /api proxy → Django :8000
    │
    └── src/                                 ← All React source code
        │
        ├── main.jsx                         ← Entry point: ReactDOM.createRoot → <App />, imports CSS
        ├── App.jsx                          ← Root: AuthContext, BrowserRouter, Routes, PrivateRoute
        │
        ├── styles/
        │   └── main.css                     ← Complete design system (CSS variables, all component styles)
        │
        ├── utils/
        │   └── api.js                       ← Axios instance, auth interceptors, all API functions
        │
        ├── components/                      ← Reusable UI building blocks
        │   ├── Layout.jsx                   ← App shell: Sidebar + Navbar + <Outlet /> (page content)
        │   ├── Navbar.jsx                   ← Top bar: sidebar toggle, page title, user avatar
        │   ├── Sidebar.jsx                  ← Left drawer: nav links, section labels, logout button
        │   ├── Modal.jsx                    ← Generic modal: Escape/outside-click close, footer buttons
        │   ├── ConfirmModal.jsx             ← Delete confirmation: red alert + Cancel/Delete buttons
        │   └── Pagination.jsx              ← Smart pagination: ellipsis, "Showing X–Y of Z"
        │
        └── pages/                           ← One file per module/route
            ├── Login.jsx                    ← Auth: username/password, token login, error display
            ├── Dashboard.jsx                ← Stats cards, bar chart (14-day), pie chart, alerts
            ├── Participants.jsx             ← Demographics: full CRUD + search + Excel export
            ├── Phlebotomy.jsx               ← Collection records: full CRUD + search + Excel export
            ├── Processing.jsx               ← Lab processing: full CRUD + search + Excel export
            ├── Storage.jsx                  ← Sample storage: full CRUD + search + Excel export
            ├── Inventory.jsx                ← Stock: full CRUD + low-stock/expiring tabs + Excel export
            └── AuditLogs.jsx               ← Read-only audit trail: filter by action, search
```

---

## 📄 File Descriptions

### Backend Files

#### `config/settings.py`
Central Django configuration. Key sections:
- **INSTALLED_APPS**: `rest_framework`, `rest_framework.authtoken`, `corsheaders`, `django_filters`, `core`
- **DATABASES**: SQLite by default (`db.sqlite3`). Swap `ENGINE` to `django.db.backends.postgresql` for production.
- **REST_FRAMEWORK**: Token + Session auth, `IsAuthenticated` default, `DjangoFilterBackend` + `SearchFilter` + `OrderingFilter`, page size 20
- **CORS_ALLOWED_ORIGINS**: Allows React dev server on ports 5173 and 3000
- **TIME_ZONE**: `Africa/Nairobi` (EAT, UTC+3) — change to your lab's timezone
- **STATICFILES_DIRS**: Points to `frontend/dist` so Django serves the built React app in production

#### `config/urls.py`
Root URL configuration:
```python
/admin/   →  Django Admin
/api/     →  core/urls.py (all REST API endpoints)
```

#### `core/models.py`
Six Django models. All have a `slug` (auto-generated in `save()`) and a `created_by` FK to `User`.

| Model | Primary Identifier | Key Relations |
|---|---|---|
| `Participant` | `participant_id` | Root model; all others link back here |
| `Phlebotomy` | `slug` (auto) | FK → Participant |
| `SampleProcessing` | `accession_number` | FK → Phlebotomy |
| `SampleStorage` | `sample_id` | OneToOne → SampleProcessing |
| `StockItem` | `item_id` | Independent model |
| `AuditLog` | auto `id` | FK → User |

**Slug generation examples:**
- Participant `KNH-001` → slug `knh-001`
- Phlebotomy → slug `knh-001-2024-01-11-blood-a1b2c3`
- Stock item `STK-001 EDTA Tubes` → slug `stk-001-edta-tubes`

#### `core/serializers.py`
DRF ModelSerializers for all six models:
- `read_only_fields`: `slug`, `created_at`, `updated_at`, `created_by`, `last_updated`
- Display fields via `source='get_X_display'` for all choice fields (e.g., `sex_display`, `sample_type_display`)
- Nested read fields: `participant_id_display` (from Phlebotomy), `accession_number` (from Storage)
- Computed fields on `StockItemSerializer`: `is_expired` (date comparison), `is_low_stock` (qty ≤ 10)

#### `core/views.py`
Contains all API logic:

| Function/Class | Type | Description |
|---|---|---|
| `login_view` | `@api_view(['POST'])` | Authenticates user, returns Token + user data |
| `logout_view` | `@api_view(['POST'])` | Deletes user's auth token |
| `me_view` | `@api_view(['GET'])` | Returns current user info |
| `dashboard_stats` | `@api_view(['GET'])` | Aggregated stats, 14-day chart, sample distribution |
| `log_action()` | helper function | Called on every write to create AuditLog entry |
| `ParticipantViewSet` | `ModelViewSet` | CRUD + `export_excel` action |
| `PhlebotomyViewSet` | `ModelViewSet` | CRUD + `export_excel` action |
| `SampleProcessingViewSet` | `ModelViewSet` | CRUD + `export_excel` action |
| `SampleStorageViewSet` | `ModelViewSet` | CRUD + `export_excel` action |
| `StockItemViewSet` | `ModelViewSet` | CRUD + `export_excel` + `low_stock` + `expiring` |
| `AuditLogViewSet` | `ReadOnlyModelViewSet` | List + retrieve only |

Excel exports use `openpyxl` with teal header fill (`#1A6B8A`), white bold text, auto column widths.

#### `core/urls.py`
DRF `DefaultRouter` auto-generates all CRUD URLs. Manual additions:
```
POST  /api/auth/login/
POST  /api/auth/logout/
GET   /api/auth/me/
GET   /api/dashboard/stats/
```

#### `core/admin.py`
All models registered with:
- `list_display` — most important fields shown in the list view
- `search_fields` — enables the search box in admin
- `list_filter` — sidebar filters by category/type
- `readonly_fields` on AuditLog — prevents modification

#### `core/migrations/0001_initial.py`
Auto-generated by `makemigrations`. Creates all 6 tables with correct field types, constraints, FKs, and indexes. Apply with `python manage.py migrate`.

---

### Frontend Files

#### `frontend/index.html`
The only HTML file in the project. Key elements:
- `<div id="root">` — React mounts here
- Bootstrap Icons CDN: `https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css`
- Emoji favicon (🧪) as inline SVG — no separate favicon file needed
- `<script type="module" src="/src/main.jsx">` — Vite entry point

#### `frontend/vite.config.js`
```js
server.proxy: { '/api': { target: 'http://localhost:8000', changeOrigin: true } }
```
This means during development, `fetch('/api/participants/')` goes to `http://localhost:8000/api/participants/` — zero CORS issues in dev.

#### `frontend/package.json`
Core dependencies:
- `react` + `react-dom` — React 18
- `react-router-dom` — BrowserRouter, Routes, Route, NavLink, useNavigate, useLocation
- `recharts` — BarChart, PieChart, LineChart, ResponsiveContainer
- `axios` — HTTP client with interceptor support

Scripts:
- `npm run dev` — start Vite dev server (hot reload)
- `npm run build` — compile to `dist/` for production
- `npm run preview` — preview the production build locally

#### `src/main.jsx`
```jsx
import './styles/main.css'         // global styles loaded once here
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
```

#### `src/App.jsx`
Three responsibilities:
1. **AuthContext** — provides `user`, `login()`, `logout()` to all child components via `useAuth()` hook
2. **Persistence** — reads/writes `lims_token` and `lims_user` to `localStorage`
3. **Routing** — all routes defined here; `PrivateRoute` redirects unauthenticated users to `/login`

Route map:
```
/login          → Login.jsx         (public)
/               → Dashboard.jsx     (private)
/participants   → Participants.jsx  (private)
/phlebotomy     → Phlebotomy.jsx    (private)
/processing     → Processing.jsx    (private)
/storage        → Storage.jsx       (private)
/inventory      → Inventory.jsx     (private)
/audit          → AuditLogs.jsx     (private)
*               → redirect to /
```

#### `src/styles/main.css`
Complete design system. Key CSS custom properties:
```css
--primary: #1a6b8a        /* steel blue — primary brand, buttons, links */
--primary-light: #2387ad  /* lighter blue for hover states */
--primary-dark: #124d65   /* dark blue — sidebar background */
--accent: #26a69a         /* teal — active nav items, highlights */
--accent-light: #e0f2f0   /* very light teal — hover backgrounds */
--bg: #f7f9fc             /* off-white — page background */
--surface: #ffffff        /* pure white — cards, modals, table backgrounds */
--border: #e4e9f0         /* light grey — borders, dividers */
--text: #1a2332           /* near-black — body text */
--text-muted: #6b7a8d     /* grey — labels, secondary text */
```

Defines complete styles for: layout wrapper, fixed navbar, fixed sidebar with overlay, stat cards, page header, table cards + toolbar, data tables, badges (6 colour variants), buttons (6 types + sizes), modals + animations, form rows/groups/controls, chart cards, pagination bar, alerts, loading spinner, login page, scrollbars, and mobile responsive breakpoints.

#### `src/utils/api.js`
Axios instance configured with:
- **Base URL**: `/api` (proxied to Django in dev, or set via `VITE_API_URL` env var in production)
- **Request interceptor**: reads `lims_token` from localStorage, attaches as `Authorization: Token <token>`
- **Response interceptor**: on 401 Unauthorized, clears localStorage and redirects to `/login`

API modules exported:
```js
authAPI.login(data)          // POST /auth/login/
authAPI.logout()             // POST /auth/logout/
authAPI.me()                 // GET  /auth/me/
dashboardAPI.stats()         // GET  /dashboard/stats/
participantsAPI.list(params) // GET  /participants/?search=...&page=...
participantsAPI.create(data) // POST /participants/
participantsAPI.update(id,d) // PUT  /participants/{id}/
participantsAPI.remove(id)   // DELETE /participants/{id}/
participantsAPI.export()     // GET  /participants/export_excel/ (blob)
// same pattern for phlebotomyAPI, processingAPI, storageAPI
stockAPI.lowStock()          // GET /stock/low_stock/
stockAPI.expiring()          // GET /stock/expiring/
downloadExcel(apiFn, name)   // triggers browser file download
```

#### `src/components/Layout.jsx`
App shell. Manages `sidebarOpen` boolean state:
- Starts `true` on desktop (≥768px), `false` on mobile
- Listens to `window.resize` to auto-collapse on mobile
- Passes `open` and `onClose` to Sidebar; `sidebarOpen` and `onToggle` to Navbar
- Renders `<Outlet />` where React Router injects the current page

#### `src/components/Navbar.jsx`
Fixed top bar (60px height). Contains:
- **Toggle button** — `bi-layout-sidebar` / `bi-layout-sidebar-reverse` icon, toggles sidebar
- **Page title** — derived from `useLocation().pathname` mapped to human-readable strings
- **User section** — full name (or username) + avatar circle with first initial

#### `src/components/Sidebar.jsx`
Fixed left drawer (260px wide). Features:
- Logo + brand + subtitle in header
- Section labels as non-clickable dividers
- `NavLink` components with `bi-*` Bootstrap Icons; active class applied based on current path
- **Mobile overlay** — semi-transparent backdrop rendered behind sidebar; clicking it calls `onClose`
- **Sign Out** button — calls `authAPI.logout()` then `logout()` from AuthContext, redirects to login

Nav items:
```
Main:         Dashboard (bi-speedometer2)
Laboratory:   Participants (bi-people-fill), Phlebotomy (bi-droplet-fill),
              Processing (bi-gear-fill), Storage (bi-box-seam-fill)
Management:   Inventory (bi-clipboard2-pulse-fill), Audit Logs (bi-journal-text)
```

#### `src/components/Modal.jsx`
Reusable modal component. Props:
- `title` — header text
- `onClose` — called on Escape key, close button, or clicking overlay
- `onSubmit` — if provided, renders Cancel + Save buttons in footer; if null, hides footer (used when parent manages its own buttons)
- `children` — form content rendered in scrollable modal body
- `size` — extra CSS class for wider modals

Side effects: locks `document.body.overflow` to prevent background scrolling while open.

#### `src/components/ConfirmModal.jsx`
Thin wrapper around `Modal.jsx`. Shows a red danger alert with `message` prop, and Cancel + red Delete buttons.

#### `src/components/Pagination.jsx`
Smart pagination component. Props: `count` (total records), `page` (current), `pageSize` (default 20), `onPage` (callback). Shows ellipsis (`…`) between non-adjacent page numbers. Displays "Showing X–Y of Z" info text.

---

### Pages

#### `src/pages/Login.jsx`
- Full-screen gradient background (dark blue → teal)
- Centered white card with hospital icon, LIMS brand, subtitle
- Username + password inputs with Bootstrap Icon prefixes
- On submit: calls `authAPI.login()` → success: `login(user, token)` from AuthContext → redirects to Dashboard
- Error alert with red styling on failed credentials
- Loading spinner replaces button text during request

#### `src/pages/Dashboard.jsx`
Fetches from `/api/dashboard/stats/`. Renders:
- **7 stat cards** with coloured icon boxes: Total Participants, Total Samples, Processings, Stored Samples, Stock Items, Expiring Soon (orange), Expired (red)
- **Bar chart** (Recharts): daily sample collections over last 14 days, teal bars, date on X-axis
- **Donut/Pie chart** (Recharts): sample type distribution with legend and colour per type
- **Alert banners** at bottom if `stock_expiring_soon > 0` or `stock_expired > 0`

#### `src/pages/Participants.jsx`
Standard CRUD page pattern (shared by all module pages):
1. `useCallback` + `useEffect` → `participantsAPI.list({ page, search })` → sets `data`
2. **Table** with pagination
3. **Add** button → sets `form = EMPTY` → opens `modal='add'`
4. **Edit** icon → sets `form = {...record}` → opens `modal='edit'`
5. **Delete** icon → opens `modal='delete'` (ConfirmModal)
6. **Export** button → calls `downloadExcel()` → downloads styled .xlsx
7. `handleSave()` → create or update via API → `showAlert()` → reload
8. `showAlert()` → sets alert state → auto-clears after 3.5 seconds

Table columns: Participant ID, Study Name, DOB, Age, Sex (badge), Enrollment Date, Actions

#### `src/pages/Phlebotomy.jsx`
Same pattern as Participants. Additionally:
- Fetches participants list for the dropdown in Add/Edit modal
- Conditional textarea for `no_collection_reason` when `sample_collected` is unchecked
- Coloured badges per sample type: blood=red, sputum=yellow, urine=blue, other=grey

#### `src/pages/Processing.jsx`
- Fetches phlebotomy records for dropdown
- 7 tube count number inputs (EDTA, Li-Hep, SST, Sodium Citrate, Blood Culture, Red Top, Other)
- Conditional centrifugation datetime pickers (shown only when `processing_type === 'centrifugation'`)
- Conditional incubation datetime pickers (shown only when `processing_type === 'incubation'`)

#### `src/pages/Storage.jsx`
- Fetches processing records for dropdown (shows accession number + date)
- Location summary in table: "Freezer: FRZ-A Shelf: S1 Box: B3" from multiple fields
- Temperature badge: 2-8°C=blue, -20°C=yellow, -80°C=dark blue

#### `src/pages/Inventory.jsx`
Three-tab layout:
- **All Items** — paginated, searched list
- **Low Stock** — items with `quantity_available ≤ 10` (no pagination, direct API call)
- **Expiring Soon** — items expiring within 30 days (no pagination, direct API call)

Expiry visual indicators:
- Past expiry → red bold text + red "Expired" badge
- Within 30 days → yellow text + yellow "Soon" badge
- Low quantity → red bold number + warning triangle icon

#### `src/pages/AuditLogs.jsx`
Read-only. No add/edit/delete buttons. Features:
- Action filter dropdown (All / Create / Update / Delete)
- Search by user or record representation
- Action badges with icons: Create=green `bi-plus-circle-fill`, Update=yellow `bi-pencil-fill`, Delete=red `bi-trash3-fill`
- Formatted timestamps via `new Date(log.timestamp).toLocaleString()`

---

## 🗃 Data Dictionary

Based on `LIMS_Data_Dictionary_Template.xlsx`:

### Demographics (Participant)
| Variable | Django Field | Type | Notes |
|---|---|---|---|
| Participant ID | `participant_id` | CharField(50) | Unique; e.g. KNH-001 |
| Study Name | `study_name` | CharField(200) | e.g. COVID-19 Cohort |
| Date of Birth | `date_of_birth` | DateField | |
| Age | `age` | PositiveIntegerField | |
| Sex | `sex` | CharField(1) | Choices: M / F / O |
| Enrollment Date | `enrollment_date` | DateField | |

### Phlebotomy
| Variable | Django Field | Choices |
|---|---|---|
| Sample Type | `sample_type` | blood, sputum, urine, other |
| Collection Tube Type | `tube_type` | EDTA, LIHEP, SST, SODIUM_CITRATE, BLOOD_CULTURE, RED_TOP, URINE_CONTAINER, OTHER |
| Volume Collected | `volume_collected` | 3ML, 6ML, 10ML, OTHER |
| Collection Site | `collection_site` | venous, capillary, arterial |
| Collection Notes | `collection_notes` | SUFFICIENT, INSUFFICIENT, OTHER |
| Visit Type | `visit_type` | screening, baseline, follow_up, exit, unscheduled |
| Consented | `consented` | BooleanField (Yes/No) |
| Sample Collected | `sample_collected` | BooleanField (Yes/No; open notes for No) |

### Sample Processing
| Variable | Django Field | Notes |
|---|---|---|
| Accession Number | `accession_number` | Unique; e.g. ACC-2024-001 |
| Tubes Received | `tubes_edta` … `tubes_other` | 7 separate integer fields |
| Processing Type | `processing_type` | centrifugation, incubation, aliquoting, other |
| Equipment Used | `equipment_used` | ref_centrifuge, non_ref_centrifuge, other |
| Centrifugation Start/End | `centrifugation_start/end` | DateTimeField (nullable) |
| Incubation Start/End | `incubation_start/end` | DateTimeField (nullable) |
| Results Dispatch Time | `results_dispatch_time` | DateTimeField (nullable) |
| Results Dispatched To | `results_dispatched_to` | CharField(200) |

### Sample Storage
| Variable | Django Field | Notes |
|---|---|---|
| Sample ID | `sample_id` | Unique; e.g. SMP-001 |
| Freezer ID | `freezer_id` | Optional |
| Fridge ID | `fridge_id` | Optional |
| Shelf / Rack / Box / Position | `shelf_number` etc. | Optional location fields |
| Storage Temperature | `storage_temperature` | 2-8, -20, -80 |
| Storage Condition | `storage_condition` | good, compromised |
| Retrieval Date/Time | `retrieval_datetime` | DateTimeField (nullable) |
| Retrieved By | `retrieved_by` | Optional |
| Retrieval Condition | `retrieval_condition` | good, compromised |

### Stock Inventory
| Variable | Django Field | Notes |
|---|---|---|
| Item ID | `item_id` | Unique; e.g. STK-001 |
| Category | `category` | reagent, consumable |
| Supplier | `supplier` | CharField(200) |
| Batch Number | `batch_number` | CharField(100) |
| Expiry Date | `expiry_date` | DateField; alerts at 30 days |
| Quantity Available | `quantity_available` | DecimalField; alerts at ≤ 10 |
| Unit | `unit` | pieces, boxes, liters, other |
| Storage Location | `storage_location` | main_store, departmental_store, quarantine_store |
| Condition Received | `condition_received` | good, damaged, expired |
| Rejection Reason | `rejection_reason` | TextField; open notes |

---

## ⚙️ Backend Setup

### Prerequisites
- Python 3.10 or higher
- pip

### Step-by-step

```bash
# 1. Navigate to project root
cd lims/

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
source venv/bin/activate        # macOS / Linux
venv\Scriptsctivate           # Windows

# 4. Install Python dependencies
pip install -r requirements.txt

# 5. Apply database migrations (creates db.sqlite3)
python manage.py migrate

# 6. Create a superuser
python manage.py createsuperuser
# Enter: username, email, password when prompted

# 7. Start the development server
python manage.py runserver
```

- Backend running at: **http://localhost:8000**
- Django Admin: **http://localhost:8000/admin/**
- REST API base: **http://localhost:8000/api/**

---

## 🖥 Frontend Setup

### Prerequisites
- Node.js 18 or higher
- npm 9 or higher

### Step-by-step

```bash
# 1. Navigate to frontend directory
cd lims/frontend/

# 2. Install Node dependencies
npm install

# 3. Start the Vite development server
npm run dev
```

Frontend running at: **http://localhost:5173**

Vite automatically proxies `/api/*` to Django — no CORS configuration needed during development.

### Production build

```bash
cd frontend/
npm run build
# Compiled output → frontend/dist/

# Back in project root, collect static files
cd ..
python manage.py collectstatic
# Serves React from /static/ via Django in production
```

---

## 🚀 Running the Full Stack

### Option A — Two Terminals (Recommended for Development)

**Terminal 1 — Backend:**
```bash
cd lims/
source venv/bin/activate
python manage.py runserver
```

**Terminal 2 — Frontend:**
```bash
cd lims/frontend/
npm run dev
```

Open **http://localhost:5173** in your browser. Login with admin credentials.

### Option B — Startup Script

```bash
cd lims/
chmod +x start.sh
./start.sh
```

Starts both servers in the background. Press Ctrl+C to stop both.

---

## 🔌 API Reference

All endpoints (except `/api/auth/login/`) require:
```
Authorization: Token <your-token-here>
Content-Type: application/json
```

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login/` | No | Returns token + user |
| POST | `/api/auth/logout/` | Yes | Deletes token |
| GET | `/api/auth/me/` | Yes | Current user info |

**Login request:**
```json
{ "username": "admin", "password": "admin123" }
```

**Login response:**
```json
{
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "user": { "id": 1, "username": "admin", "is_staff": true }
}
```

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/stats/` | All metrics, chart data, alerts |

### Participants — `/api/participants/`

| Method | Endpoint | Query Params | Description |
|---|---|---|---|
| GET | `/api/participants/` | `search`, `sex`, `study_name`, `ordering`, `page` | List (paginated) |
| POST | `/api/participants/` | — | Create new |
| GET | `/api/participants/{id}/` | — | Retrieve one |
| PUT | `/api/participants/{id}/` | — | Full update |
| PATCH | `/api/participants/{id}/` | — | Partial update |
| DELETE | `/api/participants/{id}/` | — | Delete |
| GET | `/api/participants/export_excel/` | — | Download .xlsx |

### Phlebotomy — `/api/phlebotomy/`

Same CRUD pattern. Extra query params: `sample_type`, `tube_type`, `visit_type`, `consented`, `sample_collected`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/phlebotomy/export_excel/` | Download styled .xlsx |

### Sample Processing — `/api/processing/`

Extra query params: `processing_type`, `equipment_used`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/processing/export_excel/` | Download styled .xlsx |

### Sample Storage — `/api/storage/`

Extra query params: `storage_temperature`, `storage_condition`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/storage/export_excel/` | Download styled .xlsx |

### Stock Inventory — `/api/stock/`

Extra query params: `category`, `storage_location`, `condition_received`, `unit`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/stock/export_excel/` | Download styled .xlsx |
| GET | `/api/stock/low_stock/` | Items with qty ≤ 10 |
| GET | `/api/stock/expiring/` | Items expiring within 30 days |

### Audit Logs — `/api/audit-logs/` (read-only)

| Method | Endpoint | Query Params | Description |
|---|---|---|---|
| GET | `/api/audit-logs/` | `action`, `model_name`, `search`, `page` | List all logs |
| GET | `/api/audit-logs/{id}/` | — | Retrieve one log |

---

## 🔑 Default Credentials

| | |
|---|---|
| **Username** | `admin` |
| **Password** | `admin123` |
| **Admin URL** | http://localhost:8000/admin/ |

> ⚠️ Change the password before sharing access or deploying publicly.

---

## 🌐 Hosting Options (No Domain Required)

### Option 1 — Local Network Only

```bash
python manage.py runserver 0.0.0.0:8000
```
Access from any device on the same Wi-Fi: `http://192.168.x.x:8000`
Works as a lab intranet — no internet or domain needed.

### Option 2 — GitHub Pages + Railway (Free, Public URL)

Free subdomains provided by both platforms. Full guide below.

### Option 3 — Vercel + Render (Free)

- Vercel: `https://lims.vercel.app`
- Render: `https://lims-api.onrender.com` *(note: free tier sleeps after 15 min inactivity)*

### Option 4 — Single VPS with Gunicorn + Nginx

Full control. Deploy to any DigitalOcean/Linode/Hetzner $4/month droplet.

---

## 📦 Deployment Guide — GitHub + Railway (Free, No Domain)

### Step 1 — Create `.gitignore`

Create `lims/.gitignore`:
```
venv/
__pycache__/
*.pyc
*.pyo
db.sqlite3
staticfiles/
media/
.env
frontend/node_modules/
frontend/dist/
```

### Step 2 — Push to GitHub

```bash
cd lims/
git init
git add .
git commit -m "Initial LIMS commit"

# Create a new repo at github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/lims.git
git push -u origin main
```

### Step 3 — Deploy Backend to Railway

1. Go to **https://railway.app** → Sign up with GitHub (free)
2. Click **New Project** → **Deploy from GitHub Repo** → select `lims`
3. Set the **Start Command** in Railway settings:
   ```
   gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
   ```
4. Add **Environment Variables** in Railway dashboard:
   ```
   SECRET_KEY=<generate-a-strong-key>
   DEBUG=False
   ALLOWED_HOSTS=<your-app>.up.railway.app
   ```
5. Add **PostgreSQL Plugin** (Railway provides free PostgreSQL + sets `DATABASE_URL` automatically)
6. Update `config/settings.py` to use PostgreSQL when deployed:
   ```python
   import os, dj_database_url
   if os.environ.get('DATABASE_URL'):
       DATABASES = {'default': dj_database_url.parse(os.environ['DATABASE_URL'])}
   ```
   Add to `requirements.txt`:
   ```
   dj-database-url
   psycopg2-binary
   ```
7. After deployment, run via Railway shell:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```
8. Railway gives you: `https://lims-production.up.railway.app`

### Step 4 — Deploy Frontend to GitHub Pages

1. Update `config/settings.py` CORS:
   ```python
   CORS_ALLOWED_ORIGINS = ['https://YOUR_USERNAME.github.io']
   ```

2. Update `frontend/package.json`:
   ```json
   {
     "homepage": "https://YOUR_USERNAME.github.io/lims"
   }
   ```

3. Create `frontend/.env.production`:
   ```
   VITE_API_URL=https://lims-production.up.railway.app/api
   ```

4. Update `frontend/src/utils/api.js` to use the env var:
   ```js
   const api = axios.create({
     baseURL: import.meta.env.VITE_API_URL || '/api'
   })
   ```

5. Install gh-pages:
   ```bash
   cd frontend/
   npm install --save-dev gh-pages
   ```
   Add to `package.json` scripts:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```

6. Deploy:
   ```bash
   npm run deploy
   ```

7. In GitHub repo → **Settings** → **Pages** → source: `gh-pages` branch → `/root`

✅ Your LIMS is live at `https://YOUR_USERNAME.github.io/lims` — no domain purchased.

---

## 🔐 Environment Variables

| Variable | Example Value | Where Used | Description |
|---|---|---|---|
| `SECRET_KEY` | `django-prod-abc...xyz` | `settings.py` | Django cryptographic key — generate fresh for prod |
| `DEBUG` | `False` | `settings.py` | Must be `False` in production |
| `ALLOWED_HOSTS` | `lims.up.railway.app` | `settings.py` | Comma-separated allowed host names |
| `DATABASE_URL` | `postgresql://user:pass@host/db` | `settings.py` | Full DB connection string (Railway sets this automatically) |
| `VITE_API_URL` | `https://lims-api.up.railway.app/api` | `api.js` (build time) | Frontend API base URL for production |

Generate a new Django secret key:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

## 🔧 Troubleshooting

**CORS error in browser console**
- Ensure `corsheaders.middleware.CorsMiddleware` is the **first** item in `MIDDLEWARE`
- Ensure `CORS_ALLOWED_ORIGINS` exactly matches your frontend URL (no trailing slash)
- In development, Vite proxy handles this — CORS errors in dev usually mean the backend isn't running

**401 Unauthorized on all API requests**
- Token may have expired — log out and log back in
- Verify `Authorization: Token <token>` is being sent (check Network tab in browser DevTools)
- Check that `api.js` request interceptor reads from `localStorage.getItem('lims_token')`

**Sidebar doesn't show/close on mobile**
- On screens < 768px the sidebar starts hidden; tap the ≡ toggle button in the navbar
- The dark overlay behind the sidebar is clickable to close it

**Excel export downloads a corrupt file**
- Ensure `openpyxl` is installed: `pip install openpyxl`
- Ensure `responseType: 'blob'` is set in the axios export call inside `api.js`
- Check browser console and Django terminal for any 500 errors

**"No module named X" on runserver**
- Activate your virtual environment first: `source venv/bin/activate`
- Then run: `pip install -r requirements.txt`

**Migrations fail or database errors**
```bash
# Reset and recreate migrations
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
python manage.py makemigrations core
python manage.py migrate
```

**Static files return 404 in production**
```bash
# Rebuild frontend and collect static
cd frontend && npm run build
cd .. && python manage.py collectstatic --noinput
# Ensure STATIC_ROOT is set in settings.py and your web server serves it
```

**Charts don't render on Dashboard**
- Ensure `recharts` is in `package.json` and `npm install` was run
- Check browser console for import errors

---

## 📞 Quick Reference Commands

```bash
# ── BACKEND ─────────────────────────────────────
source venv/bin/activate                        # Activate virtual environment
python manage.py runserver                      # Start dev server (localhost:8000)
python manage.py runserver 0.0.0.0:8000        # Start on all interfaces (LAN access)
python manage.py migrate                        # Apply database migrations
python manage.py makemigrations                 # Create new migrations after model changes
python manage.py createsuperuser                # Create admin user
python manage.py shell                          # Open Django interactive shell
python manage.py collectstatic                  # Gather static files for production
python manage.py check                          # Check project for errors
gunicorn config.wsgi:application --bind 0.0.0.0:8000   # Run with Gunicorn (production)

# ── FRONTEND ─────────────────────────────────────
cd frontend/
npm install                                     # Install dependencies
npm run dev                                     # Start Vite dev server (localhost:5173)
npm run build                                   # Build for production → dist/
npm run preview                                 # Preview production build locally
npm run deploy                                  # Deploy to GitHub Pages (gh-pages branch)
```

---

*LIMS — Built for research laboratory sample management. Extend freely for your study needs.*