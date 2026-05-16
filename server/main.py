import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.gzip import GZipMiddleware
from middleware.error_handler import global_error_handler
from routers import auth, users, categories, decks, cards, sessions, search, tags

app = FastAPI(title="Cardie API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware)
app.middleware("http")(global_error_handler)

uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory=uploads_dir), name="uploads")

prefix = "/api"
app.include_router(auth.router, prefix=prefix)
app.include_router(users.router, prefix=prefix)
app.include_router(categories.router, prefix=prefix)
app.include_router(decks.router, prefix=prefix)
app.include_router(cards.router, prefix=prefix)
app.include_router(sessions.router, prefix=prefix)
app.include_router(search.router, prefix=prefix)
app.include_router(tags.router, prefix=prefix)


@app.get("/api/health")
def health():
    return {"status": "ok"}
