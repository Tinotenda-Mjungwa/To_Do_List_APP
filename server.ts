import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import { Stack, PriorityQueue, MinHeap, InvertedIndex } from './src/lib/data-structures.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'taskflow-secret-key';
const db = new Database('taskflow.db');

// --- Database Initialization ---
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    color TEXT
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    description TEXT,
    due_date TEXT,
    priority TEXT,
    status TEXT,
    category_id INTEGER,
    recurring TEXT DEFAULT 'none',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(category_id) REFERENCES categories(id)
  );
`);

// Seed categories if empty
const categoryCount = db.prepare('SELECT count(*) as count FROM categories').get() as { count: number };
if (categoryCount.count === 0) {
  const insertCategory = db.prepare('INSERT INTO categories (name, color) VALUES (?, ?)');
  ['Work', 'Personal', 'Shopping', 'Health', 'Education'].forEach(cat => {
    insertCategory.run(cat, '#' + Math.floor(Math.random()*16777215).toString(16));
  });
}

// --- In-Memory Cache & Data Structures ---
// In a real production app, these would be per-user or handled by a more robust caching layer.
// For this demonstration, we'll use them to optimize specific operations.
const taskCache = new Map<number, any>(); // taskId -> Task (HashMap)
const searchIndex = new InvertedIndex<number>(); // Keyword -> Set of Task IDs
const undoStacks = new Map<number, Stack<any>>(); // userId -> Stack of operations

async function startServer() {
  const app = express();
  app.use(express.json());

  // --- Auth Middleware ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // --- Auth Routes ---
  app.post('/api/auth/register', (req, res) => {
    const { email, password, name } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    try {
      const info = db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)').run(email, hashedPassword, name);
      const token = jwt.sign({ id: info.lastInsertRowid, email, name }, JWT_SECRET);
      res.json({ token, user: { id: info.lastInsertRowid, email, name } });
    } catch (e) {
      res.status(400).json({ error: 'Email already exists' });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  });

  // --- Task Routes ---
  app.get('/api/tasks', authenticateToken, (req: any, res) => {
    const tasks = db.prepare(`
      SELECT t.*, c.name as category_name, c.color as category_color 
      FROM tasks t 
      LEFT JOIN categories c ON t.category_id = c.id 
      WHERE t.user_id = ?
      ORDER BY t.created_at DESC
    `).all(req.user.id) as any[];

    // Demonstrate Priority Queue usage: Sort by priority for the "Top Priority" view
    const pq = new PriorityQueue<any>();
    const priorityMap: any = { 'high': 3, 'medium': 2, 'low': 1 };
    tasks.forEach(t => pq.push(t, priorityMap[t.priority.toLowerCase()] || 0));

    const sortedByPriority = [];
    while (!pq.isEmpty()) sortedByPriority.push(pq.pop());

    // Demonstrate Min Heap usage: Sort by due date
    const minHeap = new MinHeap<any>();
    tasks.forEach(t => {
      if (t.due_date) minHeap.push(t, new Date(t.due_date).getTime());
    });

    const sortedByDueDate = [];
    while (!minHeap.isEmpty()) sortedByDueDate.push(minHeap.pop());

    // Update search index for this user's tasks
    searchIndex.clear();
    tasks.forEach(t => {
      searchIndex.add(t.title + ' ' + (t.description || ''), t.id);
      taskCache.set(t.id, t); // Update HashMap cache
    });

    res.json({ tasks, sortedByPriority, sortedByDueDate });
  });

  app.post('/api/tasks', authenticateToken, (req: any, res) => {
    const { title, description, due_date, priority, status, category_id, recurring } = req.body;
    const info = db.prepare(`
      INSERT INTO tasks (user_id, title, description, due_date, priority, status, category_id, recurring)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, title, description, due_date, priority, status, category_id, recurring || 'none');
    
    const newTask = { id: info.lastInsertRowid, ...req.body, user_id: req.user.id };
    
    // Undo Stack implementation
    if (!undoStacks.has(req.user.id)) undoStacks.set(req.user.id, new Stack());
    undoStacks.get(req.user.id)!.push({ type: 'create', data: newTask });

    res.json(newTask);
  });

  app.put('/api/tasks/:id', authenticateToken, (req: any, res) => {
    const { title, description, due_date, priority, status, category_id, recurring } = req.body;
    const oldTask = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id) as any;
    
    db.prepare(`
      UPDATE tasks SET title = ?, description = ?, due_date = ?, priority = ?, status = ?, category_id = ?, recurring = ?
      WHERE id = ? AND user_id = ?
    `).run(title, description, due_date, priority, status, category_id, recurring || 'none', req.params.id, req.user.id);

    // Handle recurring tasks: if status changed to 'completed' and it's recurring
    if (status === 'completed' && oldTask.status !== 'completed' && recurring && recurring !== 'none') {
      const nextDueDate = calculateNextDueDate(due_date, recurring);
      if (nextDueDate) {
        db.prepare(`
          INSERT INTO tasks (user_id, title, description, due_date, priority, status, category_id, recurring)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(req.user.id, title, description, nextDueDate, priority, 'pending', category_id, recurring);
      }
    }

    // Undo Stack
    if (!undoStacks.has(req.user.id)) undoStacks.set(req.user.id, new Stack());
    undoStacks.get(req.user.id)!.push({ type: 'update', oldData: oldTask, newData: req.body });

    res.json({ id: req.params.id, ...req.body });
  });

  function calculateNextDueDate(currentDateStr: string, recurring: string): string | null {
    if (!currentDateStr) return null;
    const date = new Date(currentDateStr);
    if (isNaN(date.getTime())) return null;

    switch (recurring) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      default:
        return null;
    }
    return date.toISOString().split('T')[0];
  }

  app.delete('/api/tasks/:id', authenticateToken, (req: any, res) => {
    const oldTask = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id) as any;
    db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);

    // Undo Stack
    if (!undoStacks.has(req.user.id)) undoStacks.set(req.user.id, new Stack());
    undoStacks.get(req.user.id)!.push({ type: 'delete', data: oldTask });

    res.sendStatus(204);
  });

  app.post('/api/tasks/undo', authenticateToken, (req: any, res) => {
    const stack = undoStacks.get(req.user.id);
    if (!stack || stack.isEmpty()) return res.status(400).json({ error: 'Nothing to undo' });

    const op = stack.pop();
    if (op.type === 'create') {
      db.prepare('DELETE FROM tasks WHERE id = ?').run(op.data.id);
    } else if (op.type === 'update') {
      const { title, description, due_date, priority, status, category_id } = op.oldData;
      db.prepare(`
        UPDATE tasks SET title = ?, description = ?, due_date = ?, priority = ?, status = ?, category_id = ?
        WHERE id = ?
      `).run(title, description, due_date, priority, status, category_id, op.oldData.id);
    } else if (op.type === 'delete') {
      const { user_id, title, description, due_date, priority, status, category_id } = op.data;
      db.prepare(`
        INSERT INTO tasks (user_id, title, description, due_date, priority, status, category_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(user_id, title, description, due_date, priority, status, category_id);
    }

    res.json({ message: 'Undo successful' });
  });

  app.get('/api/categories', (req, res) => {
    const categories = db.prepare('SELECT * FROM categories').all();
    res.json(categories);
  });

  // --- Search Endpoint (Demonstrating Inverted Index) ---
  app.get('/api/search', authenticateToken, (req: any, res) => {
    const query = req.query.q as string;
    if (!query) return res.json([]);

    const matchIds = searchIndex.search(query);
    const results = matchIds.map(id => taskCache.get(id)).filter(Boolean);
    res.json(results);
  });

  // --- Analytics Endpoint ---
  app.get('/api/analytics', authenticateToken, (req: any, res) => {
    const stats = db.prepare(`
      SELECT 
        status, 
        COUNT(*) as count 
      FROM tasks 
      WHERE user_id = ? 
      GROUP BY status
    `).all(req.user.id) as any[];

    const priorityStats = db.prepare(`
      SELECT 
        priority, 
        COUNT(*) as count 
      FROM tasks 
      WHERE user_id = ? 
      GROUP BY priority
    `).all(req.user.id) as any[];

    res.json({ stats, priorityStats });
  });

  // --- Vite Integration ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on http://localhost:3000');
  });
}

startServer();
