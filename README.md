# UTS 32516 Internet Programming - Assignment 2

# Cardie Flashcards Learning App

A single-page flashcard learning application that helps students and self-learners organise study material into decks, study interactively with a smooth card-flip experience, and track their performance over time. Assignment 2 extends the A1 codebase with multi-user support, JWT authentication, admin management, card tagging, deck cover images, per-deck visual customisation, and an enhanced TipTap rich text editor.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite) |
| Styling | Custom CSS variables (dark/light theme) |
| Routing | React Router v6 (client-side SPA routing) |
| Rich Text Editor | TipTap (StarterKit + TextAlign + Image extensions) |
| Authentication | `python-jose[cryptography]` (JWT) + `passlib[bcrypt]` (password hashing) |
| Backend | FastAPI (Python) |
| Database | MySQL (raw SQL via `mysql-connector-python`) |
| File Storage | Local filesystem via `python-multipart` (served at `/api/uploads`) |
| API Communication | Axios with JWT interceptor via a centralised `api.js` service layer |
| Deployment | Local (Uvicorn dev server + Vite dev server) |

---

## Features

### Authentication & Users
- **JWT authentication** — Secure login and registration with bcrypt-hashed passwords and JWT bearer tokens
- **First-run admin bootstrap** — The first registered account automatically becomes the admin
- **User profiles** — Update display name, username, email, bio, avatar, and theme preference
- **Admin dashboard** — View all users, activate/deactivate accounts, promote to admin, and review per-user session history

### Deck & Card Management
- **Category management** — Create, edit, and delete categories with a custom colour label to group related decks
- **Deck management** — Create, edit, and delete decks; each deck shows card count, mastery %, and last studied date
- **Deck cover images** — Choose from 12 preset emoji covers or upload a custom cover image
- **Per-deck visual style** — Customise background colour, text colour, font size, font family, and border style; live preview updates in real time
- **Flashcard CRUD operations** — Add, edit, and delete flashcards with a question, answer, optional image, and tags
- **Rich text editing** — TipTap editor with bold, italic, underline, code block, text alignment, bullet/ordered lists, and inline image URL support
- **Card tagging** — Create colour-coded tags and attach them to individual cards for thematic grouping
- **Duplicate deck** — Clone an entire deck (including cards and style settings) under a new name

### Study Mode
- **Interactive card-flip study mode** — Cards flip to reveal answers with a smooth CSS 3D animation; deck visual style applied to the card faces
- **Smart study queue** — Hard cards re-enter the queue 3 positions ahead; Missed cards re-enter immediately as the next card
- **Live session dashboard** — Easy, Hard, Missed counts, accuracy %, remaining cards, and revisit count visible throughout the session
- **Keyboard shortcuts** — `Space` flip, `1` Missed, `2` Hard, `3` Easy, `Escape` end session

### Progress & Dashboard
- **Per-deck dashboard** — Mastery %, session history table, top 5 hardest cards, top 5 easiest cards
- **Personal dashboard** — Study streak, weekly cards studied, total sessions, most/least studied decks

### Discovery & UX
- **Global search** — Real-time search across all card questions and answers; results link to the parent deck
- **Tag filtering in search** — Narrow search results by tag
- **Dark mode toggle** — Persistent light/dark/system theme preference saved to the user profile
- **Onboarding tour** — 5-step first-run overlay for new users; dismissed permanently on completion
- **How It Works page** — Visual guide explaining the rating system and study workflow
- **Toast notifications** — Non-blocking success/error feedback for all create, update, and delete actions
- **Skeleton loading states** — Placeholder UI shown while data is fetching
- **Responsive design** — Layout adapts for mobile and desktop viewports

---

## Folder Structure

```
cardie/
├── client/                   # React frontend (Vite)
│   └── src/
│       ├── components/
│       │   ├── CardFlip/         # 3D flip card component (applies deck style)
│       │   ├── CategoryBadge/
│       │   ├── DeckCard/         # Deck preview with cover image
│       │   ├── Editor/
│       │   │   ├── Editor.jsx    # TipTap rich text editor
│       │   │   └── CardDisplay.jsx  # Read-only TipTap renderer
│       │   ├── Modal/
│       │   ├── Navbar/           # User avatar dropdown, search, theme toggle
│       │   ├── Skeleton/
│       │   ├── Toast/
│       │   ├── deck/
│       │   │   ├── CoverPicker.jsx       # Preset + upload cover UI
│       │   │   └── DeckStyleEditor.jsx   # Colour/font/border customisation
│       │   ├── onboarding/
│       │   │   └── OnboardingTour.jsx    # First-run 5-step overlay
│       │   └── tags/
│       │       ├── TagChip.jsx           # Coloured tag pill
│       │       └── TagInput.jsx          # Tag search/create input
│       ├── context/
│       │   ├── AuthContext.jsx   # JWT token + user state, login/logout
│       │   └── ThemeContext.jsx  # Global dark/light mode state
│       ├── hooks/
│       │   ├── useCards.js
│       │   ├── useDecks.js
│       │   └── useStudySession.js
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── Home.jsx
│       │   ├── DeckView.jsx
│       │   ├── StudyMode.jsx
│       │   ├── Dashboard.jsx
│       │   ├── ProfilePage.jsx
│       │   ├── AdminPage.jsx
│       │   └── HowItWorksPage.jsx
│       └── services/
│           ├── api.js            # Axios instance with JWT + 401 interceptors
│           ├── authService.js
│           ├── cardService.js
│           ├── categoryService.js
│           ├── deckService.js
│           ├── sessionService.js
│           ├── tagService.js
│           └── userService.js
├── server/                   # FastAPI backend (Python)
│   ├── controllers/          # Business logic (one file per resource)
│   ├── db/
│   │   └── connection.py     # MySQL connection pool
│   ├── middleware/
│   │   └── error_handler.py  # Global exception handler
│   ├── routers/              # Route definitions (one file per resource)
│   │   ├── auth.py
│   │   ├── cards.py
│   │   ├── categories.py
│   │   ├── decks.py
│   │   ├── search.py
│   │   ├── sessions.py
│   │   ├── tags.py
│   │   └── users.py
│   ├── utils/
│   │   └── security.py       # JWT encode/decode + bcrypt helpers
│   ├── uploads/              # Uploaded images (served as static files)
│   ├── main.py               # App entry point
│   └── requirements.txt
├── database/
│   ├── schema.sql            # Table definitions
│   └── seed.sql              # Sample data (admin + student accounts)
└── README.md
```

---

## Database Schema

The database (`cardie`) consists of six tables:

- **`users`** — Registered accounts with username, email, bcrypt-hashed password, role (`admin`/`user`), profile fields, and onboarding status
- **`categories`** — Top-level groupings with a name, colour, and description
- **`decks`** — Card collections owned by a user, with category assignment, cover image, and five visual style fields
- **`flashcards`** — Individual cards with TipTap HTML question/answer, optional image, and cumulative Easy/Hard/Missed counters
- **`tags`** — User-scoped colour-coded labels for cards
- **`card_tags`** — Junction table linking flashcards to tags
- **`study_sessions`** — Log of each completed study session recording accuracy and rating breakdown per deck, linked to the owning user

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

The seed data creates two accounts:

| Username | Password | Role |
|---|---|---|
| `admin` | `Admin!@123` | admin |
| `student` | `Student!@123` | user |

### Backend

```bash
cd server
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # Fill in DB credentials and JWT secret
uvicorn main:app --reload
```

### Frontend

```bash
cd client
npm install
npm run dev
```

The app will be available at `http://localhost:5173`. Interactive API docs (Swagger UI) are at `http://localhost:8000/docs`.

### Environment Variables

Create a `.env` file inside the `server/` folder (copy from `.env.example`):

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=cardie
JWT_SECRET=change-me-to-a-long-random-string
JWT_EXPIRE_MINUTES=1440
```

---

## Challenges Overcome

The largest new challenge in A2 was implementing JWT authentication end-to-end. On the backend, getting FastAPI's dependency injection (`Depends(get_current_user)`) to propagate the decoded user payload cleanly through every route — without repeating auth logic — required careful structuring of the middleware and controller layers. On the frontend, wiring an Axios request interceptor to attach the `Authorization: Bearer` header automatically, and a response interceptor to detect 401 errors and dispatch a `cardie:session-expired` event that the React AuthContext could catch and respond to, took several iterations to get right without race conditions or stale closure bugs.

The deck visual style and cover image features introduced a sequencing problem: a cover image upload requires the deck's database ID, which only exists after the initial `POST /api/decks` call returns. This meant splitting the create flow into two steps — save the deck first, then upload the cover — and composing these steps cleanly inside a single React event handler without leaving the UI in a broken intermediate state.

Implementing the card tagging system required designing a junction table (`card_tags`) and writing a tag-sync function in the card-edit handler that diffs the original tag list against the new one, adding and removing tags in parallel via `Promise.all`, to avoid stale or duplicated tag entries.

Passlib's `bcrypt` integration raised a compatibility error (`AttributeError: module 'bcrypt' has no attribute '__about__'`) caused by a version mismatch between `passlib` and newer `bcrypt` releases. The fix was to pin `bcrypt==4.0.1` in `requirements.txt`, which is the last version whose API surface matches what `passlib` expects.

Migrating all data access from A1's single-user model to a multi-user model required adding `user_id` filters to every query in `deck_controller.py` and `session_controller.py`. Missing even one filter would allow users to see each other's data, so a systematic audit of every SELECT, INSERT, UPDATE, and DELETE was necessary.

---

## Workload Allocation

This is a solo submission. All design, implementation, testing, and documentation work was completed individually by the student.

To maintain academic integrity, I declare the use of Claude Code (the AI coding tool developed by Anthropic) to assist with certain implementation challenges, explain unfamiliar concepts, and suggest solutions to code issues that I was unable to resolve using other web resources.
