import json
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware

try:
    from .db import init_db
    init_db()
except Exception:
    pass

app = FastAPI(title="Portable Etsy Order Manager API")

# CORS middleware ekle
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production'da specific domain kullan
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes'ları dahil et
try:
    from .routes.orders import router as orders_router
    app.include_router(orders_router, prefix="/api")
    print("Routes loaded successfully")
except Exception as e:
    print(f"Error loading routes: {e}")

# Statik içerikleri sun (frontend/dist → app/static)
static_dir = Path(__file__).parent / "static"
if not static_dir.exists():
    # PyInstaller ile build edildiğinde static dosyalar kök dizinde olur
    static_dir = Path.cwd() / "static"
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/debug", response_class=HTMLResponse)
def debug_page():
    """Debug sayfası"""
    debug_file = Path(__file__).parent.parent / "debug.html"
    if debug_file.exists():
        with open(debug_file, "r", encoding="utf-8") as f:
            return f.read()
    return "<h1>Debug sayfası bulunamadı</h1>"

@app.get("/", response_class=HTMLResponse)
def root():
    """Ana sayfa - HTML dosyasını döndür"""
    static_dir = Path(__file__).parent / "static"
    index_file = static_dir / "index.html"
    if index_file.exists():
        with open(index_file, "r", encoding="utf-8") as f:
            return f.read()
    return "<h1>Portable Etsy Manager API</h1><p>Frontend dosyaları bulunamadı</p>"

@app.get("/health")
def health():
    return {"status": "ok", "message": "Portable Etsy Manager API çalışıyor"}
