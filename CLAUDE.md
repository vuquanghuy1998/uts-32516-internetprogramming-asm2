# Cardie — Flashcard Learning App
## Claude Code Project Context File

> This file is the single source of truth for the Cardie project. Read this fully before writing any code, generating any files, or making any architectural decisions.

---

## 1. Project Overview

**Cardie** is a single-page flashcard learning application built for a university assignment (UTS 31748/32516 — Dynamic Web Interface to a Database System).

### Problem It Solves
Students and learners need a structured, engaging way to create and study flashcards. Cardie organises cards into decks and categories, supports rich content (formatted text + images), and uses a simple session-based spaced repetition system to prioritise cards the user struggles with.

### Assignment Constraints
- Must behave as a **Single-Page Application (SPA)** — one HTML entry point, no full page reloads
- Must include all **CRUD operations** on a database
- Must have a **seamless, streamlined interface** with no unnecessary steps
- **No authentication required** — the app is single-user, local
- Submitted as a **zip file** run locally by the marker — everything must work with just `pip install -r requirements.txt` and `npm install`
- Marked on: SPA behaviour, CRUD coverage, business logic, UX/UI polish, README quality, code quality, in-person Q&A

---

## 2. Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | React (Vite) | SPA behaviour, component reuse, fast dev |
| Rich Text Editor | TipTap | Modern, React-friendly, supports bold/italic/code blocks |
| Styling | CSS Modules or Tailwind CSS | Scoped styles, clean maintainable code |
| Backend | Python + FastAPI | Clean, modern Python framework with auto-generated API docs |
| Database | MySQL | Required by course, relational structure fits the data model |
| Database Driver | mysql-connector-python | Raw SQL queries, direct and transparent, no ORM abstraction |
| File Uploads | python-multipart | Handles multipart form data for image uploads in FastAPI |
| Environment | python-dotenv | Manage DB credentials via .env file |
| Dev Server | uvicorn | ASGI server to run FastAPI with hot reload |

### Why These Choices
- FastAPI automatically generates interactive API docs at `/docs` (Swagger UI) — great for testing and demonstrating to the marker
- mysql-connector-python uses raw SQL — leverages existing SQL knowledge from the course, queries are transparent and easy to understand
- python-multipart saves images to a local `/uploads` folder — no cloud accounts needed, works out of the box for the marker
- TipTap saves rich text as HTML strings in a MySQL TEXT column — simple and renderable
- No Redux, no GraphQL, no WebSockets — keep it simple and maintainable

---

## 3. Database Schema

### Table: `categories`
Organises decks into subjects (e.g. "Science", "Languages", "Computer Science")

```sql
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#6366f1',  -- hex color for UI badge
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: `decks`
A named collection of flashcards belonging to a category

```sql
CREATE TABLE decks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);
```

### Table: `flashcards`
Individual cards with rich text content, optional image, and cumulative study stats

```sql
CREATE TABLE flashcards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  deck_id INT NOT NULL,
  question TEXT NOT NULL,         -- stored as HTML string from TipTap
  answer TEXT NOT NULL,           -- stored as HTML string from TipTap
  image_path VARCHAR(255),        -- relative path e.g. 'uploads/card_123.jpg'
  ease_count INT DEFAULT 0,       -- cumulative Easy ratings across all sessions
  hard_count INT DEFAULT 0,       -- cumulative Hard ratings across all sessions
  missed_count INT DEFAULT 0,     -- cumulative Missed ratings across all sessions
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
);
```

### Table: `study_sessions`
Logs each completed study session for history and dashboard metrics

```sql
CREATE TABLE study_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  deck_id INT NOT NULL,
  easy_count INT DEFAULT 0,
  hard_count INT DEFAULT 0,
  missed_count INT DEFAULT 0,
  total_cards INT DEFAULT 0,
  accuracy_percent DECIMAL(5,2),  -- easy_count / total_cards * 100
  studied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
);
```

### Relationships
- One category → many decks
- One deck → many flashcards
- One deck → many study sessions
- Deleting a deck cascades to delete its flashcards and study sessions

---

## 4. Full Feature List

### 4.1 Category Management
- View all categories as cards on the home/browse page
- Create a new category (name, color picker, optional description)
- Edit a category name, color, or description
- Delete a category (with confirmation modal — warns that decks will be unlinked)
- Each category displays a colored badge and count of decks inside it

### 4.2 Deck Management
- View all decks, filterable by category
- Create a new deck (name, description, assign to category)
- Edit a deck (name, description, category reassignment)
- Delete a deck (with confirmation modal — warns cards will be deleted)
- **Duplicate a deck** — clone the deck and all its cards with a new name
- Each deck card shows: card count, mastery %, last studied date (from study_sessions)

### 4.3 Flashcard Management
- View all cards within a deck in a grid or list layout
- Create a new card with:
  - Question field (TipTap rich text — bold, italic, underline, code block)
  - Answer field (TipTap rich text)
  - Optional image upload (python-multipart — shown on the card)
- Edit an existing card (all fields editable)
- Delete a card (with confirmation)
- **Card shuffle toggle** — randomise card order before studying

### 4.4 Study Mode (Session-Based Spaced Repetition)
This is the core feature. Behaviour must be exactly as follows:

**Starting a session:**
- User clicks "Study" on a deck
- All cards in the deck are loaded into a session queue
- Optional shuffle toggle before starting

**During a session — live dashboard visible at all times showing:**
- ✅ Easy count (this session)
- 😰 Hard count (this session)
- ❌ Missed count (this session)
- 📈 Accuracy % (easy / total rated so far × 100)
- 🃏 Remaining cards in queue
- 🔁 Revisit count (how many times cards have looped back)

**Card interaction:**
- Card displays the question (with rendered rich text and image if present)
- User clicks the card (or presses Spacebar) to flip and reveal the answer
- After flipping, three buttons appear: **Missed** | **Hard** | **Easy**

**Queue logic:**
- **Easy** → card is removed from the queue permanently for this session
- **Hard** → card is reinserted into the queue 3 positions ahead
- **Missed** → card is reinserted immediately as the next card

**Session end:**
- Triggered when queue is empty (all cards rated Easy)
- Or user clicks "End Session" early
- Summary screen shown: final stats for the session
- Stats saved to DB: `study_sessions` table updated, and each card's `ease_count`, `hard_count`, `missed_count` incremented accordingly
- User returned to the deck page

### 4.5 Progress Dashboard
- Accessible from each deck page
- Shows:
  - Mastery % (ease_count / total ratings × 100, calculated from flashcards table)
  - Bar chart or visual breakdown of Easy / Hard / Missed across all sessions
  - Study session history list (date, accuracy %, cards studied)
  - Hardest cards (top 5 by missed_count)
  - Easiest cards (top 5 by ease_count)
- All data pulled from `flashcards` and `study_sessions` tables

### 4.6 Search
- Global search bar accessible from the main navigation
- Searches across card questions and answers (MySQL LIKE query)
- Results show which deck each card belongs to
- Clicking a result navigates to that deck with the card highlighted

### 4.7 UI/UX Features
- **Dark mode toggle** — persisted in localStorage, applied via CSS variables on root
- **Keyboard shortcuts during study mode:**
  - `Space` — flip card
  - `1` — rate Missed
  - `2` — rate Hard
  - `3` — rate Easy
  - `Escape` — end session
- **Smooth card flip animation** — CSS 3D transform `rotateY(180deg)` on click
- **Toast notifications** — brief success/error messages for all CRUD operations
- **Skeleton loaders** — shown while API calls are in flight
- **Confirmation modals** — for all destructive actions (delete deck, delete card, delete category)
- **Responsive design** — works on mobile and desktop

---

## 5. API Routes

All routes prefixed with `/api`

### Categories
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/categories` | Get all categories |
| POST | `/api/categories` | Create a category |
| PUT | `/api/categories/:id` | Update a category |
| DELETE | `/api/categories/:id` | Delete a category |

### Decks
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/decks` | Get all decks (with category info) |
| GET | `/api/decks/:id` | Get single deck with card count + last studied |
| POST | `/api/decks` | Create a deck |
| PUT | `/api/decks/:id` | Update a deck |
| DELETE | `/api/decks/:id` | Delete a deck |
| POST | `/api/decks/:id/duplicate` | Duplicate a deck and its cards |

### Flashcards
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/decks/:deckId/cards` | Get all cards in a deck |
| POST | `/api/decks/:deckId/cards` | Create a card (multipart/form-data for image) |
| PUT | `/api/cards/:id` | Update a card |
| DELETE | `/api/cards/:id` | Delete a card |

### Study Sessions
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/decks/:deckId/sessions` | Get session history for a deck |
| POST | `/api/sessions` | Save a completed session + update card stats |

### Search
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/search?q=keyword` | Search cards by question/answer content |

---

## 6. Folder Structure

```
cardie/
├── client/                        # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   │   ├── CardFlip/          # Flashcard flip component
│   │   │   ├── DeckCard/          # Deck preview card
│   │   │   ├── CategoryBadge/     # Colored category label
│   │   │   ├── Modal/             # Confirmation/form modals
│   │   │   ├── Toast/             # Notification toasts
│   │   │   ├── Skeleton/          # Loading skeletons
│   │   │   ├── Editor/            # TipTap rich text editor wrapper
│   │   │   └── Navbar/            # Top navigation with search + dark mode
│   │   ├── pages/                 # Page-level components (React Router views)
│   │   │   ├── Home.jsx           # Category/deck browse view
│   │   │   ├── DeckView.jsx       # Cards within a deck + study button
│   │   │   ├── StudyMode.jsx      # Full study session view
│   │   │   └── Dashboard.jsx      # Progress stats for a deck
│   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── useDecks.js
│   │   │   ├── useCards.js
│   │   │   └── useStudySession.js # Session queue logic lives here
│   │   ├── services/              # API call functions (fetch wrappers)
│   │   │   ├── api.js             # Base fetch config
│   │   │   ├── categoryService.js
│   │   │   ├── deckService.js
│   │   │   ├── cardService.js
│   │   │   └── sessionService.js
│   │   ├── context/               # React Context
│   │   │   └── ThemeContext.jsx   # Dark mode state
│   │   ├── App.jsx                # Router setup
│   │   └── main.jsx               # Entry point
│   ├── index.html                 # Single HTML file — SPA entry point
│   └── package.json
│
├── server/                        # FastAPI backend
│   ├── routers/
│   │   ├── categories.py
│   │   ├── decks.py
│   │   ├── cards.py
│   │   ├── sessions.py
│   │   └── search.py
│   ├── controllers/               # Business logic separated from routes
│   │   ├── category_controller.py
│   │   ├── deck_controller.py
│   │   ├── card_controller.py
│   │   ├── session_controller.py
│   │   └── search_controller.py
│   ├── middleware/
│   │   └── error_handler.py       # Global error handler
│   ├── db/
│   │   └── connection.py          # mysql-connector-python connection pool
│   ├── uploads/                   # Image files saved here
│   ├── main.py                    # FastAPI app entry point
│   └── requirements.txt           # Python dependencies
│
├── database/
│   ├── schema.sql                 # Full CREATE TABLE statements
│   └── seed.sql                   # Sample data for demo/testing
│
├── .env.example                   # Template for environment variables
├── .gitignore                     # Excludes node_modules, __pycache__, .env, uploads/*
├── README.md                      # Assignment submission README
└── CLAUDE.md                      # This file
```

---

## 7. Environment Variables

Create a `.env` file in `/server` based on `.env.example`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=cardie
```

The React frontend runs on port `5173` (Vite default).
The FastAPI backend runs on port `8000` (uvicorn default).
Vite is configured to proxy `/api` requests to `http://localhost:8000`.

### Backend Dependencies (`server/requirements.txt`)
```
fastapi
uvicorn[standard]
mysql-connector-python
python-multipart
python-dotenv
```

Install with:
```bash
pip install -r requirements.txt
```

### Running the Backend
```bash
cd server
uvicorn main:app --reload
# FastAPI running on http://localhost:8000
# Interactive API docs at http://localhost:8000/docs
```

---

## 8. Study Session Queue Logic

This logic lives entirely in `useStudySession.js` (frontend). No backend involvement mid-session.

```
sessionQueue = [...allCardsInDeck]  // optionally shuffled

onRate(card, rating):
  if rating === 'easy':
    remove card from queue
    increment local easyCount
  if rating === 'hard':
    reinsert card at position (currentIndex + 3) in queue
    increment local hardCount
  if rating === 'missed':
    reinsert card at position (currentIndex + 1) in queue
    increment local missedCount
  
  advance to next card in queue
  update live stats: accuracy = easyCount / totalRated * 100

onSessionEnd:
  POST /api/sessions with { deckId, easyCount, hardCount, missedCount, totalCards, accuracy }
  Backend updates study_sessions table
  Backend increments ease_count/hard_count/missed_count on each affected flashcard
```

---

## 9. UI/UX Design Direction

**Aesthetic:** Clean, modern, slightly playful — like a polished student productivity tool. Think Notion meets Anki.

**Color Palette (light mode):**
- Background: `#f8f9fa`
- Surface: `#ffffff`
- Primary: `#6366f1` (indigo)
- Accent: `#f59e0b` (amber)
- Text: `#1a1a2e`
- Border: `#e2e8f0`

**Color Palette (dark mode):**
- Background: `#0f0f1a`
- Surface: `#1a1a2e`
- Primary: `#818cf8`
- Text: `#e2e8f0`
- Border: `#2d2d44`

**Typography:**
- Headings: `Syne` or `DM Serif Display` (Google Fonts)
- Body: `DM Sans` or `Plus Jakarta Sans`

**Key Animations:**
- Card flip: CSS `rotateY(180deg)` with `transform-style: preserve-3d`
- Page transitions: subtle fade-in on route change
- Toast notifications: slide in from bottom-right
- Modals: scale up from center with backdrop blur
- Skeleton loaders: pulsing gradient shimmer

**Mobile Responsiveness:**
- Single column layout on mobile
- Study mode works fully on touch (tap to flip)
- Navigation collapses to bottom tab bar on mobile

---

## 10. Code Quality Standards

- **Naming:** 
  - Python: `snake_case` for all variables, functions, and file names
  - React/JS: camelCase for variables/functions, PascalCase for components
  - Database: `snake_case` for all column and table names
- **Comments:** Add a comment above any non-obvious logic block (especially the session queue reordering)
- **Error handling:**
  - All API routes wrapped in try/catch with meaningful error messages
  - Frontend shows toast error if any API call fails
  - App never shows a blank screen on API failure — always show an error state
- **Input validation:**
  - Backend validates required fields before DB insert
  - Frontend disables submit buttons on empty required fields
- **No console.log left in production code** — use proper error handling
- **Consistent async/await** — no mixing with .then() chains

---

## 11. README Requirements (Assignment Rubric)

The README.md must include all six of these sections to get full marks:

1. **Project title** — Cardie
2. **Problem summary** — what problem this app solves (2-3 sentences)
3. **Tech stack** — frontend, styling, routing, backend, database, file storage, deployment
4. **Feature list** — bullet points of all features
5. **Folder structure** — explained briefly
6. **Challenges overcome** — 4-5 sentences about real challenges faced during development

---

## 12. Things to Avoid

- ❌ No authentication / login system
- ❌ No cloud storage (Cloudinary, AWS S3) — use local python-multipart only
- ❌ No Redux — React Context + useState is sufficient
- ❌ No SQLAlchemy ORM — use raw SQL with mysql-connector-python
- ❌ No full SM-2 spaced repetition algorithm — session-based queue only
- ❌ No multiple HTML files — React Router handles all navigation in one SPA
- ❌ No `print()` statements left in final Python code — use proper error handling
- ❌ Do not store images as Base64 in the database
- ❌ Do not use `SELECT *` in production queries — specify columns explicitly

---

## 13. Assignment Rubric Priorities (for Claude Code)

When making any design or implementation decision, prioritise in this order:

1. **Does it work correctly?** — CRUD operations must be reliable
2. **Is the UX seamless?** — No unnecessary steps, good feedback, smooth transitions
3. **Is the code clean and organised?** — Folder structure, naming, error handling
4. **Does it look professional?** — Visual polish, responsiveness, dark mode
5. **Is it a true SPA?** — No full page reloads, React Router for navigation

---

*Last updated: Project planning phase. App name: Cardie. Stack: React + Python/FastAPI + MySQL.*
