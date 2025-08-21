# Portable Etsy Manager - ENHANCED EDITION

> **A lightweight, self‑contained application that runs the Etsy Manager API and (optionally) a React/Vite UI on any Windows 10 Pro machine without requiring additional installations.**

## 🆕 Latest Updates (August 2025)

### ✅ Recently Completed Features
- **📧 Gmail Integration**: Automatic Etsy order extraction from Gmail
- **📊 Enhanced Orders Table**: 18-column detailed order view with full customer data
- **💬 Single Channel Chat**: Unified chat system for all users
- **📅 Calendar Notes**: Click-to-add notes on calendar days
- **💾 Data Persistence**: All changes saved with localStorage
- **🎨 Modern UI**: Complete React 18 + Styled Components interface

### 🔧 Technical Achievements
- **Frontend**: React 18.2.0, Vite 5.4.19, Styled Components 6.0.0
- **Backend**: FastAPI serving 47 Gmail orders via REST API
- **Data Flow**: Complete Gmail → Backend → Frontend → UI pipeline
- **Persistence**: localStorage implementation across all components
- **Architecture**: Single-page application with component-based navigation

### 📈 Current Status
- ✅ All major features implemented and tested
- ✅ Frontend running on http://localhost:5175
- ✅ Backend API operational on http://localhost:8000
- ✅ Gmail data successfully imported and displayed
- ✅ Ready for production deployment

---table Etsy Manager

> **A lightweight, self‑contained application that runs the Etsy Manager API and (optionally) a React/Vite UI on any Windows 10 Pro machine without requiring additional installations.**

---

## 📦  What’s Inside?
| Component | Purpose |
|-----------|---------|
| `app/` | FastAPI backend – handles all business logic and data access.
| `frontend/` | React/Vite UI (3‑D Kanban board). Build this only if you want the web interface.
| `build_portable.ps1` | One‑click PowerShell script that:
| | 1. Creates a Python virtual environment, installs dependencies.
| | 2. Builds the FastAPI app into a single executable using PyInstaller.
| | 3. (Optional) Copies frontend static files to `app/static`.

---

## ⚙️  Prerequisites
- **Windows 10 Pro** (64‑bit, 10.0.26100+)
- **Python 3.13+** (or any >= 3.8) – must include the `venv` module.
- **Node.js LTS** (if you plan to rebuild the frontend).  You can skip this step if you only need the API.

---

## 🛠️  Backend Overview
The backend is a FastAPI application located in the root (`portable_etsy_manager.py`). It exposes REST endpoints for:
- **Shops** – list, create, update, delete.
- **Items** – CRUD operations on Etsy listings.
- **Orders** – fetch and update order status.

Data persistence is handled by a SQLite database (default `data/etsy.db`).  The connection string can be overridden in `config/settings.json` if you prefer PostgreSQL/MySQL, etc.  All database migrations are performed automatically via Alembic on first run.

---

## ⚙️  Setup – Backend Only
1. **Create a virtual environment** (once per machine):
   ```powershell
   python -m venv .venv
   ```
2. **Activate the environment**:
   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```
3. **Install Python dependencies**:
   ```powershell
   pip install -r requirements.txt
   ```
4. **Configure settings** (optional):
   Edit `config/settings.json` to change database URL, API keys, or logging level.
5. **Run the application locally**:
   ```powershell
   python portable_etsy_manager.py
   ```
   The API will be available at `http://localhost:3000/`.  FastAPI’s automatic docs can be accessed via `http://localhost:3000/docs`.

---

## 🚀  Quick Start – Only the API (no UI)
```powershell
cd C:\Users\Hakan\Desktop\gmail\portable_etsy_manager
.uild_portable.ps1   # Builds a self‑contained .exe
.portable_etsy_manager.exe   # Starts the server
```
The executable uses the same `config/settings.json` and will create the SQLite DB if it does not exist.

---

## 🛠️  Re‑Build the Frontend (Optional)
If you want to modify or rebuild the React UI:
```powershell
cd .\frontend
npm install --legacy-peer-deps
npx vite build
xcopy /E /I .\dist ..\app\static\
```
After copying, run `build_portable.ps1` again – it will pick up the new UI.

---

## 🏗️  Hosting / Production Deployment
### Docker (recommended for isolation)
The repository contains a `Dockerfile.backend` and a minimal `docker-compose.yml`.  To deploy:
```bash
# Build image
docker build -t portable-etsy-manager .

# Run container
docker run -d --name etsy_mgr \
  -p 3000:3000 \
  -v C:\Users\Hakan\Desktop\gmail\portable_etsy_manager\data:/app/data \
  portable-etsy-manager
```
The volume mount keeps the SQLite DB persistent across container restarts.

### Windows Service (for on‑boot persistence)
Create a service that runs the executable:
```powershell
sc create EtsyMgr binPath= "C:\Users\Hakan\Desktop\gmail\portable_etsy_manager\portable_etsy_manager.exe" start= auto
sc description EtsyMgr "Portable Etsy Manager API"
```
Then start it: `sc start EtsyMgr`.

### Cloud Options
You can also push the Docker image to a container registry (Azure Container Registry, AWS ECR, GCP Artifact Registry) and run it on any cloud VM or managed Kubernetes cluster.  The only requirement is that port **3000** be exposed and the `data` volume persisted via a cloud storage bucket or persistent disk.

---

## 🔍  Testing Endpoints
```bash
# List shops
curl http://localhost:3000/api/shops

# Create an item (JSON payload)
curl -X POST http://localhost:3000/api/items \
     -H "Content-Type: application/json" \
     -d '{"title":"Sample Item","price":9.99}'
```
Use Postman or any REST client to explore all routes via the interactive docs at `/docs`.

---

## 📄  Configuration File (`config/settings.json`)
```json
{
  "database_url": "sqlite:///data/etsy.db",
  "log_level": "INFO"
}
```
- `database_url`: SQLAlchemy connection string.  Change to PostgreSQL, MySQL, etc.
- `log_level`: Logging verbosity (`DEBUG`, `INFO`, `WARNING`).

---

## 🔒  Security & Permissions
- The application only writes to the project directory and its sub‑folders; it never modifies system folders or registry keys.
- API authentication is not included out of the box.  If you expose the endpoint publicly, consider adding OAuth/JWT middleware or reverse‑proxy basic auth.
- Keep `settings.json` secret – especially if you use external databases or API keys.

---

## 🎉  Done!
You now have a fully functional, portable Etsy Manager that can be run locally, packaged as an executable, or deployed via Docker/Windows Service.  Happy coding! 
