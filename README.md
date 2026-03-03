# Dashboard Platform

A professional, production-ready full-stack dashboard platform with role-based access control, built with modern technologies and best practices.

## 🎯 Project Overview

Dashboard Platform is a complete web application scaffold featuring:

- **Role-Based Access Control (RBAC)**: Admin and User roles with protected routes
- **Real-time Statistics**: Dashboard with live metrics and charts
- **User Management**: Admin interface for managing platform users
- **Secure Authentication**: JWT-based auth with bcrypt password hashing
- **Modern UI**: Beautiful, responsive design with TailwindCSS and Recharts
- **Type-Safe**: Full TypeScript implementation with strict mode enabled
- **Production Ready**: Docker containerization, proper error handling, empty state management

## 📋 Prerequisites

- **Docker Desktop** (recommended) or:
  - Python 3.11+
  - Node.js 18+
  - PostgreSQL 16

## 🚀 Quick Start (Docker)

### One-Command Setup

```bash
# 1. Clone or navigate to the project
cd BudgetApp

# 2. Start all services
docker compose up --build

# 3. In a new terminal, run migrations
docker compose exec backend alembic upgrade head

# 4. Create an initial admin user
docker compose exec backend python -c "
from app.services.auth_service import hash_password
from app.database import AsyncSessionLocal
from app.models.user import User, UserRole
import asyncio

async def create_admin():
    async with AsyncSessionLocal() as session:
        user = User(
            email='admin@example.com',
            name='Admin User',
            hashed_password=hash_password('password123'),
            role=UserRole.ADMIN,
            is_active=True
        )
        session.add(user)
        await session.commit()
        print('Admin user created: admin@example.com / password123')

asyncio.run(create_admin())
"
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **PgAdmin**: http://localhost:5050 (admin@admin.com / admin)

## 🛠️ Manual Setup (Without Docker)

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your PostgreSQL connection string

# Run migrations
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Create .env.local
cp .env.local.example .env.local

# Install dependencies
npm install

# Start development server
npm run dev
```

Access: http://localhost:3000

## 👤 Create First Admin User

### Using Docker

See the one-command setup above.

### Manual Setup - Using cURL

```bash
# 1. Register a user
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "password123"
  }'

# 2. Update user role via database
# Using psql or PgAdmin, run:
# UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

## 📚 API Endpoints

| Method | Path | Auth Required | Description |
|--------|------|---|---|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login and get JWT token |
| GET | `/auth/me` | Yes | Get current user info |
| GET | `/users` | Yes* | List all users |
| GET | `/users/{id}` | Yes* | Get user details |
| PATCH | `/users/{id}` | Yes* | Update user |
| DELETE | `/users/{id}` | Yes* | Delete user |
| GET | `/stats/overview` | Yes | Get platform statistics |
| GET | `/health` | No | Health check |

*Admin only

## 🔐 Authentication Flow

1. **Registration**: User submits name, email, password → Password hashed with bcrypt → User stored
2. **Login**: Email + password verified → JWT token generated → Token returned with user data
3. **Session**: NextAuth manages session using JWT → Token automatically attached to API requests
4. **Token Refresh**: Token extracted from NextAuth session on every request

## 📁 Project Structure

```
BudgetApp/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   ├── base.py          # SQLAlchemy base class
│   │   │   └── user.py          # User model with role enum
│   │   ├── schemas/
│   │   │   ├── auth.py          # Auth request/response schemas
│   │   │   └── user.py          # User CRUD schemas
│   │   ├── routers/
│   │   │   ├── auth.py          # Auth endpoints
│   │   │   ├── users.py         # User management endpoints
│   │   │   └── stats.py         # Statistics endpoints
│   │   ├── services/
│   │   │   └── auth_service.py  # Password hashing, JWT handling
│   │   ├── database.py          # Async SQLAlchemy setup
│   │   ├── config.py            # Settings from env
│   │   ├── dependencies.py      # Auth dependencies
│   │   └── main.py              # FastAPI app initialization
│   ├── alembic/                 # Database migrations
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx     # Login form
│   │   │   └── register/
│   │   │       └── page.tsx     # Registration form
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx     # Main dashboard
│   │   │   ├── users/
│   │   │   │   └── page.tsx     # Users management (admin only)
│   │   │   └── layout.tsx       # Dashboard layout with sidebar
│   │   ├── api/auth/[...nextauth]/
│   │   │   └── route.ts         # NextAuth API route
│   │   ├── layout.tsx           # Root layout with SessionProvider
│   │   ├── page.tsx             # Home/redirect logic
│   │   └── globals.css          # Global styles
│   ├── components/
│   │   ├── ui/                  # Base UI components
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx      # Navigation sidebar
│   │   │   └── Topbar.tsx       # User menu topbar
│   │   └── dashboard/
│   │       ├── StatsCard.tsx    # Statistics card component
│   │       ├── UsersAreaChart.tsx  # Area chart
│   │       └── UsersTable.tsx   # Users table with filtering
│   ├── lib/
│   │   ├── auth.ts              # NextAuth configuration
│   │   ├── api.ts               # Axios client & endpoints
│   │   └── utils.ts             # Utility functions
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   ├── middleware.ts            # Route protection middleware
│   ├── package.json
│   ├── tsconfig.json            # Strict mode enabled
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   └── .env.local.example
│
├── docker-compose.yml           # Multi-container orchestration
└── README.md
```

## 🔒 Security Features

- ✅ Passwords hashed with bcrypt (not stored in plain text)
- ✅ JWT tokens with configurable expiration (default 10080 minutes)
- ✅ Role-based access control with permission enforcement
- ✅ CORS configured for specific origins (http://localhost:3000)
- ✅ Bearer token validation on protected endpoints
- ✅ Secure environment variable management (.env not committed)
- ✅ Active user status checking (inactive users cannot log in)

## 🎨 UI/UX Features

- ✅ Beautiful TailwindCSS styling with a modern color palette
- ✅ Fully responsive design (mobile, tablet, desktop)
- ✅ Empty states for tables with no data
- ✅ Loading skeletons for async operations
- ✅ Error messages with proper visual feedback
- ✅ Icons from Lucide React (24+ icon set)
- ✅ Smooth animations and transitions
- ✅ Accessible form components with proper labels
- ✅ Dashboard with multiple stat cards and visualizations

## 📊 Dashboard Features

### Stats Cards
- Total Users with trend
- Active Users with trend
- Admin Count
- New Users This Month

### Charts
- 7-Day User Signup Area Chart (Recharts)
- Mock data for demo (wire to real API as needed)

### User Management Table
- Search by name or email
- Filter by role (Admin/User)
- Role badges with color coding
- Status indicators (Active/Inactive)
- Pagination (10 per page)
- Created date formatting

## 🔄 Data Flow

### Login Flow
```
1. User enters credentials → 2. Frontend calls POST /auth/login
3. Backend verifies password → 4. JWT token generated
5. NextAuth stores token in session → 6. Dashboard accessible
```

### API Request Flow
```
1. Frontend has NextAuth session with token
2. Axios interceptor adds "Authorization: Bearer token"
3. Backend validates JWT, extracts user
4. Route handler executes with authenticated user
5. Response returned with proper status codes
```

## 🚨 Error Handling

### Backend
- 400 Bad Request: Invalid input or duplicate email
- 401 Unauthorized: Invalid credentials or missing token
- 403 Forbidden: Insufficient permissions or inactive user
- 404 Not Found: Resource doesn't exist
- 500 Internal Server Error: Server exceptions (logged)

### Frontend
- Form validation with Zod schemas
- API error display in toast/alert components
- Loading states prevent duplicate submissions
- 401 responses trigger automatic logout
- Network errors show user-friendly messages

## 🧪 Testing the Application

### Demo Credentials
```
Email: admin@example.com
Password: password123
```

### Test User Registration
1. Go to http://localhost:3000/register
2. Create new account with unique email
3. Login with new credentials
4. Access /dashboard (will see user view)

### Test Admin Only Features
1. Login as admin (admin@example.com)
2. Navigate to Users page
3. View, search, filter all users
4. Regular users won't see this menu item

## 📦 Deployment Checklist

Before production deployment:

- [ ] Change `SECRET_KEY` in backend .env (use `openssl rand -hex 32`)
- [ ] Change `NEXTAUTH_SECRET` in frontend .env
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Update `NEXT_PUBLIC_API_URL` to production backend URL
- [ ] Set `DATABASE_URL` to production PostgreSQL instance
- [ ] Enable HTTPS for all connections
- [ ] Configure CORS `allow_origins` for production domain
- [ ] Run database migrations on production
- [ ] Set up proper logging and monitoring
- [ ] Create admin user via secure process
- [ ] Test all authentication flows
- [ ] Review environment variables aren't logged

## 🛠️ Development Commands

### Backend
```bash
# Run migrations
alembic upgrade head

# Create new migration
alembic revision --autogenerate -m "description"

# Start dev server
uvicorn app.main:app --reload

# Install new package
pip install package-name
pip freeze > requirements.txt
```

### Frontend
```bash
# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Install new package
npm install package-name
```

## 📝 Environment Variables Reference

### Backend (.env)
```
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/dbname
SECRET_KEY=your-super-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

### Frontend (.env.local)
```
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🐛 Troubleshooting

### Docker Issues
```bash
# Rebuild containers
docker compose down
docker compose up --build

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Access backend shell
docker compose exec backend bash
```

### Database Issues
```bash
# Reset database
docker compose down -v
docker compose up

# Connect to database
docker compose exec postgres psql -U postgres -d appdb
```

### Frontend Won't Connect to Backend
- Check if backend is running: http://localhost:8000/health
- Verify CORS configuration in backend main.py
- Check NEXT_PUBLIC_API_URL in .env.local
- Clear browser cache and cookies

## 📚 Tech Stack Details

| Layer | Technology | Version |
|---|---|---|
| Backend | FastAPI | 0.111.0 |
| Async | SQLAlchemy + asyncpg | 2.0.30 |
| Database | PostgreSQL | 16 |
| Migrations | Alembic | 1.13.1 |
| Auth | python-jose + passlib | latest |
| Frontend | Next.js | 14.2.3 |
| React | React | 18+ |
| Styling | TailwindCSS | 3.4 |
| Auth | NextAuth.js | 5.0.0-beta.19 |
| HTTP Client | Axios | 1.7.2 |
| Table | TanStack Table | 8.17.3 |
| Charts | Recharts | 2.12.7 |
| UI Components | shadcn/ui + Lucide | latest |

## 🤝 Contributing

1. Follow TypeScript strict mode guidelines
2. Ensure all components are SSR/CSR compatible
3. Add proper error handling
4. Include loading states
5. Test with empty data states
6. Never commit secrets or .env files

## 📄 License

This project is provided as-is for educational and commercial use.

## 🎓 Learning Resources

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [NextAuth.js](https://next-auth.js.org/)
- [SQLAlchemy Async](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html)
- [TailwindCSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)

---

**Built with ❤️ for production-ready full-stack development**
