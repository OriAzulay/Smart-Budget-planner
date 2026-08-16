from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import AsyncSessionLocal
from app.routers import auth, grids, months, stats, users
from app.services.grid_service import seed_default_grids


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with AsyncSessionLocal() as db:
        await seed_default_grids(db)
    yield


# Initialize FastAPI app
app = FastAPI(
    title="Smart Budget Planner API",
    description="Family budget planner with editable grids and month tabs",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(stats.router)
app.include_router(grids.router)
app.include_router(months.router)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Dashboard Platform API",
        "version": "1.0.0",
        "docs": "/docs",
    }
