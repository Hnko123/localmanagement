# 🚀 Etsy Order Management System

**Full-Stack Enterprise E-Commerce Management Platform**

> Complete order tracking, user management, task coordination, and image handling system built with modern web technologies.

## 📋 Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🎯 Core Functionality
- **📊 Real-time Google Sheets Integration** - Automatic order data synchronization
- **🖼️ Smart Image Handling** - Public Google Drive URL to cached images
- **🔐 User Authentication** - JWT-based login system
- **📋 Order Management** - Full CRUD operations with status tracking
- **👥 Task Assignment** - Collaborative task management with notifications
- **📅 Calendar Events** - Event scheduling with automated reminders
- **📈 Dashboard Analytics** - Real-time business insights

### 🎨 Frontend Features
- **Modern React UI** - Styled-components powered interface
- **Responsive Design** - Mobile-first approach
- **Real-time Updates** - WebSocket-ready architecture
- **Advanced Table Views** - Sortable, searchable, resizable columns
- **Image Gallery** - Cached photo display from Google Drive
- **Dark Theme** - Professional dark UI

### 🔧 Backend Features
- **FastAPI Framework** - High-performance async API
- **SQLAlchemy ORM** - Advanced database operations
- **Image Caching System** - Automatic download and serve
- **Google Sheets API** - Direct spreadsheet integration
- **JWT Authentication** - Secure token-based auth
- **File Upload Handling** - Image processing pipeline
- **Background Tasks** - Async operation processing

### 📱 User Experience
- **Admin Panel** - Full system control
- **Role-based Access** - Multi-user support
- **Notification System** - Real-time alerts
- **Export Capabilities** - Data export features
- **Search & Filter** - Advanced query capabilities
- **Audit Logs** - Complete activity tracking

## 🏗️ Architecture

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   React +       │    │   FastAPI +     │    │   SQLite       │
│   Vite          │◄──►│   SQLAlchemy    │◄──►│   PostgreSQL    │
│                 │    │                 │    │   (Optional)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Google        │    │   Image Cache   │    │   External      │
│   Sheets API    │    │   Filesystem    │    │   Services      │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow

```
Google Sheets → FastAPI Sync → Database Storage → Frontend Display
↑                   ↓                     ↓              ↓
Public URLs → Image Download → File Cache → Image Serve → User View
```

### Key Components

#### Backend Services
- **Order Sync Service** - Google Sheets → Database
- **Image Cache Service** - URL → File Download → Serve
- **User Auth Service** - JWT Token Management
- **Notification Service** - In-app Notifications
- **Task Management** - Assignment & Tracking

#### Database Models
- **Users** - Authentication & Profile data
- **Tasks** - Work assignments with status tracking
- **CalendarEvents** - Scheduled activities
- **Notifications** - User alerts and updates
- **Orders** (Cached) - Google Sheets data with images

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** with `pip`
- **Node.js 16+** with `npm`
- **Git** for version control

### Installation

#### 1. Clone Repository
```bash
git clone https://github.com/yourusername/etsy-order-management.git
cd etsy-order-management
```

#### 2. Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Initialize database
python -c "from api import Base, engine; Base.metadata.create_all(bind=engine)"

# Configure Google Sheets credentials
# Copy your credentials to config/gmail_credentials.txt
# Format: Google Client ID: [ID], Google Client Secret: [SECRET]
```

#### 3. Frontend Setup
```bash
cd frontend

# Install Node.js dependencies
npm install

# Start development server
npm run dev
```
Frontend will run on: `http://localhost:5178`

#### 4. Backend Setup
```bash
# Terminal 2 - Start Backend
python start_web.py
```
Backend will run on: `http://localhost:8080`

#### 5. Full System Launch
```bash
# Windows Batch (Alternative)
start_full_8080.bat
```

### Initial Configuration

#### Google Sheets Setup
1. Share your Google Sheet publicly (Anyone with link can view)
2. Note the sheet URL pattern: `https://docs.google.com/spreadsheets/d/...`
3. Make sure sheet columns include: `photo`, `buyername`, `transaction`, etc.

#### Admin User Creation
```bash
# Register first admin user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@company.com",
    "full_name": "System Administrator",
    "password": "securepassword123"
  }'
```

### Access Points

#### Local Development
| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5178 | React Dashboard |
| Backend API | http://localhost:8080 | REST API Endpoints |
| Order Sync | `/api/orders/sync` | Manual sheet sync |
| Image Cache | `/images/filename.jpg` | Cached images |
| API Docs | `/docs` | FastAPI auto-docs |

#### 🌐 Multi-User Network Access

**For sharing with friends on local WiFi:**

1. **Get your network IP:**
   ```bash
   ipconfig | findstr IPv4  # Windows
   ifconfig | grep inet     # Linux/Mac
   # Example: 192.168.0.10
   ```

2. **Start Network Mode:**
   ```bash
   start_network.bat  # Opens firewall and starts servers on 0.0.0.0
   ```

3. **Access URLs:**
   ```
   Frontend: http://192.168.0.10:5178
   Backend:  http://192.168.0.10:8080
   ```

4. **Device Access:**
   - **Phones:** `192.168.0.10:5178`
   - **Tablets:** `192.168.0.10:5178`
   - **Computers:** `192.168.0.10:5178`

**Requirements:**
- ✅ Same WiFi network
- ✅ Windows Firewall permissions
- ✅ Ports 5178, 8080 open
- ✅ No VPN active

**Security Notes:**
- 🔒 Only accessible on local network
- 🛡️ External internet cannot access
- 👥 Safe for multi-user team use
- 🔐 JWT authentication protects data

#### 🖥️ Client Setup (Team Members)

**Automatic One-Click Client Setup:**

1. **Download the repository** (server's admin shares the repo link)
2. **Run the client setup script:**
   ```powershell
   .\setup_client.ps1
   ```
   Or with options:
   ```powershell
   .\setup_client.ps1 -AutoOpenBrowser  # Auto-open browser after setup
   .\setup_client.ps1 -ForceIP "192.168.1.100"  # If auto-detection fails
   ```

**What the script does:**
- ✅ **Auto-detects** server IP on your local network
- ✅ **Tests connections** to backend and frontend
- ✅ **Creates** a unique user account for you
- ✅ **Configs firewall** and permissions
- ✅ **Opens browser** with login credentials provided
- ✅ **Saves** configuration locally for future use

**Alternative Manual Setup:**

If automatic setup fails:

1. **Get server IP** from administrator
2. **Open browser** to: `http://[SERVER_IP]:5178`
3. **Request account** creation from administrator
4. **Login** with provided credentials

**Client Permissions:**
- 👁️ **View** all orders, tasks, and calendar
- ✏️ **Edit** order status and important notes
- 📝 **Create/Update** tasks and events
- ❌ **Cannot** access admin features (Google sync, user management)

## 📡 API Documentation

### Core Endpoints

#### Authentication
```bash
POST /api/auth/register        # User registration
POST /api/auth/login           # JWT authentication
GET  /api/auth/me             # Current user info
```

#### Order Management
```bash
GET  /api/orders              # List all orders
POST /api/orders/sync         # Sync from Google Sheets
PUT  /api/orders/{id}/edit    # Edit order fields
```

#### Task Management
```bash
GET  /api/tasks               # List tasks
POST /api/tasks               # Create task
PUT  /api/tasks/{id}          # Update task status
```

#### Calendar & Events
```bash
GET  /api/calendar/events     # List all events
POST /api/calendar/events     # Create new event
```

#### Notifications
```bash
GET  /api/notifications       # User notifications
PUT  /api/notifications/{id}/read  # Mark as read
```

#### Dashboard
```bash
GET  /api/dashboard/summary   # Dashboard statistics
```

### Authentication Headers
```bash
Authorization: Bearer <jwt_token>
```

## 🗃️ Database Schema

### Core Tables

#### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username VARCHAR UNIQUE,
    email VARCHAR UNIQUE,
    full_name VARCHAR,
    hashed_password VARCHAR,
    is_active BOOLEAN DEFAULT 1,
    role VARCHAR DEFAULT 'user',
    avatar VARCHAR,
    skills VARCHAR,
    phone VARCHAR,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Tasks Table
```sql
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY,
    title VARCHAR,
    description TEXT,
    status VARCHAR DEFAULT 'todo',
    assigned_to INTEGER,
    priority VARCHAR DEFAULT 'medium',
    start_date DATETIME,
    deadline DATETIME,
    attachment TEXT,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Calendar Events Table
```sql
CREATE TABLE calendar_events (
    id INTEGER PRIMARY KEY,
    title VARCHAR,
    description TEXT,
    event_date DATETIME,
    assigned_to INTEGER,
    type VARCHAR DEFAULT 'event',
    priority VARCHAR DEFAULT 'medium',
    recurrence VARCHAR,
    reminder INTEGER,
    color VARCHAR DEFAULT '#667eea',
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Notifications Table
```sql
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    title VARCHAR,
    message TEXT,
    type VARCHAR,
    related_id INTEGER,
    data TEXT,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Migration Scripts

Database migrations are handled automatically via SQLAlchemy. The system uses SQLite for simplicity but can be upgraded to PostgreSQL for production.

## 🔧 Development

### Project Structure
```
etsy-order-management/
├── api.py                    # Main FastAPI application
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── App.jsx          # Main app component
│   │   ├── components/      # UI components
│   │   └── assets/          # Static assets
│   └── public/              # Public files
├── static/                  # Backend static files
│   └── image_cache/         # Cached images
├── data/                    # Data files and cache
├── config/                  # Configuration files
├── requirements.txt         # Python dependencies
└── package.json            # Node.js dependencies
```

### Development Workflow

#### Backend Development
```bash
# Install dev dependencies
pip install -r requirements-dev.txt

# Run tests
pytest

# Run with auto-reload
python -m uvicorn api:app --reload --host 0.0.0.0 --port 8080
```

#### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Start dev server with HMR
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing

#### Backend Tests
```bash
# Unit tests
pytest tests/ -v

# Integration tests
pytest tests/integration/ -v

# Run with coverage
pytest --cov=api --cov-report=html
```

#### Frontend Tests
```bash
cd frontend

# Unit tests
npm test

# E2E tests (if configured)
npm run test:e2e
```

## 🚀 Deployment

### Production Checklist

- [ ] Update CORS origins for production domain
- [ ] Configure database connection (switch from SQLite to PostgreSQL)
- [ ] Set up environment variables for secrets
- [ ] Configure reverse proxy (nginx/apache)
- [ ] Set up SSL certificates
- [ ] Configure domain and DNS
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies

### Docker Deployment

#### Build Images
```bash
# Build backend image
docker build -f Dockerfile.backend -t etsy-backend .

# Build frontend image
cd frontend
docker build -f Dockerfile -t etsy-frontend .
```

#### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    image: etsy-backend
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/etsy
    depends_on:
      - db

  frontend:
    image: etsy-frontend
    ports:
      - "80:80"

  db:
    image: postgres:13
    environment:
      POSTGRES_DB: etsy
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
```

### Cloud Deployment Options

#### Heroku (Easy)
```bash
# Backend (FastAPI)
heroku create etsy-backend
git push heroku main

# Frontend (Static)
npm run build
surge dist/
```

#### AWS/Google Cloud
Use standard cloud deployment patterns for FastAPI + React applications.

## 🤝 Contributing

### Development Guidelines

1. **Code Style**
   - Backend: PEP 8, Black formatter
   - Frontend: ESLint, Prettier
   - Commit messages: Conventional commits

2. **Branching Strategy**
   ```bash
   # Create feature branch
   git checkout -b feature/amazing-feature

   # Develop and test
   # Create pull request
   ```

3. **Testing Requirements**
   - All new features must have tests
   - Minimum 80% code coverage
   - Integration tests for API endpoints

4. **Documentation**
   - Update README for new features
   - Add docstrings to new functions
   - Update API documentation

### Feature Request Process
1. Create GitHub issue with feature description
2. Wait for team approval
3. Create feature branch and implement
4. Write tests and documentation
5. Create pull request

## 📋 Project Status

### Completed Features ✅
- [x] Google Sheets integration with real-time sync
- [x] Image caching system from Google Drive URLs
- [x] Complete user authentication system
- [x] Task management with user assignment
- [x] Calendar events with notifications
- [x] Dashboard analytics and summaries
- [x] Admin-restricted operations
- [x] Real-time order status editing
- [x] Responsive React UI
- [x] CORS and deployment configurations

### v1.1 New Features ✨
- [x] Auto-sync enhancement: Latest 20 orders every 30 minutes
- [x] Automated client setup script (setup_client.ps1)
- [x] Color-coded chat system with user identity
- [x] Online users sidebar with real-time status
- [x] Enhanced chat interface (removed clutter, streamlined UI)
- [x] Network multi-user collaboration ready
- [x] Professional team communication platform

### Roadmap 🚧
- [ ] WebSocket real-time notifications
- [ ] Advanced reporting and analytics
- [ ] Mobile app development
- [ ] Multi-language support
- [ ] Advanced permission system
- [ ] API rate limiting and security
- [ ] Backup and recovery system

## 📞 Support

### Getting Help
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Documentation**: Project Wiki
- **Contact**: dev@example.com

### Common Issues

#### Google Sheets Not Syncing
- Ensure sheet is publicly shared
- Check sheet URL format
- Verify column headers match expected format

#### Images Not Loading
- Check if Google Drive files are public
- Verify cache directory permissions
- Check network connectivity

#### Authentication Issues
- Clear browser cache and cookies
- Verify JWT token expiration
- Check user credentials

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **FastAPI** - The modern Python web framework
- **React** - Component-based UI library
- **SQLAlchemy** - Python SQL toolkit
- **Styled Components** - CSS-in-JS styling solution
- **Google APIs** - Cloud services integration

---

**Built with ❤️ by the Etsy Order Management Team**

*For more information, visit our [project website](https://github.com/yourusername/etsy-order-management) or contact the development team.*
