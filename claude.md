# Cardie — A2 CLAUDE.md
## Claude Code Project Context File

> This file is the single source of truth for the Cardie A2 project. Read this fully before writing any code, generating any files, or making any architectural decisions.

---

## 1. Project Overview

**Cardie** is a single-page flashcard learning application. This is Assignment 2 (UTS 31748/32516), extending the A1 codebase with multi-user support, JWT authentication, admin management, a richer dashboard, card tagging, deck cover images, per-deck visual customisation, and a full-featured TipTap rich text editor.

### Problem It Solves
Students and learners need a structured, engaging way to create and study flashcards. Cardie organises cards into decks and categories, supports rich content (formatted text + images), and uses a session-based queue system to prioritise cards the user struggles with. Multi-user support now lets each learner have their own private deck library, with an admin able to oversee all activity.

### Assignment Constraints
- Must behave as a **Single-Page Application (SPA)** — one HTML entry point, no full page reloads
- Must include all **CRUD operations** on a database
- Must have at least **3 conceptual entities** with CRUD
- Must include **JWT authentication** with password hashing
- Must include **live search** (real-time filtering)
- Must include **admin role** with elevated access
- Submitted as a **GitHub repo** with video demo — must work with `pip install -r requirements.txt` and `npm install`
- Solo submission — workload allocation section in README simply states all work is individual

---

## 2. Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | React (Vite) | SPA behaviour, component reuse, fast dev |
| Rich Text Editor | TipTap (free extensions only) | Modern, headless, React-friendly; replaces plain textareas from A1 |
| Styling | CSS Modules or Tailwind CSS | Scoped styles, clean maintainable code |
| Backend | Python + FastAPI | Clean, modern Python framework with auto-generated API docs |
| Database | MySQL | Relational structure fits the data model |
| Database Driver | mysql-connector-python | Raw SQL queries, no ORM abstraction |
| Auth | python-jose[cryptography] + passlib[bcrypt] | JWT token generation + secure password hashing |
| File Uploads | python-multipart | Handles image uploads (deck covers, card images) |
| Environment | python-dotenv | Manage credentials via .env |
| Dev Server | uvicorn | ASGI server for FastAPI with hot reload |

### Key Decisions
- **No SQLAlchemy ORM** — raw SQL with mysql-connector-python only
- **No Redux** — React Context + useState is sufficient
- **No cloud storage** — python-multipart saves to local `/uploads` folder
- **No multiple HTML files** — React Router handles all navigation
- **TipTap free tier only** — no paid/cloud extensions needed

---

## 3. Database Schema

### Table: `users` ← NEW in A2
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  full_name VARCHAR(100),
  bio TEXT,                                      -- stored as HTML from TipTap
  avatar_url VARCHAR(255),
  theme_preference ENUM('light', 'dark', 'system') DEFAULT 'system',
  is_active BOOLEAN DEFAULT TRUE,
  has_completed_onboarding BOOLEAN DEFAULT FALSE, -- controls first-run tour
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);
```

### Table: `categories` (unchanged from A1)
```sql
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#6366f1',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: `decks` ← updated: add user_id, cover image, style fields
```sql
CREATE TABLE decks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category_id INT,
  name VARCHAR(150) NOT NULL,
  description TEXT,                        -- stored as HTML from TipTap
  cover_image_path VARCHAR(255),           -- 'uploads/covers/deck_123.jpg' or preset key
  cover_image_type ENUM('preset', 'upload') DEFAULT 'preset',
  style_bg_color VARCHAR(7) DEFAULT '#ffffff',
  style_text_color VARCHAR(7) DEFAULT '#1a1a2e',
  style_font_size ENUM('small', 'medium', 'large') DEFAULT 'medium',
  style_font_family ENUM('sans', 'serif', 'mono', 'decorative') DEFAULT 'sans',
  style_border_style ENUM('none', 'rounded', 'sharp') DEFAULT 'rounded',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);
```

### Table: `flashcards` (unchanged from A1)
```sql
CREATE TABLE flashcards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  deck_id INT NOT NULL,
  question TEXT NOT NULL,       -- stored as HTML from TipTap
  answer TEXT NOT NULL,         -- stored as HTML from TipTap
  image_path VARCHAR(255),
  ease_count INT DEFAULT 0,
  hard_count INT DEFAULT 0,
  missed_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
);
```

### Table: `study_sessions` ← updated: add user_id
```sql
CREATE TABLE study_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  deck_id INT NOT NULL,
  easy_count INT DEFAULT 0,
  hard_count INT DEFAULT 0,
  missed_count INT DEFAULT 0,
  total_cards INT DEFAULT 0,
  accuracy_percent DECIMAL(5,2),
  studied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
);
```

### Table: `tags` ← NEW in A2
```sql
CREATE TABLE tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  user_id INT NOT NULL,
  color VARCHAR(7) DEFAULT '#6366f1',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Table: `card_tags` ← NEW in A2 (junction table)
```sql
CREATE TABLE card_tags (
  card_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (card_id, tag_id),
  FOREIGN KEY (card_id) REFERENCES flashcards(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

### Entity Summary (satisfies ≥3 CRUD entity requirement)
- `users` — full CRUD (admin manages all; user manages self)
- `decks` — full CRUD (user-scoped)
- `flashcards` — full CRUD
- `categories` — full CRUD
- `study_sessions` — Create + Read
- `tags` / `card_tags` — full CRUD

---

## 4. Authentication & User Management

### First-Run Admin Bootstrap
```
App loads → GET /api/users/admin-exists
                    ↓ false                  ↓ true
        Show "Create Admin" form     Show normal Register form
        (one-time only)              (creates role='user')
```
- Backend checks `SELECT COUNT(*) FROM users WHERE role = 'admin'`
- If zero → allow admin creation on the register endpoint
- If ≥1 → only allow `role='user'` registration; admin must appoint via PATCH

### JWT Flow
- `POST /api/auth/register` → hash password with bcrypt → store user → return JWT
- `POST /api/auth/login` → accepts username OR email in one field → verify hash → return JWT
- JWT payload: `{ id, username, role, exp }`
- Frontend stores token in `localStorage`; attaches as `Authorization: Bearer <token>` header
- All protected routes use a `get_current_user` FastAPI dependency that decodes the JWT

### Role-Based Access
| Action | User | Admin |
|--------|------|-------|
| Manage own decks/cards | ✅ | ✅ |
| View own study history | ✅ | ✅ |
| Edit own profile | ✅ | ✅ |
| View all users | ❌ | ✅ |
| CRUD any user account | ❌ | ✅ |
| Promote user to admin | ❌ | ✅ |
| View all users' study history | ❌ | ✅ |

---

## 5. Full Feature List

### 5.1 Auth Pages (NEW)
- `/register` — Username, email, password fields; first-run admin bootstrap logic
- `/login` — Single "Username or Email" input + password; issues JWT on success
- Redirect to `/` after login; redirect to `/login` if JWT missing/expired

### 5.2 User Profile Page (NEW)
- View and edit: full_name, username, email, bio (TipTap editor), avatar_url
- Theme preference toggle (light / dark / system) — syncs to ThemeContext
- Shows user's deck count and total study sessions
- Change password (requires current password confirmation)

### 5.3 Admin Dashboard (NEW)
- View all registered users in a table (username, email, role, last_login, is_active)
- CRUD on users: create, edit fields, toggle is_active, delete, promote to admin
- View per-user study history: sessions table with deck name, accuracy, date
- Summary stats: total users, active this week, top decks across all users

### 5.4 Personal Dashboard (enhanced from A1)
User-scoped metrics pulled from `study_sessions` and `flashcards`:
- **Study streak** — consecutive days with at least one session
- **Overall accuracy rate** — easy / total rated × 100 across all sessions
- **Cards studied over time** — bar/line chart, last 7 or 30 days (toggle)
- **Total cards studied** — today / this week / this month
- **Most studied deck** and **least studied deck**
- **Hardest cards** — top 5 by missed_count
- **Easiest cards** — top 5 by ease_count

### 5.5 Category Management (unchanged from A1)
- View all categories as cards; create, edit, delete (with confirmation modal)

### 5.6 Deck Management (updated from A1)
- View all decks for the logged-in user; filterable by category and tag
- Create/edit deck: name, description (TipTap), category, cover image, style options
- **Cover image:** choose from ~12 preset covers (subject icons) OR upload a custom image
- **Per-deck style customisation** (stored in `decks` table):
  - Card background colour (preset palette of ~10 colours)
  - Text colour (auto-suggests contrast; manual override allowed)
  - Font size (small / medium / large)
  - Font family (sans-serif / serif / monospace / decorative)
  - Border style (none / rounded / sharp)
- Delete deck (with confirmation, warns cards will be deleted)
- Duplicate a deck (clones all cards)
- Each deck card shows: cover image, card count, mastery %, last studied date

### 5.7 Flashcard Management (updated from A1)
- View cards in a deck (grid or list layout)
- Create/edit card: question + answer both use TipTap rich text editor; optional image upload
- **TipTap extensions in use:** StarterKit, Mathematics (KaTeX), CodeBlockLowlight, Image, TextAlign
- **Tagging:** type-and-press-Enter tag input; displays as coloured chips; tags are per-user
- Cards rendered read-only using TipTap's `editable: false` mode (not `dangerouslySetInnerHTML`)
- Delete card (with confirmation)
- Card shuffle toggle before study

### 5.8 Study Mode (unchanged from A1)
- Queue logic lives in `useStudySession.js`
- Easy → remove from queue; Hard → reinsert +3 positions; Missed → reinsert immediately next
- Live stats during session: easy/hard/missed/accuracy/remaining/revisit count
- Keyboard shortcuts: Space (flip), 1 (missed), 2 (hard), 3 (easy), Escape (end)
- Session summary on completion; stats saved to `study_sessions`, increments on `flashcards`

### 5.9 Search (updated from A1)
- Global search: filters card questions/answers in real-time (MySQL LIKE)
- Filter by tag: clicking a tag shows all cards with that tag across decks
- Tag filter integrated into the global search bar

### 5.10 Onboarding & UX Guidance (NEW, based on tutor feedback)
- **First-run onboarding tour** — step-by-step tooltip overlay using Intro.js or Shepherd.js
  - Triggered when `has_completed_onboarding = false` on the user's account
  - Steps: Welcome → Create a deck → Add cards → Start studying → Done
  - On completion, PATCH `/api/users/me` sets `has_completed_onboarding = true`
- **Empty state messages** — every blank list shows an explanation + call-to-action button:
  - No decks → "You haven't created any decks yet. A deck is a collection of flashcards on a topic."
  - No cards in deck → "This deck is empty. Add your first flashcard to start studying."
  - No sessions → "You haven't studied yet. Open a deck and hit Study to begin."
- **Inline form hints** — helper text beneath key fields (question, answer, tags)
- **Tooltips** — `?` icon next to non-obvious controls (queue logic, mastery %, study streak)
- **"How It Works" page** — accessible from navbar/footer; explains the study method in 3-4 sections

### 5.11 UI/UX Features (carried from A1, updated)
- Dark mode toggle — persisted in localStorage AND in `users.theme_preference`
- Smooth card flip animation (CSS rotateY)
- Toast notifications for all CRUD operations
- Skeleton loaders during API calls
- Confirmation modals for all destructive actions
- Responsive design (mobile + desktop); bottom tab bar on mobile

---

## 6. API Routes

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/auth/admin-exists` | Public | Returns bool — is any admin in DB? |
| POST | `/api/auth/register` | Public | Create user account |
| POST | `/api/auth/login` | Public | Returns JWT |

### Users
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users` | Admin | List all users |
| GET | `/api/users/me` | User | Own profile |
| PATCH | `/api/users/me` | User | Update own profile |
| GET | `/api/users/{id}` | Admin | View any user |
| PATCH | `/api/users/{id}` | Admin | Edit any user |
| PATCH | `/api/users/{id}/role` | Admin | Promote/demote role |
| DELETE | `/api/users/{id}` | Admin | Delete user |

### Categories, Decks, Cards, Sessions, Search
Carry over from A1 with decks and sessions scoped to `user_id` from JWT. All routes except search require a valid JWT.

### Tags
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/tags` | User | List own tags |
| POST | `/api/tags` | User | Create tag |
| PATCH | `/api/tags/{id}` | User | Rename/recolour tag |
| DELETE | `/api/tags/{id}` | User | Delete tag (removes from all cards) |
| POST | `/api/cards/{id}/tags` | User | Assign tag to card |
| DELETE | `/api/cards/{id}/tags/{tag_id}` | User | Remove tag from card |

---

## 7. Folder Structure

```
cardie/
├── client/                        # React frontend (Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx          ← NEW
│   │   │   ├── RegisterPage.jsx       ← NEW
│   │   │   ├── ProfilePage.jsx        ← NEW
│   │   │   ├── AdminPage.jsx          ← NEW
│   │   │   ├── HowItWorksPage.jsx     ← NEW
│   │   │   ├── HomePage.jsx
│   │   │   ├── DecksPage.jsx
│   │   │   ├── DeckDetailPage.jsx
│   │   │   └── StudyPage.jsx
│   │   ├── components/
│   │   │   ├── editor/
│   │   │   │   ├── CardEditor.jsx     ← NEW: TipTap editor component
│   │   │   │   └── CardDisplay.jsx    ← NEW: TipTap read-only renderer
│   │   │   ├── onboarding/
│   │   │   │   └── OnboardingTour.jsx ← NEW
│   │   │   ├── tags/
│   │   │   │   ├── TagInput.jsx       ← NEW
│   │   │   │   └── TagChip.jsx        ← NEW
│   │   │   ├── deck/
│   │   │   │   ├── DeckStyleEditor.jsx ← NEW
│   │   │   │   └── CoverPicker.jsx    ← NEW
│   │   │   └── ui/                   # Shared: Modal, Toast, Skeleton, Tooltip
│   │   ├── hooks/
│   │   │   ├── useStudySession.js
│   │   │   ├── useCards.js
│   │   │   └── useDashboard.js        ← NEW: dashboard data fetching
│   │   ├── services/
│   │   │   ├── api.js                 # Base fetch config + JWT header injection
│   │   │   ├── authService.js         ← NEW
│   │   │   ├── userService.js         ← NEW
│   │   │   ├── tagService.js          ← NEW
│   │   │   ├── categoryService.js
│   │   │   ├── deckService.js
│   │   │   ├── cardService.js
│   │   │   └── sessionService.js
│   │   ├── context/
│   │   │   ├── ThemeContext.jsx        # Updated: syncs with user.theme_preference
│   │   │   └── AuthContext.jsx        ← NEW: stores JWT + user info + role
│   │   ├── App.jsx                    # Router setup + protected route wrapper
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── server/                        # FastAPI backend
│   ├── routers/
│   │   ├── auth.py                ← NEW
│   │   ├── users.py               ← NEW
│   │   ├── tags.py                ← NEW
│   │   ├── categories.py
│   │   ├── decks.py
│   │   ├── cards.py
│   │   ├── sessions.py
│   │   └── search.py
│   ├── controllers/
│   │   ├── auth_controller.py     ← NEW
│   │   ├── user_controller.py     ← NEW
│   │   ├── tag_controller.py      ← NEW
│   │   ├── category_controller.py
│   │   ├── deck_controller.py
│   │   ├── card_controller.py
│   │   ├── session_controller.py
│   │   └── search_controller.py
│   ├── middleware/
│   │   ├── error_handler.py
│   │   └── auth.py                ← NEW: get_current_user dependency
│   ├── utils/
│   │   └── security.py            ← NEW: bcrypt helpers + JWT encode/decode
│   ├── db/
│   │   └── connection.py
│   ├── uploads/
│   │   └── covers/                ← deck cover images stored here
│   ├── main.py
│   └── requirements.txt
│
├── database/
│   ├── schema.sql                 # Full CREATE TABLE statements (A2 version)
│   └── seed.sql                   # Includes one seeded admin account
│
├── .env.example
├── .gitignore
├── README.md
└── CLAUDE.md                      # This file
```

---

## 8. Environment Variables

Create a `.env` file in `/server` based on `.env.example`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=cardie
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRE_MINUTES=1440
```

**Never hardcode credentials. Never commit `.env`.**

### Backend Dependencies (`server/requirements.txt`)
```
fastapi
uvicorn[standard]
mysql-connector-python
python-multipart
python-dotenv
python-jose[cryptography]
passlib[bcrypt]
```

### Running the App
```bash
# Backend
cd server
uvicorn main:app --reload
# http://localhost:8000 | Swagger docs: http://localhost:8000/docs

# Frontend
cd client
npm install
npm run dev
# http://localhost:5173
```

---

## 9. Study Session Queue Logic (unchanged from A1)

Lives entirely in `useStudySession.js`. No backend involvement mid-session.

```
sessionQueue = [...allCardsInDeck]  // optionally shuffled

onRate(card, rating):
  easy   → remove from queue; increment easyCount
  hard   → reinsert at currentIndex + 3; increment hardCount
  missed → reinsert at currentIndex + 1; increment missedCount
  advance to next card; update accuracy = easyCount / totalRated * 100

onSessionEnd:
  POST /api/sessions { deckId, easyCount, hardCount, missedCount, totalCards, accuracy }
  Backend: insert into study_sessions; increment ease/hard/missed counts on flashcards
```

---

## 10. UI/UX Design Direction

**Aesthetic:** Clean, modern, slightly playful — like a polished student productivity tool. Think Notion meets Anki.

**Color Palette (light mode):**
- Background: `#f8f9fa` | Surface: `#ffffff` | Primary: `#6366f1` | Accent: `#f59e0b`
- Text: `#1a1a2e` | Border: `#e2e8f0`

**Color Palette (dark mode):**
- Background: `#0f0f1a` | Surface: `#1a1a2e` | Primary: `#818cf8`
- Text: `#e2e8f0` | Border: `#2d2d44`

**Typography:** Headings: `Syne` or `DM Serif Display`. Body: `DM Sans` or `Plus Jakarta Sans`.

**Key Animations:** Card flip (rotateY), page fade-in, toast slide-in, modal scale-up, skeleton shimmer.

**Mobile:** Single column, bottom tab nav, study mode works on touch.

---

## 11. Code Quality Standards

- **Naming:** Python → snake_case; React/JS → camelCase (functions/vars), PascalCase (components); DB → snake_case
- **Comments:** Above any non-obvious logic (especially queue reordering, JWT middleware, bootstrap admin check)
- **Error handling:** All routes wrapped in try/catch; frontend toasts on API failure; no blank screen ever
- **Input validation:** Backend validates required fields before DB insert; frontend disables submit on empty required fields
- **No `console.log`** left in production code
- **Consistent async/await** — no mixing with `.then()` chains
- **No `SELECT *`** — specify columns explicitly in all queries
- **No Base64 images** in the database

---

## 12. Things to Avoid

- ❌ No cloud storage — python-multipart local uploads only
- ❌ No Redux — React Context + useState only
- ❌ No SQLAlchemy ORM — raw SQL only
- ❌ No multiple HTML files
- ❌ No hardcoded credentials or JWT secrets
- ❌ No `print()` statements in final Python code
- ❌ No full SM-2 spaced repetition algorithm — session-based queue only
- ❌ No TipTap paid/cloud extensions

---

## 13. Assignment Rubric Priorities (for Claude Code)

When making any design or implementation decision, prioritise in this order:

1. **Does it work correctly?** — CRUD + auth must be reliable
2. **Is auth secure?** — JWT, bcrypt, role checks on every protected endpoint
3. **Is the UX seamless?** — No unnecessary steps, good feedback, onboarding guidance
4. **Is the code clean?** — Naming, error handling, no dead code
5. **Does it look professional?** — Visual polish, responsiveness, dark mode
6. **Is it a true SPA?** — No full page reloads

---

*Last updated: A2 planning phase. App: Cardie. Stack: React + FastAPI + MySQL. Solo submission.*