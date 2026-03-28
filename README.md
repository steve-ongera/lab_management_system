# LIMS – Laboratory Information Management System

A full-stack LIMS built with **Django REST Framework** (backend) and **React + Vite** (frontend).

---

## Project Structure

```
lims/
├── config/          # Django project settings & URLs
├── core/            # Core app: models, serializers, views, admin
│   └── migrations/
├── frontend/        # React + Vite frontend (see setup below)
│   ├── src/
│   │   ├── index.html
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── styles/main.css
│   │   ├── utils/api.js
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── ...
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── Dashboard.jsx
│   │       ├── Participants.jsx
│   │       ├── Phlebotomy.jsx
│   │       ├── SampleProcessing.jsx
│   │       ├── SampleStorage.jsx
│   │       └── StockInventory.jsx
│   └── package.json
├── db.sqlite3
├── manage.py
└── requirements.txt
```

---

## Backend Setup

```bash
# 1. Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run migrations
python manage.py migrate

# 4. Create superuser
python manage.py createsuperuser

# 5. Start backend
python manage.py runserver
```

Backend runs at: http://localhost:8000
Django Admin: http://localhost:8000/admin/

---

## Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (proxies /api → Django)
npm run dev
```

Frontend runs at: http://localhost:5173

---

## API Endpoints

| Module            | Endpoint                          | Methods                  |
|-------------------|-----------------------------------|--------------------------|
| Auth              | /api/auth/login/                  | POST                     |
| Auth              | /api/auth/logout/                 | POST                     |
| Auth              | /api/auth/me/                     | GET                      |
| Dashboard         | /api/dashboard/stats/             | GET                      |
| Participants      | /api/participants/                | GET, POST                |
| Participants      | /api/participants/{id}/           | GET, PUT, PATCH, DELETE  |
| Participants      | /api/participants/export_excel/   | GET                      |
| Phlebotomy        | /api/phlebotomy/                  | GET, POST                |
| Phlebotomy        | /api/phlebotomy/export_excel/     | GET                      |
| Sample Processing | /api/processing/                  | GET, POST                |
| Sample Processing | /api/processing/export_excel/     | GET                      |
| Sample Storage    | /api/storage/                     | GET, POST                |
| Sample Storage    | /api/storage/export_excel/        | GET                      |
| Stock Inventory   | /api/stock/                       | GET, POST                |
| Stock Inventory   | /api/stock/export_excel/          | GET                      |
| Stock Inventory   | /api/stock/low_stock/             | GET                      |
| Stock Inventory   | /api/stock/expiring/              | GET                      |
| Audit Logs        | /api/audit-logs/                  | GET (read-only)          |

All endpoints require Token authentication except /api/auth/login/.

Authentication header:
```
Authorization: Token <your-token-here>
```

---

## Hosting Options

### Option 1 – Local (No Domain Required)
Run both servers locally. Access via http://localhost:5173.
For LAN access: use your machine IP e.g. http://192.168.1.x:5173

### Option 2 – GitHub Pages (Frontend only)
```bash
# In frontend/package.json, set "homepage": "https://<you>.github.io/<repo>"
npm run build
# Push dist/ contents to gh-pages branch
npm install -g gh-pages
gh-pages -d dist
```
Note: Backend must be hosted separately (Railway, Render, etc.)

### Option 3 – Full Free Deployment (No domain needed)
- **Backend**: Deploy to Railway.app or Render.com (free tier, gives subdomain)
- **Frontend**: Deploy to Vercel or Netlify (free, gives subdomain)
- Update CORS_ALLOWED_ORIGINS and ALLOWED_HOSTS in settings.py

### Option 4 – Single Server with Gunicorn + Nginx
```bash
pip install gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```
Then serve React build via Nginx on port 80.

---

## Default Credentials
- Username: admin
- Password: admin123
⚠️  Change before deploying to production!

---

## Data Dictionary (from LIMS_Data_Dictionary_Template.xlsx)

### Demographics (Participant)
Participant ID, Study Name, Date of Birth, Age, Sex, Enrollment Date

### Phlebotomy
Participant ID, Collector, Date/Time, Sample Type, Tube Type, Volume, Site, Notes, Consented, Visit Type, Collected

### Sample Processing
Accession Number, Reception Date/Time, Tube counts by type, Processing Type, Aliquot Number, Technologist, Equipment, Centrifuge/Incubation times, Dispatch info

### Sample Storage
Sample ID, Freezer/Fridge ID, Shelf/Rack/Box/Position, Temperature, Date Stored, Condition, Retrieval info

### Stock Inventory
Item ID, Name, Category, Supplier, Batch Number, Expiry Date, Quantity, Unit, Location, Condition, Received by, Reception Date