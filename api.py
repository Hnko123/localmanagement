"""
FastAPI backend for Portable Etsy Order Manager.
Provides simple REST endpoints for consuming order data.
"""

from fastapi.middleware.cors import CORSMiddleware
import json
from pathlib import Path
from fastapi import FastAPI, HTTPException, Response, Depends, status
from typing import List, Dict
import requests
import csv
import io
from fastapi.staticfiles import StaticFiles
import hashlib
import threading
import time
from datetime import datetime, timedelta

# Google Drive API imports
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import base64
import io
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.auth.transport.urllib3 import AuthorizedHttp
import pickle
import os
import webbrowser

from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from pydantic import BaseModel
from jose import JWTError, jwt

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./users.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# User model
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    role = Column(String, default="user")  # Options: admin, manager, user
    avatar = Column(String, default="")  # URL to avatar image
    skills = Column(String, default="")  # Comma-separated skills
    phone = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

# Task model
class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    status = Column(String, default="todo")  # todo, in-progress, done
    assigned_to = Column(Integer, index=True, nullable=True)
    priority = Column(String, default="medium")  # low, medium, high
    start_date = Column(DateTime, default=datetime.utcnow)
    deadline = Column(DateTime, nullable=True)
    attachment = Column(String, nullable=True)  # JSON string for file attachments
    created_by = Column(Integer, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Calendar Event model
class CalendarEvent(Base):
    __tablename__ = "calendar_events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    event_date = Column(DateTime)
    assigned_to = Column(Integer, index=True, nullable=True)
    type = Column(String, default="event")  # event, note, reminder
    priority = Column(String, default="medium")  # low, medium, high
    recurrence = Column(String, nullable=True)  # daily, weekly, monthly
    reminder = Column(Integer, nullable=True)  # minutes before
    color = Column(String, default="#667eea")  # hex color
    created_by = Column(Integer, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Notifications model
class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    title = Column(String)
    message = Column(String)
    type = Column(String)  # task_assigned, event_assigned, reminder
    related_id = Column(Integer, nullable=True)  # ID of task/event
    data = Column(String, nullable=True)  # JSON string for additional data
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

# Pydantic models
class UserCreate(BaseModel):
    username: str
    email: str
    full_name: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    is_active: bool
    role: str
    avatar: str
    skills: str
    phone: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

class LoginRequest(BaseModel):
    username: str
    password: str

# Task Pydantic models
class TaskCreate(BaseModel):
    title: str
    description: str
    assigned_to: int | None = None
    priority: str = "medium"
    deadline: str | None = None  # ISO string

class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    status: str
    assigned_to: int | None
    priority: str
    start_date: str
    deadline: str | None
    attachment: str | None
    created_by: int
    created_at: str
    updated_at: str

# Calendar Event Pydantic models
class CalendarEventCreate(BaseModel):
    title: str
    description: str
    assigned_to: int | None = None
    event_date: str  # ISO string
    type: str = "event"
    priority: str = "medium"
    recurrence: str | None = None
    reminder: int | None = None
    color: str = "#667eea"

class CalendarEventResponse(BaseModel):
    id: int
    title: str
    description: str
    event_date: str
    assigned_to: int | None
    type: str
    priority: str
    recurrence: str | None
    reminder: int | None
    color: str
    created_by: int
    created_at: str
    updated_at: str

# Notification Pydantic models
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    related_id: int | None
    data: str | None
    is_read: bool
    created_at: str

# Order edit Pydantic models
class OrderUpdate(BaseModel):
    Kesildi: str | None = None  # TRUE/FALSE values
    Hazır: str | None = None
    Gönderildi: str | None = None
    importantnote: str | None = None
    FullAdress: str | None = None
    vatcollected: str | None = None
    vatid: str | None = None
    Problem: str | None = None

# Auth utilities
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Admin configuration
ADMIN_EMAIL = "etsyortakk@gmail.com"

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def authenticate_user(db: Session, username: str, password: str):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI(title="Portable Etsy Order Manager API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

cache_dir = Path(__file__).parent / "static" / "image_cache"
cache_dir.mkdir(parents=True, exist_ok=True)
app.mount("/images", StaticFiles(directory=str(cache_dir)), name="images")

BASE_DIR = Path(__file__).parent
ORDERS_JSON_SCRIPT = BASE_DIR / "data" / "etsy_orders.json"
ORDERS_JSON_CWD = Path.cwd() / "portable_etsy_manager" / "data" / "etsy_orders.json"
CACHE_FILE = BASE_DIR / "data" / "orders_cache.json"
ASSIGNMENTS_FILE = BASE_DIR / "data" / "assignments.json"

# Google Drive authentication
def load_credentials():
    """Load Gmail credentials from file"""
    cred_file = BASE_DIR / "config" / "gmail_credentials.txt"
    if not cred_file.exists():
        raise Exception("gmail_credentials.txt bulunamadı")

    with open(cred_file, 'r', encoding='utf-8') as f:
        lines = f.read().strip().split('\n')

    creds = {}
    for line in lines:
        if ':' in line:
            key, value = line.split(':', 1)
            creds[key.strip()] = value.strip()

    return creds

def get_google_drive_creds_file():
    """Get or create Google credentials file for OAuth"""
    creds_file = BASE_DIR / "config" / "google_credentials.json"

    # Create client config from credentials.txt
    creds_dict = load_credentials()

    if creds_dict.get('Google Client ID') and creds_dict.get('Google Client Secret'):
        # Create Google OAuth client config
        client_config = {
            "installed": {
                "client_id": creds_dict['Google Client ID'],
                "project_id": "etsy-order-manager",  # arbitrary
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "client_secret": creds_dict['Google Client Secret'],
                "redirect_uris": ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"]
            }
        }

        # Save to file
        with open(creds_file, 'w') as f:
            json.dump(client_config, f)
        print(f"[DEBUG] Google credentials file created: {creds_file}")

    return creds_file

def get_google_drive_service():
    """Google Drive API service instance with OAuth"""
    try:
        creds_file = get_google_drive_creds_file()
        scopes = ['https://www.googleapis.com/auth/drive.readonly']

        creds = None
        token_file = BASE_DIR / "config" / "google_token.pickle"

        # Check if token exists
        if token_file.exists():
            with open(token_file, 'rb') as token:
                creds = pickle.load(token)

        # If there are no (valid) credentials available, let user authenticate
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
                print("[SUCCESS] Token refreshed")
            else:
                print("[INFO] No valid credentials. Starting OAuth flow...")
                print("[INFO] Please visit: http://localhost:8080/auth/google-drive to authenticate")

                # Store message about needing authentication
                return None

            # Save refreshed credentials
            with open(token_file, 'wb') as token:
                pickle.dump(creds, token)

        service = build('drive', 'v3', credentials=creds)
        return service
    except Exception as e:
        print(f"[ERROR] Failed to initialize Google Drive service: {e}")
        return None

# Try to initialize Google Drive service
try:
    drive_service = get_google_drive_service()
    if drive_service:
        print("[SUCCESS] Google Drive API service initialized")
    else:
        drive_service = None
        print("[WARNING] Google Drive API not available")
except Exception as e:
    drive_service = None
    print(f"[ERROR] Google Drive API initialization failed: {e}")

# Global cache
orders_cache = []

# Notifications system
notifications_cache = []

def fetch_orders_from_sheet():
    sheet_id = "1_h3QWwiSS6Pc8aYqwaXUMlryObgHqm4pkr-DbtqY5Qk"
    csv_url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv"
    try:
        print(f"[DEBUG] Fetching orders from Google Sheets: {csv_url}")
        response = requests.get(csv_url, timeout=10)
        response.raise_for_status()
        csv_data = response.text
        reader = csv.DictReader(io.StringIO(csv_data))
        raw_orders = [row for row in reader]
        print(f"[DEBUG] Fetched: {len(raw_orders)} records from Google Sheets")
        return raw_orders
    except Exception as e:
        print(f"[ERROR] Failed to fetch from Sheet: {e}")
        return None

def load_cache():
    global orders_cache
    if CACHE_FILE.exists():
        try:
            with open(CACHE_FILE, 'r', encoding='utf-8') as f:
                orders_cache = json.load(f)
            print(f"[DEBUG] Loaded {len(orders_cache)} records from cache")
        except Exception as e:
            print(f"[ERROR] Failed to load cache: {e}")
            orders_cache = []

def save_cache():
    try:
        with open(CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(orders_cache, f)
        print(f"[DEBUG] Saved {len(orders_cache)} records to cache")
    except Exception as e:
        print(f"[ERROR] Failed to save cache: {e}")

def download_order_images():
    """Download images from Google Drive URLs in orders cache"""
    global orders_cache

    print("[INFO] Starting automatic image download from Google Drive URLs...")

    downloaded_count = 0
    for order in orders_cache:
        # Check if order has photo URL
        photo_url = order.get('photo', '').strip()
        if not photo_url:
            continue

        if "drive.google.com" in photo_url:
            print(f"[DEBUG] Processing Google Drive image URL: {photo_url}")

            # Extract file ID from Google Drive URL
            if "id=" in photo_url:
                file_id = photo_url.split("id=")[1].split("&")[0].split("?")[0].split("#")[0]
                print(f"[DEBUG] Extracted file ID: {file_id}")

                # Create hashed filename for cache
                hashed = hashlib.md5(photo_url.encode()).hexdigest()
                cache_file = cache_dir / f"{hashed}.jpg"

                # Check if already cached
                if not cache_file.exists():
                    print(f"[DEBUG] Downloading image for {file_id}...")

                    try:
                        # Try different Google Drive access methods
                        possible_urls = [
                            f"https://drive.google.com/uc?export=download&id={file_id}",
                            f"https://drive.google.com/uc?export=view&id={file_id}",
                            f"https://drive.google.com/uc?export=open&id={file_id}",
                            f"https://drive.google.com/uc?id={file_id}",
                        ]

                        image_downloaded = False
                        for test_url in possible_urls:
                            try:
                                print(f"[DEBUG] Trying Google Drive URL: {test_url}")
                                headers = {
                                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                                    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                                    'Accept-Language': 'en-US,en;q=0.9',
                                    'Accept-Encoding': 'gzip, deflate, br',
                                    'DNT': '1',
                                    'Connection': 'keep-alive',
                                    'Upgrade-Insecure-Requests': '1',
                                }

                                response = requests.get(test_url, timeout=30, headers=headers, allow_redirects=True, stream=True)

                                if response.status_code == 200:
                                    content = response.content
                                    content_length = len(content)

                                    if content_length > 1000:  # Valid image size
                                        # Save to cache
                                        cache_file.write_bytes(content)
                                        print(f"[SUCCESS] Cached image: {cache_file.name}, size: {content_length} bytes")
                                        downloaded_count += 1
                                        image_downloaded = True
                                        break
                                    else:
                                        print(f"[WARNING] Invalid content size {content_length} for {test_url}")

                            except Exception as e:
                                print(f"[WARNING] Failed URL {test_url}: {str(e)}")
                                continue

                        if not image_downloaded:
                            print(f"[ERROR] Failed to download image for {file_id}")

                    except Exception as e:
                        print(f"[ERROR] Failed to download image for {photo_url}: {str(e)}")

                else:
                    print(f"[DEBUG] Image already cached: {cache_file.name}")

                # Update order photo URL to cached image URL if downloaded
                if cache_file.exists():
                    cached_image_url = f"/images/{cache_file.name}"
                    order['photo'] = cached_image_url
                    print(f"[DEBUG] Updated order with cached image URL: {cached_image_url}")

    if downloaded_count > 0:
        print(f"[SUCCESS] Downloaded and cached {downloaded_count} images from Google Drive")
        save_cache()  # Save updated cache with new image URLs

def update_cache():
    global orders_cache
    print("[DEBUG] Updating cache...")
    new_orders = fetch_orders_from_sheet()
    if new_orders is not None:
        # Merge by transaction ID
        existing = {order['transaction']: order for order in orders_cache if 'transaction' in order}
        merged = []
        for new_order in new_orders:
            if 'transaction' in new_order and new_order['transaction']:
                if new_order['transaction'] in existing:
                    # Update existing if different
                    existing[new_order['transaction']] = new_order
                else:
                    # Add new
                    existing[new_order['transaction']] = new_order
        merged = list(existing.values())
        orders_cache = merged

        # Try to download images if drive service is available
        download_order_images()

        save_cache()
        print(f"[DEBUG] Cache updated with {len(orders_cache)} records")

def schedule_updates():
    def repeat():
        update_cache()
        timer = threading.Timer(3600, repeat)  # 1 hour
        timer.daemon = True
        timer.start()
    repeat()

# Assignments management
assignments = {}

def load_assignments():
    global assignments
    if ASSIGNMENTS_FILE.exists():
        try:
            with open(ASSIGNMENTS_FILE, 'r', encoding='utf-8') as f:
                assignments = json.load(f)
            print(f"[DEBUG] Loaded assignments: {assignments}")
        except Exception as e:
            print(f"[ERROR] Failed to load assignments: {e}")
            assignments = {}

def save_assignments():
    try:
        with open(ASSIGNMENTS_FILE, 'w', encoding='utf-8') as f:
            json.dump(assignments, f)
        print(f"[DEBUG] Saved assignments: {assignments}")
    except Exception as e:
        print(f"[ERROR] Failed to save assignments: {e}")

# Load assignments on startup
load_assignments()

# Auth routes
@app.post("/api/auth/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    print(f"[DEBUG] Register attempt: {user.username}, {user.email}")
    # Check if user exists
    db_user = db.query(User).filter(
        (User.username == user.username) | (User.email == user.email)
    ).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")

    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    print(f"[DEBUG] User created: {db_user.id}, {db_user.username}")
    return db_user

@app.post("/api/auth/login", response_model=Token)
def login(form_data: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

def get_current_user(token: str = Depends(Depends(lambda: None))):  # For simplicity, simplified
    # For now, skip proper JWT verification in this quick implementation
    return None  # Will implement proper later

@app.get("/api/auth/me", response_model=UserResponse)
def get_current_user_endpoint(db: Session = Depends(get_db)):
    # For now, return first user as placeholder
    user = db.query(User).first()
    if not user:
        raise HTTPException(status_code=404, detail="No users found")
    return user

# Initialize cache and scheduler
load_cache()
if not orders_cache:
    update_cache()  # Initial load
schedule_updates()

@app.get("/api/users", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

@app.put("/api/users/{user_id}")
def update_profile(user_id: int, user_data: dict, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for key, value in user_data.items():
        if hasattr(user, key):
            setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user

@app.post("/api/orders/{order_id}/assign/{user_id}")
def assign_order(order_id: str, user_id: int):
    global assignments
    assignments[order_id] = user_id
    save_assignments()
    return {"message": f"Order {order_id} assigned to user {user_id}"}

@app.get("/api/orders/{order_id}/assignee")
def get_order_assignee(order_id: str):
    global assignments
    user_id = assignments.get(order_id)
    if user_id:
        return {"assigned_user": user_id}
    return {"assigned_user": None}

@app.get("/api/orders", response_model=List[Dict[str, str]])
async def get_orders():
    global orders_cache
    if not orders_cache:
        print("[DEBUG] No cache, updating...")
        update_cache()
    return orders_cache

@app.post("/api/orders/sync")
async def sync_orders(db: Session = Depends(get_db)):
    """Manually sync orders from Google Sheets - Admin only"""
    # Get current user from database (since we don't have proper JWT yet)
    current_user = db.query(User).first()
    if not current_user or current_user.email.lower() != ADMIN_EMAIL.lower():
        raise HTTPException(status_code=403, detail="Bu işlem sadece admin kullanıcısı tarafından yapılabilir")

    global orders_cache
    try:
        print(f"[DEBUG] Manual sync requested by admin: {current_user.username}")
        update_cache()  # This will force refresh and merge data
        return {
            "status": "success",
            "message": f"{len(orders_cache)} sipariş başarıyla Google Sheets'den çekildi ve güncellendi",
            "record_count": len(orders_cache),
            "sheet_url": "https://docs.google.com/spreadsheets/d/1_h3QWwiSS6Pc8aYqwaXUMlryObgHqm4pkr-DbtqY5Qk",
            "admin_user": current_user.email
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Senkronization hatası: {str(e)}",
            "record_count": len(orders_cache) if orders_cache else 0
        }

@app.get("/api/proxy-image")
async def proxy_image(url: str):
    try:
        print(f"[DEBUG] Accessing proxy-image with URL: {url}")

        # Handle Google Drive URLs specifically
        if "drive.google.com" in url:
            # Extract file ID from Google Drive URL
            if "id=" in url:
                file_id = url.split("id=")[1].split("&")[0].split("?")[0].split("#")[0]
                print(f"[DEBUG] Extracted file ID: {file_id}")

                # Try different Google Drive access methods
                possible_urls = [
                    f"https://drive.google.com/uc?export=download&id={file_id}",
                    f"https://drive.google.com/uc?export=view&id={file_id}",
                    f"https://drive.google.com/uc?export=open&id={file_id}",
                    f"https://drive.google.com/uc?id={file_id}",
                ]

                for test_url in possible_urls:
                    try:
                        print(f"[DEBUG] Trying Google Drive URL: {test_url}")
                        headers = {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                            'Accept-Language': 'en-US,en;q=0.9',
                            'Accept-Encoding': 'gzip, deflate, br',
                            'DNT': '1',
                            'Connection': 'keep-alive',
                            'Upgrade-Insecure-Requests': '1',
                        }

                        response = requests.get(test_url, timeout=20, headers=headers, allow_redirects=True, stream=True)

                        if response.status_code != 200:
                            print(f"[DEBUG] Failed with status {response.status_code} for {test_url}")
                            continue

                        content = response.content
                        content_length = len(content)

                        if content_length < 100:  # Probably not an actual image file
                            print(f"[DEBUG] Invalid content length {content_length} for {test_url}")
                            continue

                        content_type = response.headers.get('content-type', 'image/jpeg')
                        print(f"[SUCCESS] Successfully downloaded image from {test_url}, size: {content_length} bytes")

                        # Save to cache
                        hashed = hashlib.md5(url.encode()).hexdigest()
                        cache_file = cache_dir / f"{hashed}.jpg"

                        try:
                            cache_file.write_bytes(content)
                            print(f"[DEBUG] Cached image as {cache_file}")
                        except Exception as cache_e:
                            print(f"[WARNING] Failed to cache image: {cache_e}")

                        return Response(
                            content=content,
                            media_type=content_type
                        )

                    except Exception as e:
                        print(f"[WARNING] Failed URL {test_url}: {str(e)}")
                        continue

                # If all Google Drive attempts fail, use fallback placeholder
                print(f"[ERROR] All Google Drive download attempts failed for {url}")
                raise HTTPException(status_code=500, detail="Google Drive image access denied")

        else:
            # Regular image URL
            print(f"[DEBUG] Processing regular image URL: {url}")
            hashed = hashlib.md5(url.encode()).hexdigest()
            cache_file = cache_dir / f"{hashed}.jpg"
            media_type = 'image/jpeg'

            if cache_file.exists():
                print(f"[DEBUG] Serving cached image for {url}")
                return Response(
                    content=cache_file.read_bytes(),
                    media_type=media_type
                )
            else:
                print(f"[DEBUG] Downloading regular image: {url}")
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
                response = requests.get(url, timeout=15, headers=headers, allow_redirects=True)
                response.raise_for_status()
                content = response.content
                content_type = response.headers.get('content-type', 'image/jpeg')

                print(f"[DEBUG] Successfully downloaded {len(content)} bytes, type: {content_type}")

                try:
                    cache_file.write_bytes(content)
                except Exception as cache_e:
                    print(f"[WARNING] Failed to cache image: {cache_e}")

                return Response(
                    content=content,
                    media_type=content_type
                )

    except requests.exceptions.HTTPError as http_e:
        print(f"[ERROR] HTTP error for {url}: {http_e.response.status_code}")
        raise HTTPException(status_code=500, detail=f"HTTP {http_e.response.status_code}")
    except requests.exceptions.Timeout:
        print(f"[ERROR] Timeout for {url}")
        raise HTTPException(status_code=504, detail="Download timeout")
    except requests.exceptions.RequestException as req_e:
        print(f"[ERROR] Request error for {url}: {req_e}")
        raise HTTPException(status_code=500, detail=f"Connection failed: {str(req_e)}")
    except Exception as e:
        print(f"[ERROR] Unexpected error for {url}: {e}")
        raise HTTPException(status_code=500, detail=f"Processing error: {e}")

@app.get("/api/test")
async def test_endpoint():
    print("[DEBUG] Test endpoint called")
    return {"message": "Backend is working!", "timestamp": str(datetime.now())}

@app.get("/api/debug/connectivity")
async def test_connectivity():
    """Test network connectivity to external services"""
    test_results = {}

    # Test basic internet connection - if this works, PC can connect to internet
    try:
        print("[DEBUG] Testing basic internet connectivity to httpbin.org...")
        response = requests.get("https://httpbin.org/ip", timeout=10)
        if response.status_code == 200:
            test_results["internet_connectivity"] = "✓ Çalışıyor - PC internete erişebiliyor"
            print("[DEBUG] Internet bağlantısı OK")
        else:
            test_results["internet_connectivity"] = f"✗ Status: {response.status_code}"
            print(f"[ERROR] Httpbin başarısız, status {response.status_code}")
    except Exception as e:
        test_results["internet_connectivity"] = f"✗ Hata: {str(e)}"
        print(f"[ERROR] İnternet bağlantısı yok: {e}")

    # Test Google Drive access - if this fails but internet works, then Google Drive blocked
    try:
        print("[DEBUG] Testing Google Drive access...")
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        test_url = "https://www.google.com/"
        response = requests.get(test_url, timeout=10, headers=headers)
        if response.status_code == 200:
            test_results["google_drive_access"] = "✓ Google Drive erişimi çalışıyor"
            print("[DEBUG] Google Drive erişimi OK")
        else:
            test_results["google_drive_access"] = f"✗ Status: {response.status_code}"
            print(f"[ERROR] Google test başarısız, status {response.status_code}")
    except Exception as e:
        test_results["google_drive_access"] = f"✗ Engellenmiş: {str(e)}"
        print(f"[ERROR] Google Drive engellenmiş: {e}")

    # Analyze results
    analysis = ""
    pc_can_connect = "internet_connectivity" in test_results and test_results["internet_connectivity"].startswith("✓")
    google_blocked = "google_drive_access" in test_results and test_results["google_drive_access"].startswith("✗")

    if pc_can_connect and google_blocked:
        analysis = "PC internete erişebilir ancak Google Drive engellenmiş. Bu corporate firewall/proxy sorunudur."
    elif not pc_can_connect:
        analysis = "PC hiç internete erişemez. Ağ bağlantısını kontrol edin."
    else:
        analysis = "Tüm bağlantılar OK - başka sorun olabilir."

    return {
        "timestamp": str(datetime.now()),
        "network_tests": test_results,
        "analysis": analysis,
        "troubleshooting": [
            "1. PC internete erişebilir mi test ediyorum",
            "2. Eğer erişebilir ancak Google Drive'a erişemezse:", "   - Corporate firewall/proxy engellemesi var",
            "   - IT departmanınızı başvurun",
            "   - Veya hızlı çözün",
            "3. Eğer hiç bağlanamazsa: Ağ kablosu/wifi'yi kontrol edin"
        ]
    }

@app.get("/auth/google-drive")
async def google_drive_auth(db: Session = Depends(get_db)):
    """Google Drive OAuth authentication endpoint - Admin only"""
    # Admin kontrolü
    current_user = db.query(User).first()  # Basit implementation için ilk user'ı admin kabul ediyoruz
    if not current_user or current_user.email.lower() != ADMIN_EMAIL.lower():
        raise HTTPException(
            status_code=403,
            detail=f"Sadece admin kullanıcısı ({ADMIN_EMAIL}) Google Drive yetkilendirmesi yapabilir"
        )

    try:
        creds_file = get_google_drive_creds_file()
        scopes = ['https://www.googleapis.com/auth/drive.readonly']

        flow = InstalledAppFlow.from_client_secrets_file(
            creds_file, scopes
        )

        # Get authorization URL
        auth_url, _ = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'  # Force consent to ensure refresh token
        )

        return {
            "auth_url": auth_url,
            "instructions": [
                "1. Tarayıcı açın ve yukarıdaki URL'e gidin",
                "2. Google hesabınızla giriş yapın",
                "3. 'İzin ver' butonuna tıklayın",
                "4. Ekranda gösterilen authorization code'u kopyalayın",
                "5. Aşağıdaki callback URL'e kodu girin"
            ],
            "callback_url": "/auth/google-drive/callback?code=YOUR_AUTH_CODE",
            "admin_user": current_user.email
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OAuth başlatma hatası: {str(e)}")

@app.get("/auth/google-drive/callback")
async def google_drive_callback(code: str, db: Session = Depends(get_db)):
    """Handle OAuth callback and store credentials - Admin only"""
    # Admin kontrolü
    current_user = db.query(User).first()
    if not current_user or current_user.email.lower() != ADMIN_EMAIL.lower():
        raise HTTPException(
            status_code=403,
            detail=f"Sadece admin kullanıcısı ({ADMIN_EMAIL}) Google Drive yetkilendirmesi yapabilir"
        )

    try:
        creds_file = get_google_drive_creds_file()
        scopes = ['https://www.googleapis.com/auth/drive.readonly']

        flow = InstalledAppFlow.from_client_secrets_file(
            creds_file, scopes
        )

        # Exchange authorization code for access token
        flow.fetch_token(code=code)

        # Get credentials
        creds = flow.credentials

        # Save credentials
        token_file = BASE_DIR / "config" / "google_token.pickle"
        with open(token_file, 'wb') as token:
            pickle.dump(creds, token)

        # Reinitialize drive service with new credentials
        global drive_service
        drive_service = get_google_drive_service()

        if drive_service:
            return {
                "status": "success",
                "message": f"Google Drive başarıyla bağlandı!\nArtık resimler yüklenebilir.",
                "service_available": True,
                "admin_user": current_user.email,
                "timestamp": str(datetime.now())
            }
        else:
            return {
                "status": "warning",
                "message": "Token kaydedildi ancak service başlatılamadı.",
                "service_available": False,
                "admin_user": current_user.email
            }

    except Exception as e:
        return {
            "status": "error",
            "message": f"OAuth callback hatası: {str(e)}",
            "service_available": False,
            "admin_user": current_user.email if current_user else "unknown"
        }

@app.get("/api/auth/status/google-drive")
async def google_drive_auth_status(db: Session = Depends(get_db)):
    """Check Google Drive authentication status - Admin info only"""
    # Admin bilgilerini getir (current user'ı admin olarak kabul ediyoruz)
    current_user = db.query(User).first()
    is_admin = current_user and current_user.email.lower() == ADMIN_EMAIL.lower() if current_user else False

    token_file = BASE_DIR / "config" / "google_token.pickle"
    has_token = token_file.exists()

    if has_token:
        try:
            with open(token_file, 'rb') as token:
                creds = pickle.load(token)
                valid_token = not creds.expired
                if creds.expired and creds.refresh_token:
                    creds.refresh(Request())
                    # Save refreshed token
                    with open(token_file, 'wb') as token_write:
                        pickle.dump(creds, token_write)
                    valid_token = True
        except Exception:
            valid_token = False
    else:
        valid_token = False

    return {
        "authenticated": valid_token,
        "token_exists": has_token,
        "service_available": drive_service is not None,
        "admin_check": {
            "current_user": current_user.email if current_user else None,
            "is_admin": is_admin,
            "required_admin": ADMIN_EMAIL
        },
        "note": "Google sync ve OAuth işlemleri sadece admin kullanıcı tarafından gerçekleştirilebilir"
    }

@app.get("/api/status")
async def get_status():
    status = {
        "app": "Portable Etsy Order Manager",
        "mode": "test"  # hardcoded for now; could be derived from settings.json
    }
    return status

# ==================== ORDER EDIT ENDPOINTS ====================

@app.put("/api/orders/{transaction}/edit")
async def edit_order_fields(transaction: str, updates: OrderUpdate, db: Session = Depends(get_db)):
    """Edit specific order fields like status, notes, etc."""
    global orders_cache

    # Find order in cache by transaction ID
    order_index = None
    for i, order in enumerate(orders_cache):
        if order.get('transaction') == transaction:
            order_index = i
            break

    if order_index is None:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")

    # Update only provided fields
    order = orders_cache[order_index]
    updated_fields = []

    if updates.Kesildi is not None:
        order['Kesildi'] = str(updates.Kesildi)
        updated_fields.append('Kesildi')
    if updates.Hazır is not None:
        order['Hazır'] = str(updates.Hazır)
        updated_fields.append('Hazır')
    if updates.Gönderildi is not None:
        order['Gönderildi'] = str(updates.Gönderildi)
        updated_fields.append('Gönderildi')
    if updates.importantnote is not None:
        order['importantnote'] = updates.importantnote
        updated_fields.append('importantnote')
    if updates.FullAdress is not None:
        order['FullAdress'] = updates.FullAdress
        updated_fields.append('FullAdress')
    if updates.vatcollected is not None:
        order['vatcollected'] = updates.vatcollected
        updated_fields.append('vatcollected')
    if updates.vatid is not None:
        order['vatid'] = updates.vatid
        updated_fields.append('vatid')
    if updates.Problem is not None:
        order['Problem'] = updates.Problem
        updated_fields.append('Problem')

    # Save cache
    save_cache()

    return {
        "success": True,
        "message": f"Transaction {transaction} güncellendi",
        "updated_fields": updated_fields,
        "timestamp": str(datetime.now())
    }

# ==================== TASK MANAGEMENT ENDPOINTS ====================

@app.post("/api/tasks", response_model=TaskResponse)
async def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    """Create a new task and notify assigned user if assigned"""
    # Get current user (for now, simplified - get first user)
    current_user = db.query(User).first()
    if not current_user:
        raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı")

    # Parse deadline if provided
    deadline = None
    if task.deadline:
        try:
            deadline = datetime.fromisoformat(task.deadline.replace('Z', '+00:00'))
        except Exception:
            raise HTTPException(status_code=400, detail="Geçersiz deadline formatı")

    # Create task
    db_task = Task(
        title=task.title,
        description=task.description,
        status="todo",
        assigned_to=task.assigned_to,
        priority=task.priority,
        deadline=deadline,
        created_by=current_user.id
    )

    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    # Create notification if task is assigned to another user
    if task.assigned_to and task.assigned_to != current_user.id:
        notification = Notification(
            user_id=task.assigned_to,
            title="Yeni görev atandı",
            message=f"'{task.title}' görevi size atandı",
            type="task_assigned",
            related_id=db_task.id
        )
        db.add(notification)
        db.commit()

    return TaskResponse(
        id=db_task.id,
        title=db_task.title,
        description=db_task.description,
        status=db_task.status,
        assigned_to=db_task.assigned_to,
        priority=db_task.priority,
        start_date=db_task.start_date.isoformat() if db_task.start_date else None,
        deadline=db_task.deadline.isoformat() if db_task.deadline else None,
        attachment=db_task.attachment,
        created_by=db_task.created_by,
        created_at=db_task.created_at.isoformat(),
        updated_at=db_task.updated_at.isoformat()
    )

@app.get("/api/tasks", response_model=List[TaskResponse])
async def get_tasks(db: Session = Depends(get_db)):
    """Get all tasks"""
    tasks = db.query(Task).order_by(Task.created_at.desc()).all()
    return [
        TaskResponse(
            id=task.id,
            title=task.title,
            description=task.description,
            status=task.status,
            assigned_to=task.assigned_to,
            priority=task.priority,
            start_date=task.start_date.isoformat() if task.start_date else None,
            deadline=task.deadline.isoformat() if task.deadline else None,
            attachment=task.attachment,
            created_by=task.created_by,
            created_at=task.created_at.isoformat(),
            updated_at=task.updated_at.isoformat()
        )
        for task in tasks
    ]

@app.put("/api/tasks/{task_id}")
async def update_task(task_id: int, updates: dict, db: Session = Depends(get_db)):
    """Update task status or assignments"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Görev bulunamadı")

    # Update allowed fields
    allowed_fields = ['status', 'assigned_to', 'priority', 'description']
    for field in allowed_fields:
        if field in updates:
            setattr(task, field, updates[field])

    task.updated_at = datetime.now()

    db.commit()
    db.refresh(task)

    return {"message": f"Görev {task_id} güncellendi"}

# ==================== CALENDAR EVENTS ENDPOINTS ====================

@app.post("/api/calendar/events", response_model=CalendarEventResponse)
async def create_calendar_event(event: CalendarEventCreate, db: Session = Depends(get_db)):
    """Create a new calendar event/note and notify assigned user if assigned"""
    # Get current user (for now, simplified - get first user)
    current_user = db.query(User).first()
    if not current_user:
        raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı")

    # Parse event date
    try:
        event_date = datetime.fromisoformat(event.event_date.replace('Z', '+00:00'))
    except Exception:
        raise HTTPException(status_code=400, detail="Geçersiz tarih formatı")

    # Create event
    db_event = CalendarEvent(
        title=event.title,
        description=event.description,
        event_date=event_date,
        assigned_to=event.assigned_to,
        type=event.type,
        priority=event.priority,
        recurrence=event.recurrence,
        reminder=event.reminder,
        color=event.color,
        created_by=current_user.id
    )

    db.add(db_event)
    db.commit()
    db.refresh(db_event)

    # Create notification if event is assigned to another user
    if event.assigned_to and event.assigned_to != current_user.id:
        notification = Notification(
            user_id=event.assigned_to,
            title="Yeni etkinlik eklendi",
            message=f"'{event.title}' etkinliği takviminize eklendi",
            type="event_assigned",
            related_id=db_event.id
        )
        db.add(notification)
        db.commit()

    return CalendarEventResponse(
        id=db_event.id,
        title=db_event.title,
        description=db_event.description,
        event_date=db_event.event_date.isoformat(),
        assigned_to=db_event.assigned_to,
        type=db_event.type,
        priority=db_event.priority,
        recurrence=db_event.recurrence,
        reminder=db_event.reminder,
        color=db_event.color,
        created_by=db_event.created_by,
        created_at=db_event.created_at.isoformat(),
        updated_at=db_event.updated_at.isoformat()
    )

@app.get("/api/calendar/events", response_model=List[CalendarEventResponse])
async def get_calendar_events(db: Session = Depends(get_db)):
    """Get all calendar events"""
    events = db.query(CalendarEvent).order_by(CalendarEvent.event_date.desc()).all()
    return [
        CalendarEventResponse(
            id=event.id,
            title=event.title,
            description=event.description,
            event_date=event.event_date.isoformat(),
            assigned_to=event.assigned_to,
            type=event.type,
            priority=event.priority,
            recurrence=event.recurrence,
            reminder=event.reminder,
            color=event.color,
            created_by=event.created_by,
            created_at=event.created_at.isoformat(),
            updated_at=event.updated_at.isoformat()
        )
        for event in events
    ]

# ==================== DASHBOARD NOTIFICATIONS ENDPOINTS ====================

@app.get("/api/notifications", response_model=List[NotificationResponse])
async def get_user_notifications(db: Session = Depends(get_db)):
    """Get notifications for current user (dashboard)"""
    # Get current user (for now, simplified - get first user)
    current_user = db.query(User).first()
    if not current_user:
        raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı")

    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(20).all()

    return [
        NotificationResponse(
            id=n.id,
            user_id=n.user_id,
            title=n.title,
            message=n.message,
            type=n.type,
            related_id=n.related_id,
            data=n.data,
            is_read=n.is_read,
            created_at=n.created_at.isoformat()
        )
        for n in notifications
    ]

@app.put("/api/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: int, db: Session = Depends(get_db)):
    """Mark notification as read"""
    # Get current user
    current_user = db.query(User).first()
    if not current_user:
        raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı")

    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Bildirim bulunamadı")

    notification.is_read = True
    db.commit()

    return {"message": "Bildirim okundu olarak işaretlendi"}

@app.get("/api/dashboard/summary")
async def get_dashboard_summary(db: Session = Depends(get_db)):
    """Get dashboard summary for current user"""
    # Get current user
    current_user = db.query(User).first()
    if not current_user:
        raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı")

    # Get counts
    unread_notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()

    assigned_tasks = db.query(Task).filter(Task.assigned_to == current_user.id).count()
    pending_tasks = db.query(Task).filter(
        Task.assigned_to == current_user.id,
        Task.status == "todo"
    ).count()

    upcoming_events = db.query(CalendarEvent).filter(
        CalendarEvent.assigned_to == current_user.id,
        CalendarEvent.event_date >= datetime.now()
    ).count()

    return {
        "user": UserResponse.from_orm(current_user),
        "unread_notifications": unread_notifications,
        "assigned_tasks": assigned_tasks,
        "pending_tasks": pending_tasks,
        "upcoming_events": upcoming_events,
        "orders_count": len(orders_cache),
        "timestamp": str(datetime.now())
    }

# Startup event to force update cache
@app.on_event("startup")
async def startup_force_update():
    """Force update cache on startup for fresh data"""
    try:
        print("[STARTUP] 🔄 Force updating Google Sheets data...")
        update_cache()
        print("[STARTUP] ✅ Cache updated with fresh data")
    except Exception as e:
        print(f"[STARTUP ERROR] Cache update failed: {str(e)}")
