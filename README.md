# UTS 32516 Internet Programming - Assignment 1

# Cardie Flashcards Learning App

A single-page flashcard learning application that helps students and self-learners organise study material into decks, classifying decks into categories, study interactively with a smooth card-flip experience, and track their performance over time with a live dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite) |
| Styling | CSS Modules & custom CSS variables (dark/light theme) |
| Routing | React Router v6 (client-side SPA routing) |
| Rich Text Editor | TipTap (basic editing experience with Starter Kit) |
| Backend | FastAPI (Python) |
| Database | MySQL (raw SQL via `mysql-connector-python`) |
| File Storage | Local filesystem via `python-multipart` (served at `/api/uploads`) |
| API Communication | Fetch API via a centralised `api.js` service layer |
| Deployment | Local (Uvicorn dev server + Vite dev server) |

---

## Features

- **Category management** — Create, edit, and delete categories with a custom colour label to group related decks
- **Deck management** — Create, edit, and delete decks within a category; each deck has a name and description
- **Flashcard CRUD** — Add, edit, and delete flashcards with a question, answer, and optional image upload
- **Interactive card-flip study mode** — Cards flip to reveal answers with a smooth 3D animation; users rate each card as Easy, Hard, or Missed
- **Smart study queue** — Hard and Missed cards are automatically re-queued so they appear again in the same session
- **Per-deck dashboard** — View study session history, accuracy percentage, and Easy/Hard/Missed breakdowns for a deck
- **Global search** — Search across all cards and decks from the navbar
- **Dark mode toggle** — Persistent light/dark theme via React Context
- **Toast notifications** — Non-blocking feedback for all create, update, and delete actions
- **Skeleton loading states** — Placeholder UI shown while data is fetching to avoid blank screens
- **Duplicate deck** — Clone an entire deck and all its cards under a new name
- **Keyboard shortcuts in study mode** — `Space` to flip, `1` Missed / `2` Hard / `3` Easy to rate, `Escape` to end session
- **Responsive design** — Layout adapts for mobile and desktop viewports
- **Error handling** — All API failures surface a user-facing error message; the app never shows a blank screen on network failure

---

## Folder Structure

```
cardie/
├── client/                   # React frontend (Vite)
│   └── src/
│       ├── components/       # Reusable UI components
│       │   ├── CardFlip/     # 3D flip card component
│       │   ├── CategoryBadge/
│       │   ├── DeckCard/
│       │   ├── Editor/       # Rich text editor for card content
│       │   ├── Modal/        # Generic modal wrapper
│       │   ├── Navbar/
│       │   ├── Skeleton/     # Loading placeholder UI
│       │   └── Toast/        # Notification system
│       ├── context/
│       │   └── ThemeContext.jsx   # Global dark/light mode state
│       ├── hooks/            # Custom React hooks
│       │   ├── useCards.js
│       │   ├── useDecks.js
│       │   └── useStudySession.js
│       ├── pages/            # Route-level page components
│       │   ├── Landing.jsx
│       │   ├── Home.jsx
│       │   ├── Categories.jsx
│       │   ├── CategoryDetail.jsx
│       │   ├── DeckView.jsx
│       │   ├── StudyMode.jsx
│       │   └── Dashboard.jsx
│       └── services/         # API call functions (one file per resource)
│           ├── api.js        # Base fetch wrapper and error handling
│           ├── cardService.js
│           ├── categoryService.js
│           ├── deckService.js
│           └── sessionService.js
├── server/                   # FastAPI backend (Python)
│   ├── controllers/          # Business logic (one file per resource)
│   ├── db/
│   │   └── connection.py     # MySQL connection pool
│   ├── middleware/
│   │   └── error_handler.py  # Global exception handler
│   ├── routers/              # Route definitions (one file per resource)
│   │   ├── cards.py
│   │   ├── categories.py
│   │   ├── decks.py
│   │   ├── search.py
│   │   └── sessions.py
│   ├── uploads/              # Uploaded card images (served as static files)
│   ├── main.py               # App entry point, middleware and router registration
│   └── requirements.txt
├── database/
│   ├── schema.sql            # Table definitions
│   └── seed.sql              # Sample data
└── README.md
```

---

## Database Schema

The database (`cardie`) consists of four tables:

- **`categories`** — Top-level groupings with a name, colour, and description
- **`decks`** — Card collections belonging to a category
- **`flashcards`** — Individual cards with question, answer, optional image, and cumulative Easy/Hard/Missed counters
- **`study_sessions`** — A log of each completed study session recording accuracy and rating breakdown per deck

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- MySQL 8+

### Database Setup

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p cardie < database/seed.sql
```

### Backend

```bash
cd server
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # Fill in your DB credentials
uvicorn main:app --reload
```

### Frontend

```bash
cd client
npm install
npm run dev
```

The app will be available at `http://localhost:5173`. Interactive API docs (Swagger UI) are available at `http://localhost:8000/docs`.

### Environment Variables

Create a `.env` file inside the `server/` folder (copy from `.env.example`):

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=cardie
```

---

## Challenges Overcome

Implementing the study session queue was the most nuanced challenge — cards rated Hard or Missed needed to be re-inserted into the remaining queue at a natural position rather than the end, which required careful state management in the `useStudySession` hook to avoid infinite loops while still ensuring difficult cards resurfaced. Synchronising the MySQL connection pool across FastAPI's async request lifecycle also required careful handling to avoid dropped connections under concurrent requests. On the frontend, getting the 3D card-flip CSS animation to behave consistently across browsers while also being interruptible (e.g., navigating away mid-flip) required isolating the animation state fully within the `CardFlip` component. Finally, designing a service layer (`/services`) that cleanly separated API concerns from component logic made the codebase significantly easier to debug and extend as the feature set grew.