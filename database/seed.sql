-- =============================================================
-- Cardie Demo Data — Seed File
-- Run AFTER schema.sql to populate the database with sample data.
-- =============================================================

USE cardie;

-- -------------------------------------------------------------
-- CATEGORY
-- -------------------------------------------------------------

INSERT INTO categories (id, name, color, description) VALUES
(1, 'Internet Programming', '#6366f1',
 'UTS 31748/32516 - Programming on the Internet. Covers React, Python/FastAPI, and MySQL as taught in Autumn 2026.');

-- -------------------------------------------------------------
-- DECKS
-- -------------------------------------------------------------

INSERT INTO decks (id, category_id, name, description) VALUES
(1, 1, 'Lecture 4 - Advanced React Hooks',
 'Covers the three core React Hooks: useState, useEffect, and useRef — including when to use each and how they interact.'),
(2, 1, 'Lecture 5 - Python & FastAPI Foundations',
 'Covers Python fundamentals (strings, lists, dicts, OOP, type hints, Pydantic) and building CRUD APIs with FastAPI.'),
(3, 1, 'Lecture 6 - Data Persistence with SQL',
 'Covers relational databases, MySQL, raw SQL queries with PyMySQL, and the SQLModel ORM for FastAPI.');

-- -------------------------------------------------------------
-- FLASHCARDS — Deck 1: Lecture 4 (React Hooks)
-- -------------------------------------------------------------

INSERT INTO flashcards (id, deck_id, question, answer, ease_count, hard_count, missed_count) VALUES

(1, 1,
 'What are React Hooks and what two rules must you always follow when using them?',
 'Hooks are functions that let you "hook into" React state and lifecycle features from functional components. The two rules are: (1) only call hooks at the top level of a component — never inside loops, conditions, or nested functions; (2) only call hooks from React functional components, not from regular JavaScript functions or class components.',
 3, 0, 0),

(2, 1,
 'What does the <code>useState</code> hook return, and how do you typically use it?',
 '<code>useState</code> takes an initial value and returns an array of two elements: the current state variable and a setter function to update it. You normally use array destructuring to capture both: <code>const [count, setCount] = useState(0)</code>. Calling the setter triggers a re-render with the new value.',
 2, 1, 0),

(3, 1,
 'Why must you never directly mutate a state object? What should you do instead?',
 'State objects in React are <strong>immutable</strong>. Directly mutating a property (e.g. <code>obj.key = value</code>) does not trigger a re-render. Instead, create a brand-new object that includes the updated value — commonly done with the spread operator: <code>setState(prev => ({ ...prev, key: newValue }))</code>.',
 2, 2, 1),

(4, 1,
 'How do you safely update a nested object stored in state?',
 'Because the spread operator creates a <em>shallow copy</em>, a single spread will still share a reference to any nested object. You must spread at every level of nesting: <code>setState(prev => ({ ...prev, nested: { ...prev.nested, field: newValue } }))</code>. This ensures a completely new object tree is created.',
 1, 2, 1),

(5, 1,
 'What is the purpose of the <code>useEffect</code> hook and what two parameters does it accept?',
 '<code>useEffect</code> handles <strong>side effects</strong> — operations that reach outside the component\'s render process (e.g., data fetching, DOM manipulation, timers, subscriptions). It accepts: (1) a <em>setup function</em> containing the side-effect logic, which can optionally return a cleanup function; and (2) a <em>dependency array</em> — React skips re-running the effect unless one of those values changes.',
 3, 0, 0),

(6, 1,
 'What happens when you pass an empty array <code>[]</code> as the dependency array to <code>useEffect</code>?',
 'An empty dependency array means the effect runs <strong>only once</strong>, immediately after the component first mounts. It will not re-run on subsequent renders. This is the correct pattern for one-time setup such as fetching initial data from an API.',
 3, 1, 0),

(7, 1,
 'Describe the three-step flow when <code>useEffect</code> is used to fetch data from an API.',
 '(1) After the component renders its initial state and the browser paints the screen, the <code>useEffect</code> callback fires and initiates the fetch. (2) When the response arrives, the state-setter function (e.g. <code>setData(data)</code>) is called with the new data. (3) Calling the setter triggers a re-render, and the component displays the fetched data.',
 2, 1, 0),

(8, 1,
 'What is a cleanup function in <code>useEffect</code>, and give an example of when you need one?',
 'A cleanup function is an optional function <em>returned</em> from the effect callback. React calls it before the component unmounts and before re-running the effect. A classic example is a timer: <code>return () => clearTimeout(timer)</code>. Without cleanup the timer would continue running after the component is removed from the DOM, causing memory leaks.',
 1, 2, 2),

(9, 1,
 'What does <code>useRef</code> return, and how does it differ from <code>useState</code> in terms of re-rendering?',
 '<code>useRef</code> returns a mutable object with a single <code>current</code> property. Like state, its value persists across renders. Unlike <code>useState</code>, <strong>changing <code>ref.current</code> does NOT trigger a re-render</strong>. This makes it ideal for storing values you want to track silently (e.g. previous state, timer IDs) or for holding a direct reference to a DOM element.',
 2, 1, 1),

(10, 1,
 'How do you attach a <code>useRef</code> object to a DOM element, and what does that enable?',
 'Create the ref with <code>const inputRef = useRef()</code>, then pass it to a JSX element via the <code>ref</code> attribute: <code>&lt;input ref={inputRef} /&gt;</code>. After render, <code>inputRef.current</code> points to the actual DOM node, enabling imperative operations like <code>inputRef.current.focus()</code>.',
 3, 0, 0),

(11, 1,
 'Why might you combine <code>useRef</code> and <code>useState</code> together in a form input component?',
 'Using only <code>useState</code> causes a re-render on every keystroke. Using only <code>useRef</code> captures the value but the display never updates. Combining them lets you read the raw DOM value via the ref (no re-render while typing) and only call the state setter on submit, so the component re-renders just once — when the final value needs to be displayed.',
 2, 2, 0),

(12, 1,
 'How can you combine <code>useRef</code> and <code>useEffect</code> to track the <em>previous</em> value of a state variable?',
 'Store the old value in a ref and update it inside a <code>useEffect</code> that depends on the state variable. During render, <code>ref.current</code> still holds the previous value. After the effect fires, the ref is updated to the current value, ready for the next render cycle.',
 1, 2, 1);

-- -------------------------------------------------------------
-- FLASHCARDS — Deck 2: Lecture 5 (Python & FastAPI)
-- -------------------------------------------------------------

INSERT INTO flashcards (id, deck_id, question, answer, ease_count, hard_count, missed_count) VALUES

(13, 2,
 'What is an f-string in Python and how do you write one?',
 'An f-string (formatted string literal) lets you embed variables and expressions directly inside a string. Prefix the string with <code>f</code> and wrap any expression in curly braces: <code>f"Hi {name}!"</code>. Python evaluates the expression and substitutes its value into the string at runtime.',
 3, 0, 0),

(14, 2,
 'How does Python\'s <code>try / except / else / finally</code> error-handling structure work?',
 'The <code>try</code> block holds code that may raise an exception. One or more <code>except</code> clauses catch specific exception types and handle them. The optional <code>else</code> block runs only if <em>no</em> exception was raised. The optional <code>finally</code> block always runs — used to clean up resources such as closing files or database connections.',
 2, 1, 0),

(15, 2,
 'What does Python\'s <code>map()</code> function do, and what does it return?',
 '<code>map(func, iterable)</code> applies <code>func</code> to every item in the iterable and returns a <em>map object</em> (a lazy iterator). Wrap it in <code>list()</code> to get a concrete list. It is a memory-efficient, loop-free way to transform every element in a sequence.',
 2, 2, 1),

(16, 2,
 'What does Python\'s <code>filter()</code> function do?',
 '<code>filter(func, iterable)</code> returns an iterator containing only the elements for which <code>func</code> returns <code>True</code>. Like <code>map()</code>, it is lazy — wrap it in <code>list()</code> to materialise the results. You can pass any iterable as the second argument, not just lists.',
 3, 1, 0),

(17, 2,
 'What are Python type hints, and are they enforced at runtime?',
 'Type hints are annotations added to variables and function signatures to declare expected types (e.g. <code>age: int</code>, <code>def greet(name: str) -> str</code>). They are <strong>not enforced at runtime</strong> — Python remains dynamically typed. Their value is documentation, IDE autocompletion, and static analysis tools like <code>mypy</code>.',
 2, 1, 1),

(18, 2,
 'What is the difference between <code>list</code> (lowercase) and <code>List</code> (capitalised) from the <code>typing</code> module?',
 '<code>list</code> is the built-in Python type used to create and manipulate lists at runtime. <code>List</code> from <code>typing</code> is used exclusively for <strong>type hints</strong> — it does not exist as an object at runtime. In Python 3.9+ you can use <code>list[str]</code> directly in type hints, making <code>typing.List</code> largely obsolete.',
 1, 2, 1),

(19, 2,
 'What is Pydantic and how does it relate to FastAPI?',
 'Pydantic is a Python data validation library. You define a model class inheriting from <code>BaseModel</code> with typed fields. When you instantiate it, Pydantic validates and coerces the values. FastAPI uses Pydantic models to validate request bodies and serialise responses automatically.',
 3, 0, 0),

(20, 2,
 'How does FastAPI\'s <code>@app.post()</code> decorator work?',
 'It registers a new route that handles HTTP POST requests at the specified path (e.g. <code>/items/</code>). The optional <code>response_model</code> argument tells FastAPI what shape the response should have, enabling automatic validation and serialisation. The decorated function\'s parameters determine where data is extracted from (path, query string, or request body).',
 2, 1, 0),

(21, 2,
 'How do path parameters work in FastAPI?',
 'Declare the parameter in the path string with curly braces: <code>@app.get("/items/{item_id}")</code>. FastAPI extracts the value from the URL and passes it to the function as the same-named argument: <code>def read_item(item_id: int)</code>. The type hint is used for automatic coercion and validation.',
 3, 1, 0),

(22, 2,
 'What is <code>HTTPException</code> in FastAPI and when should you raise it?',
 '<code>HTTPException</code> sends an HTTP error response to the client. Raise it when a resource does not exist or a condition fails: <code>raise HTTPException(status_code=404, detail="Item not found")</code>. FastAPI converts it into a properly formatted JSON error response with the given status code.',
 2, 2, 1),

(23, 2,
 'What does the <code>self</code> parameter in a Python class method represent, and why must it come first?',
 '<code>self</code> is a reference to the current instance of the class. It allows a method to access and modify the instance\'s own attributes. Python requires it as the first parameter because when you call <code>obj.method()</code>, Python automatically passes <code>obj</code> as the first argument.',
 3, 0, 0),

(24, 2,
 'What does the <code>super()</code> function do in Python inheritance?',
 '<code>super()</code> returns a proxy object that delegates method calls to the parent class. In a child\'s <code>__init__</code> you call <code>super().__init__(...)</code> to run the parent\'s initialiser, ensuring the child inherits its parent\'s attributes without hard-coding the parent class name.',
 2, 1, 1);

-- -------------------------------------------------------------
-- FLASHCARDS — Deck 3: Lecture 6 (MySQL & SQL)
-- -------------------------------------------------------------

INSERT INTO flashcards (id, deck_id, question, answer, ease_count, hard_count, missed_count) VALUES

(25, 3,
 'What is the difference between a Database and a Database Management System (DBMS)?',
 'A <strong>database</strong> is an organised collection of structured data stored on a computer, designed for efficient storage and retrieval. A <strong>DBMS</strong> is the software layer that sits between users/applications and the raw data — it manages storage, retrieval, security, and manipulation. MySQL is a DBMS; the tables and rows you create are the database.',
 3, 0, 0),

(26, 3,
 'What makes MySQL different from other relational systems like PostgreSQL?',
 'MySQL prioritises <strong>performance and simplicity</strong> over strict adherence to all SQL standards, making it faster for common read-heavy workloads. PostgreSQL focuses on strict standards compliance and advanced features. MySQL is the most widely used open-source RDBMS and is ideal for web applications, e-commerce, and banking systems.',
 2, 1, 0),

(27, 3,
 'What are the four steps for using MySQL in Python with PyMySQL?',
 '(1) Establish a connection using <code>pymysql.connect(host, user, password, database)</code>. (2) Create a cursor with <code>connection.cursor()</code>. (3) Execute SQL using <code>cursor.execute(sql, params)</code>. (4) For SELECT use <code>fetchone()</code> or <code>fetchall()</code>; for INSERT/UPDATE/DELETE call <code>connection.commit()</code>. Close the connection when finished.',
 2, 2, 1),

(28, 3,
 'Why must you call <code>connection.commit()</code> after write operations in PyMySQL?',
 'PyMySQL does not auto-commit. Changes exist in a <strong>pending transaction</strong> until you call <code>connection.commit()</code>, which permanently saves them to the database. If an error occurs you can call <code>connection.rollback()</code> to undo all changes since the last commit, keeping the database consistent.',
 1, 2, 2),

(29, 3,
 'What is a parameterised SQL query and why should you always use one?',
 'A parameterised query passes user-supplied values as separate parameters rather than embedding them in the SQL string: <code>cursor.execute("SELECT * FROM users WHERE email = %s", (email,))</code>. The driver escapes the values safely, preventing <strong>SQL injection attacks</strong> where malicious input could alter the query\'s logic.',
 3, 0, 0),

(30, 3,
 'What is SQLModel and what two libraries is it built on top of?',
 'SQLModel is a Python ORM designed for FastAPI. It is built on <strong>SQLAlchemy</strong> (database operations and connection management) and <strong>Pydantic</strong> (data validation). A single class can serve as both a database table definition and a Pydantic validation model, reducing boilerplate.',
 2, 1, 0),

(31, 3,
 'What does <code>table=True</code> mean in a SQLModel class definition?',
 'Setting <code>table=True</code> tells SQLModel that the class represents an actual <strong>database table</strong>, not just a validation model. The class is registered in SQLModel\'s metadata so that <code>SQLModel.metadata.create_all(engine)</code> generates the corresponding <code>CREATE TABLE</code> statement.',
 3, 1, 0),

(32, 3,
 'What is a SQLModel Session and why do you create a new one per request?',
 'A Session wraps a database connection and groups all SQL operations into a single <strong>transaction</strong>. Creating one per request ensures changes are committed atomically — either everything succeeds or nothing does. The <code>with Session(engine) as session:</code> pattern automatically closes the session when the block exits.',
 2, 1, 1),

(33, 3,
 'How do you read a single row by primary key using SQLModel?',
 'Use <code>session.get(ModelClass, primary_key_value)</code>. This is equivalent to <code>SELECT * FROM table WHERE id = ?</code>. It returns the model instance if found, or <code>None</code> if no matching row exists.',
 3, 0, 0),

(34, 3,
 'How do you update a row using SQLModel?',
 'Fetch the existing object with <code>session.get()</code>, update its attributes (iterate over <code>updated_data.model_dump(exclude_unset=True).items()</code> and use <code>setattr(existing, key, value)</code>), then call <code>session.add(existing_object)</code> and <code>session.commit()</code>. Call <code>session.refresh(existing_object)</code> to reload the updated values from the database.',
 1, 2, 1),

(35, 3,
 'How do you delete a row using SQLModel?',
 'Fetch the object, then call <code>session.delete(object)</code> followed by <code>session.commit()</code>. Note that <code>.commit()</code> saves <em>everything</em> pending in the session — any other adds or updates in the same session are also committed at this point.',
 2, 1, 0),

(36, 3,
 'What does the <code>echo=True</code> parameter do when creating a SQLModel engine?',
 'It configures the engine to <strong>print every SQL statement</strong> it generates to the terminal. This is useful during development for debugging queries and understanding exactly what SQL your ORM calls are producing. Set it to <code>False</code> in production to keep logs clean.',
 3, 0, 0);

-- -------------------------------------------------------------
-- STUDY SESSIONS
-- -------------------------------------------------------------

INSERT INTO study_sessions (id, deck_id, easy_count, hard_count, missed_count, total_cards, accuracy_percent) VALUES
(1, 1,  7, 3, 2, 12, 58.33),
(2, 1,  9, 2, 1, 12, 75.00),
(3, 2,  6, 4, 2, 12, 50.00),
(4, 2, 10, 1, 1, 12, 83.33),
(5, 3,  5, 4, 3, 12, 41.67),
(6, 3,  8, 3, 1, 12, 66.67);