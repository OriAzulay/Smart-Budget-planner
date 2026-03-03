# Budget App - Architecture Documentation

This document provides an in-depth overview of the full-stack Budget App architecture, covering both backend and frontend codebases.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Directory Structure](#directory-structure)
3. [Backend Architecture](#backend-architecture)
4. [Frontend Architecture](#frontend-architecture)
5. [Authentication Flow](#authentication-flow)
6. [Database Schema](#database-schema)
7. [API Reference](#api-reference)
8. [Configuration Files](#configuration-files)
9. [Data Flow Diagrams](#data-flow-diagrams)

---

## Project Overview

```
BudgetApp/
├── backend/          # FastAPI Python backend
├── frontend/         # Next.js 14 React frontend
├── docker-compose.yml
├── package.json      # Root scripts for running both servers
├── start-dev.ps1     # PowerShell script for Windows development
└── README.md
```

### Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Backend Framework | FastAPI | 0.111.0 |
| Backend ORM | SQLAlchemy (async) | 2.0.30 |
| Database | PostgreSQL | 18.x |
| Frontend Framework | Next.js (App Router) | 14.2.3 |
| UI Library | React | 18.x |
| Styling | TailwindCSS | 3.4.3 |
| Component Library | shadcn/ui | Custom |
| Charts | Recharts | 2.12.7 |
| Tables | TanStack Table | 8.17.3 |
| Authentication | NextAuth.js v5 | Beta |
| HTTP Client | Axios | 1.7.2 |

---

## Directory Structure

### Complete Tree

```
BudgetApp/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application entry point
│   │   ├── config.py            # Environment configuration
│   │   ├── database.py          # Database connection & session
│   │   ├── dependencies.py      # Dependency injection (auth, db)
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── base.py          # SQLAlchemy Base class
│   │   │   └── user.py          # User model definition
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py          # Auth request/response schemas
│   │   │   └── user.py          # User request/response schemas
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py          # /auth/* endpoints
│   │   │   ├── users.py         # /users/* endpoints
│   │   │   └── stats.py         # /stats/* endpoints
│   │   └── services/
│   │       ├── __init__.py
│   │       └── auth_service.py  # Password hashing, JWT tokens
│   ├── alembic/
│   │   ├── env.py               # Alembic environment config
│   │   ├── script.py.mako       # Migration template
│   │   └── versions/            # Migration files
│   ├── alembic.ini              # Alembic configuration
│   ├── init_db.py               # Database initialization script
│   ├── requirements.txt         # Python dependencies
│   ├── Dockerfile               # Backend container definition
│   ├── .env                     # Environment variables
│   └── .env.example             # Environment template
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx           # Root layout with providers
│   │   ├── page.tsx             # Landing page (redirects)
│   │   ├── globals.css          # Global Tailwind styles
│   │   ├── (auth)/              # Auth route group (no layout)
│   │   │   ├── login/
│   │   │   │   └── page.tsx     # Login page
│   │   │   └── register/
│   │   │       └── page.tsx     # Registration page
│   │   ├── (dashboard)/         # Dashboard route group
│   │   │   ├── layout.tsx       # Dashboard layout (sidebar)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx     # Main dashboard view
│   │   │   └── users/
│   │   │       └── page.tsx     # Users management page
│   │   └── api/
│   │       └── auth/
│   │           └── [...nextauth]/
│   │               └── route.ts # NextAuth API route
│   ├── components/
│   │   ├── ui/                  # shadcn/ui base components
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── table.tsx
│   │   ├── layout/              # Layout components
│   │   │   ├── Sidebar.tsx      # Navigation sidebar
│   │   │   └── Topbar.tsx       # Top navigation bar
│   │   └── dashboard/           # Dashboard-specific components
│   │       ├── StatsCard.tsx    # Statistics card widget
│   │       ├── UsersAreaChart.tsx # User growth chart
│   │       └── UsersTable.tsx   # Users data table
│   ├── lib/
│   │   ├── api.ts               # Axios API client & endpoints
│   │   ├── auth.ts              # NextAuth configuration
│   │   └── utils.ts             # Utility functions (cn helper)
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   ├── middleware.ts            # Route protection middleware
│   ├── next.config.js           # Next.js configuration
│   ├── tailwind.config.js       # Tailwind configuration
│   ├── postcss.config.mjs       # PostCSS configuration
│   ├── tsconfig.json            # TypeScript configuration
│   ├── package.json             # Node.js dependencies
│   ├── Dockerfile               # Frontend container definition
│   ├── .env.local               # Environment variables
│   └── .env.local.example       # Environment template
│
├── docker-compose.yml           # Multi-container orchestration
├── package.json                 # Root scripts
├── start-dev.ps1                # Windows development script
├── README.md                    # Quick start guide
└── ARCHITECTURE.md              # This file
```

---

## Backend Architecture

### Layer Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Routers Layer                        │
│   (auth.py, users.py, stats.py) - HTTP endpoint handlers   │
├─────────────────────────────────────────────────────────────┤
│                       Services Layer                        │
│   (auth_service.py) - Business logic & utilities           │
├─────────────────────────────────────────────────────────────┤
│                       Schemas Layer                         │
│   (auth.py, user.py) - Pydantic validation models          │
├─────────────────────────────────────────────────────────────┤
│                        Models Layer                         │
│   (user.py) - SQLAlchemy ORM models                        │
├─────────────────────────────────────────────────────────────┤
│                      Database Layer                         │
│   (database.py) - Async PostgreSQL connection              │
└─────────────────────────────────────────────────────────────┘
```

### Core Files Explained

#### `app/main.py`
The FastAPI application entry point:
- Creates FastAPI app instance with metadata
- Configures CORS middleware for frontend communication
- Includes all routers with URL prefixes
- Defines root health check endpoint

```python
# Router registration pattern
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(stats.router, prefix="/stats", tags=["Statistics"])
```

#### `app/config.py`
Centralized configuration using Pydantic Settings:
- Loads environment variables from `.env`
- Validates required settings at startup
- Provides typed access to configuration

```python
class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
```

#### `app/database.py`
Async database connection management:
- Creates async SQLAlchemy engine with asyncpg driver
- Provides async session factory
- Implements `get_db()` dependency for request-scoped sessions

```python
# Connection pattern
async_engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = async_sessionmaker(bind=async_engine)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
```

#### `app/dependencies.py`
Dependency injection utilities:
- `get_db`: Database session dependency
- `get_current_user`: JWT token validation dependency
- `require_admin`: Admin role verification dependency

```python
# Authentication dependency chain
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    # Validates JWT and returns user
```

### Models Layer (`app/models/`)

#### `base.py`
SQLAlchemy declarative base with common mixins:
```python
class Base(DeclarativeBase):
    pass

class TimestampMixin:
    created_at: Mapped[datetime]
    updated_at: Mapped[datetime]
```

#### `user.py`
User model definition:
```python
class User(Base, TimestampMixin):
    __tablename__ = "users"
    
    id: Mapped[UUID]           # Primary key
    name: Mapped[str]          # Display name
    email: Mapped[str]         # Unique email (login identifier)
    hashed_password: Mapped[str]
    role: Mapped[str]          # "admin" or "user"
    is_active: Mapped[bool]    # Account status
```

### Schemas Layer (`app/schemas/`)

Pydantic v2 models for request/response validation:

#### `auth.py`
```python
class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
```

#### `user.py`
```python
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: UUID
    name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime
```

### Routers Layer (`app/routers/`)

#### `auth.py` - Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create new user account |
| POST | `/auth/login` | Authenticate and receive JWT |
| GET | `/auth/me` | Get current user profile |

#### `users.py` - User Management Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List all users |
| GET | `/users/{id}` | Get user by ID |
| PATCH | `/users/{id}` | Update user |
| DELETE | `/users/{id}` | Delete user (admin only) |

#### `stats.py` - Dashboard Statistics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats/overview` | Get dashboard statistics |

### Services Layer (`app/services/`)

#### `auth_service.py`
Security utilities:
```python
def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    
def verify_password(plain: str, hashed: str) -> bool:
    """Verify password against hash"""
    
def create_access_token(data: dict) -> str:
    """Generate JWT access token"""
    
def decode_token(token: str) -> dict:
    """Validate and decode JWT"""
```

---

## Frontend Architecture

### Next.js App Router Structure

```
app/
├── layout.tsx          # Root layout (SessionProvider, global styles)
├── page.tsx            # "/" - Redirects to /dashboard or /login
├── globals.css         # Tailwind directives
│
├── (auth)/             # Route Group - No layout inheritance
│   ├── login/page.tsx  # "/login"
│   └── register/page.tsx # "/register"
│
├── (dashboard)/        # Route Group - With sidebar layout
│   ├── layout.tsx      # Dashboard layout wrapper
│   ├── dashboard/page.tsx  # "/dashboard"
│   └── users/page.tsx      # "/users"
│
└── api/auth/[...nextauth]/route.ts  # NextAuth API handlers
```

### Route Groups Explained

**`(auth)`** - Parentheses create a route group that:
- Groups related routes without affecting URL structure
- Pages render WITHOUT the dashboard sidebar
- Used for login/register pages

**`(dashboard)`** - Dashboard route group:
- All pages wrapped in dashboard layout
- Includes Sidebar and Topbar components
- Protected by middleware authentication

### Component Architecture

```
components/
├── ui/                 # Primitive UI components (shadcn/ui)
│   ├── button.tsx      # Variant-based button component
│   ├── input.tsx       # Form input with styling
│   ├── card.tsx        # Card container components
│   ├── badge.tsx       # Status badge component
│   └── table.tsx       # Table primitive components
│
├── layout/             # Page structure components
│   ├── Sidebar.tsx     # Navigation sidebar with links
│   └── Topbar.tsx      # Header with user menu
│
└── dashboard/          # Feature-specific components
    ├── StatsCard.tsx   # Statistics display card
    ├── UsersAreaChart.tsx  # Recharts area chart
    └── UsersTable.tsx      # TanStack Table implementation
```

### Component Patterns

#### UI Components (shadcn/ui style)
Using `class-variance-authority` for variant management:

```tsx
// button.tsx pattern
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground...",
        destructive: "bg-destructive text-destructive-foreground...",
        outline: "border border-input bg-background...",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

#### Layout Components
Dashboard layout wrapper pattern:

```tsx
// (dashboard)/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### Library Files (`lib/`)

#### `api.ts` - API Client
Axios instance with interceptors:

```typescript
// Features:
// - Base URL configuration from environment
// - Request interceptor: Adds JWT to Authorization header
// - Response interceptor: Handles 401 by signing out

export const authApi = {
  register: (data) => apiClient().post("/auth/register", data),
  login: (data) => apiClient().post("/auth/login", data),
  getMe: () => apiClient().get("/auth/me"),
}

export const usersApi = {
  list: () => apiClient().get("/users"),
  get: (id) => apiClient().get(`/users/${id}`),
  update: (id, data) => apiClient().patch(`/users/${id}`, data),
  delete: (id) => apiClient().delete(`/users/${id}`),
}

export const statsApi = {
  overview: () => apiClient().get("/stats/overview"),
}
```

#### `auth.ts` - NextAuth Configuration
NextAuth v5 setup with credentials provider:

```typescript
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        // Calls backend /auth/login
        // Returns user object with accessToken
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      // Stores accessToken in JWT
    },
    session: async ({ session, token }) => {
      // Exposes accessToken to client
    },
  },
})
```

#### `utils.ts` - Utility Functions
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Combines clsx + tailwind-merge for className handling
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Type Definitions (`types/index.ts`)

```typescript
export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user"
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

export interface StatsOverview {
  total_users: number
  active_users: number
  new_users_today: number
  growth_percentage: number
}
```

### Middleware (`middleware.ts`)

Route protection logic:

```typescript
export default auth((req) => {
  const isAuthenticated = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith("/login") ||
                     req.nextUrl.pathname.startsWith("/register")

  if (isAuthPage) {
    if (isAuthenticated) {
      return Response.redirect(new URL("/dashboard", req.nextUrl))
    }
    return null // Allow access to auth pages
  }

  if (!isAuthenticated) {
    return Response.redirect(new URL("/login", req.nextUrl))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

---

## Authentication Flow

### Login Sequence

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Browser │     │ Next.js  │     │ FastAPI  │     │ Postgres │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │ 1. Submit      │                │                │
     │ credentials    │                │                │
     │───────────────>│                │                │
     │                │ 2. POST        │                │
     │                │ /auth/login    │                │
     │                │───────────────>│                │
     │                │                │ 3. Query user  │
     │                │                │───────────────>│
     │                │                │<───────────────│
     │                │                │ 4. Verify pwd  │
     │                │                │ 5. Generate JWT│
     │                │<───────────────│                │
     │                │  {access_token}│                │
     │                │                │                │
     │                │ 6. Create      │                │
     │                │ NextAuth session                │
     │<───────────────│                │                │
     │  Set cookie    │                │                │
     │                │                │                │
     │ 7. Redirect    │                │                │
     │ to /dashboard  │                │                │
     └────────────────┴────────────────┴────────────────┘
```

### Token Storage

| Storage Location | Data | Purpose |
|------------------|------|---------|
| HTTP-only Cookie | NextAuth session token | Session management |
| NextAuth JWT | Backend access_token | API authentication |
| Memory | Session object | Client-side access |

### Protected API Request Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │     │ Next.js  │     │ FastAPI  │
└────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │
     │ 1. API Request │                │
     │───────────────>│                │
     │                │ 2. Get session │
     │                │ (extract JWT)  │
     │                │                │
     │                │ 3. Request +   │
     │                │ Bearer token   │
     │                │───────────────>│
     │                │                │ 4. Validate JWT
     │                │                │ 5. Extract user_id
     │                │                │ 6. Process request
     │                │<───────────────│
     │<───────────────│   Response     │
     │   Response     │                │
     └────────────────┴────────────────┘
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────────────────────────────┐
│                 users                    │
├─────────────────────────────────────────┤
│ id              UUID        PK          │
│ name            VARCHAR     NOT NULL    │
│ email           VARCHAR     UNIQUE      │
│ hashed_password VARCHAR     NOT NULL    │
│ role            VARCHAR     DEFAULT 'user' │
│ is_active       BOOLEAN     DEFAULT true│
│ created_at      TIMESTAMP   NOT NULL    │
│ updated_at      TIMESTAMP   NOT NULL    │
└─────────────────────────────────────────┘
```

### Indexes

| Table | Column | Type | Purpose |
|-------|--------|------|---------|
| users | id | PRIMARY KEY | Record identification |
| users | email | UNIQUE | Login lookup, prevent duplicates |

---

## API Reference

### Base URL
```
Development: http://localhost:8000
Production:  https://api.yourapp.com
```

### Authentication Header
```
Authorization: Bearer <access_token>
```

### Endpoints Summary

#### Authentication (`/auth`)

```yaml
POST /auth/register:
  body:
    name: string
    email: string
    password: string
  response: UserResponse

POST /auth/login:
  body:
    email: string
    password: string
  response:
    access_token: string
    token_type: "bearer"

GET /auth/me:
  auth: required
  response: UserResponse
```

#### Users (`/users`)

```yaml
GET /users:
  auth: required
  response: UserResponse[]

GET /users/{id}:
  auth: required
  params:
    id: UUID
  response: UserResponse

PATCH /users/{id}:
  auth: required
  params:
    id: UUID
  body:
    name?: string
    email?: string
    is_active?: boolean
  response: UserResponse

DELETE /users/{id}:
  auth: required (admin)
  params:
    id: UUID
  response: { "message": "User deleted" }
```

#### Statistics (`/stats`)

```yaml
GET /stats/overview:
  auth: required
  response:
    total_users: number
    active_users: number
    new_users_today: number
    growth_data: Array<{date: string, count: number}>
```

---

## Configuration Files

### Backend

#### `.env`
```bash
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/appdb
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

#### `requirements.txt`
```
fastapi==0.111.0
uvicorn[standard]==0.29.0
sqlalchemy[asyncio]==2.0.30
asyncpg==0.29.0
alembic==1.13.1
pydantic==2.7.1
pydantic-settings==2.2.1
python-jose[cryptography]==3.3.0
bcrypt==4.1.3
python-multipart==0.0.9
```

### Frontend

#### `.env.local`
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
NEXT_PUBLIC_API_URL=http://localhost:8000
AUTH_TRUST_HOST=true
```

#### `next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
}
module.exports = nextConfig
```

#### `tailwind.config.js`
```javascript
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { ... },
        secondary: { ... },
        // ... shadcn/ui color system
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

---

## Data Flow Diagrams

### Dashboard Page Load

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser Request                        │
│                      GET /dashboard                         │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      middleware.ts                          │
│              Check session → Allow/Redirect                 │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│               (dashboard)/layout.tsx                        │
│              Render Sidebar + Topbar                        │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              dashboard/page.tsx (Client)                    │
│         useEffect → Fetch stats & users                     │
└────────────────────────────┬────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│   statsApi.overview()   │   │   usersApi.list()       │
│   GET /stats/overview   │   │   GET /users            │
└───────────┬─────────────┘   └───────────┬─────────────┘
            │                             │
            └──────────────┬──────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Render Components                         │
│    StatsCard + UsersAreaChart + UsersTable                 │
└─────────────────────────────────────────────────────────────┘
```

### User Creation Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Browser │     │Next.js  │     │FastAPI  │     │Postgres │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │
     │ Fill form     │               │               │
     │ Submit        │               │               │
     │──────────────>│               │               │
     │               │               │               │
     │               │ Validate      │               │
     │               │ client-side   │               │
     │               │               │               │
     │               │ POST          │               │
     │               │ /auth/register│               │
     │               │──────────────>│               │
     │               │               │               │
     │               │               │ Validate      │
     │               │               │ schema        │
     │               │               │               │
     │               │               │ Check email   │
     │               │               │ uniqueness    │
     │               │               │──────────────>│
     │               │               │<──────────────│
     │               │               │               │
     │               │               │ Hash password │
     │               │               │               │
     │               │               │ INSERT user   │
     │               │               │──────────────>│
     │               │               │<──────────────│
     │               │               │               │
     │               │<──────────────│               │
     │               │ UserResponse  │               │
     │               │               │               │
     │<──────────────│               │               │
     │ Redirect to   │               │               │
     │ /login        │               │               │
     └───────────────┴───────────────┴───────────────┘
```

---

## Extending the Application

### Adding a New Backend Endpoint

1. **Create Schema** (`app/schemas/newfeature.py`):
   ```python
   class NewFeatureCreate(BaseModel):
       field: str
   
   class NewFeatureResponse(BaseModel):
       id: UUID
       field: str
   ```

2. **Create Model** (`app/models/newfeature.py`):
   ```python
   class NewFeature(Base, TimestampMixin):
       __tablename__ = "new_features"
       id: Mapped[UUID] = mapped_column(primary_key=True)
       field: Mapped[str]
   ```

3. **Create Router** (`app/routers/newfeature.py`):
   ```python
   router = APIRouter()
   
   @router.get("/", response_model=list[NewFeatureResponse])
   async def list_features(db: AsyncSession = Depends(get_db)):
       result = await db.execute(select(NewFeature))
       return result.scalars().all()
   ```

4. **Register Router** (`app/main.py`):
   ```python
   from app.routers import newfeature
   app.include_router(newfeature.router, prefix="/features")
   ```

### Adding a New Frontend Page

1. **Create Page** (`app/(dashboard)/newpage/page.tsx`):
   ```tsx
   export default function NewPage() {
     return <div>New Page Content</div>
   }
   ```

2. **Add to Sidebar** (`components/layout/Sidebar.tsx`):
   ```tsx
   const navItems = [
     // ... existing items
     { href: "/newpage", label: "New Page", icon: IconComponent },
   ]
   ```

3. **Add API Function** (`lib/api.ts`):
   ```typescript
   export const newFeatureApi = {
     list: () => apiClient().get("/features"),
   }
   ```

---

## Scripts Reference

### Development

```bash
# Start both servers (Windows)
.\start-dev.ps1

# Or individually:
# Backend
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm run dev
```

### Database

```bash
# Initialize database with admin user
cd backend
.\venv\Scripts\activate
python init_db.py

# Run migrations
alembic upgrade head

# Create new migration
alembic revision --autogenerate -m "Description"
```

### Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | `Get-NetTCPConnection -LocalPort 3000,8000` then kill process |
| Database connection failed | Check PostgreSQL service is running |
| CORS errors | Verify `NEXT_PUBLIC_API_URL` matches backend URL |
| Auth not working | Check `NEXTAUTH_SECRET` is set |
| Styles not loading | Run `npm run dev` to rebuild Tailwind |

---

*Last updated: March 2026*
