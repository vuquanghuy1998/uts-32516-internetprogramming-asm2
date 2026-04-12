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
- **Flashcard CRUD operations** — Add, edit, and delete flashcards. Each flashcard has a question, answer, and optional image upload for visual presentation of the knowledge
- **Interactive card-flip study mode** — Cards flip to reveal answers with a smooth animation. Users can rate each card as Easy, Hard, or Missed
- **Smart study queue** — Hard and Missed cards are automatically put back to the queue so they appear again in the same study session
- **Dashboard for each deck** — View study session history, accuracy percentage, and a summary of the top easy/hard cards for each deck.
- **Global search** — Search for a specific content/keyword across all cards and decks.
- **Dark mode toggle** — Persistent light/dark theme for the whole app.
- **Toast notifications** — Non-blocking response (success or fail) for all create, update, and delete actions.
- **Skeleton loading states** — Placeholder UI shown while data is fetching to avoid blank screens.
- **Duplicate deck** — Clone an entire deck and all its cards under a new name.
- **Keyboard shortcuts in study mode** - Users can hit `Space` to flip, `1` Missed / `2` Hard / `3` Easy to rate, `Escape` to end the current study session.
- **Responsive design** — Layout adapts for mobile and desktop viewports

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

For this assignment, the most challenging part is to organise React functions neatly and logically in accordance with the lecture's file structure requirements, since I am new to developing a full-stack app. The initial planning of the app functionality is also a difficulty given the time constraints. To mitigate this, I have referenced similar flashcards app on the market and create a thorough plan from the beginning so that I don't have to rewrite existing code when implementing a new function in the middle of the development phase.

There are certain features that prove to be challenging to manage. First, implementing the study session queue was the most difficult challenge, cards rated Hard or Missed needed to be re-inserted into the remaining queue at a natural position rather than the end, which required state management in the `useStudySession` hook to avoid infinite loops (for this feature, I required explanation and suggestion from the AI-coding agent Claude Code). Developing the backend, which includes synchronising the MySQL connection pool, is also considerably more challenging than developing the user interface. On the frontend, asynchronous data fetching on the frontend also required a solid understanding of React's useEffect dependencies and stale closure behaviour before the data flow became reliable - which I didn't have in advance. Finally, designing a service layer (`/services`) that separated API connections from component logic made the codebase significantly easier to debug and extend (this is a feature suggested to me by Claude Code - I did not know about it in advance).

To maintain academic integrity in this assignment, I would like to declare the use of Claude Code - the AI coding tool developed by Anthropic to overcome certain challenges as presented above.