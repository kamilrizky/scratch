const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const lessons = require('./lessons');

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'ganti-ini-sebelum-deploy';
const DB_FILE = path.join(__dirname, 'db.json');

/* ---------- "Database" sederhana: satu file JSON ---------- */
function loadDb() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return { nextId: 1, users: [], projects: [], progress: [], cloud: {} };
  }
}
const db = loadDb();
function saveDb() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}
const newId = () => db.nextId++;

/* ---------- App & middleware ---------- */
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // project Scratch bisa cukup besar
app.use(express.static(path.join(__dirname, 'public')));

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token diperlukan' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token tidak valid atau kedaluwarsa' });
  }
}

/* ---------- Auth ---------- */
app.post('/api/register', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username dan password wajib' });
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username))
    return res.status(400).json({ error: 'username 3-20 karakter: huruf, angka, underscore' });
  if (password.length < 6) return res.status(400).json({ error: 'password minimal 6 karakter' });
  if (db.users.some((u) => u.username.toLowerCase() === username.toLowerCase()))
    return res.status(409).json({ error: 'username sudah dipakai' });

  const user = {
    id: newId(),
    username,
    passwordHash: bcrypt.hashSync(password, 10),
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  saveDb();
  res.status(201).json({ id: user.id, username });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  const user = db.users.find((u) => u.username.toLowerCase() === String(username).toLowerCase());
  if (!user || !bcrypt.compareSync(String(password), user.passwordHash))
    return res.status(401).json({ error: 'username atau password salah' });
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, username: user.username } });
});

/* ---------- Project (simpan/muat project Scratch) ---------- */
// `data` = isi project.json dari Scratch (atau JSON apa pun)
app.get('/api/projects', auth, (req, res) => {
  const list = db.projects
    .filter((p) => p.ownerId === req.user.id)
    .map(({ data, ...meta }) => meta); // daftar tanpa isi supaya ringan
  res.json(list);
});

app.post('/api/projects', auth, (req, res) => {
  const { title, data } = req.body || {};
  if (!title || data === undefined) return res.status(400).json({ error: 'title dan data wajib' });
  const now = new Date().toISOString();
  const project = { id: newId(), ownerId: req.user.id, title, data, createdAt: now, updatedAt: now };
  db.projects.push(project);
  saveDb();
  res.status(201).json({ id: project.id, title });
});

function findOwnProject(req, res) {
  const project = db.projects.find((p) => p.id === Number(req.params.id) && p.ownerId === req.user.id);
  if (!project) res.status(404).json({ error: 'Project tidak ditemukan' });
  return project;
}

app.get('/api/projects/:id', auth, (req, res) => {
  const project = findOwnProject(req, res);
  if (project) res.json(project);
});

app.put('/api/projects/:id', auth, (req, res) => {
  const project = findOwnProject(req, res);
  if (!project) return;
  if (req.body.title) project.title = req.body.title;
  if (req.body.data !== undefined) project.data = req.body.data;
  if (req.body.shared !== undefined) project.shared = !!req.body.shared;
  project.updatedAt = new Date().toISOString();
  saveDb();
  res.json({ id: project.id, title: project.title, updatedAt: project.updatedAt });
});

app.delete('/api/projects/:id', auth, (req, res) => {
  const project = findOwnProject(req, res);
  if (!project) return;
  db.projects = db.projects.filter((p) => p.id !== project.id);
  saveDb();
  res.status(204).end();
});

// Project yang dibagikan bisa dibuka siapa saja (tanpa login), hanya dibaca
app.get('/api/share/:id', (req, res) => {
  const p = db.projects.find((x) => x.id === Number(req.params.id) && x.shared);
  if (!p) return res.status(404).json({ error: 'Project tidak ditemukan atau tidak dibagikan' });
  res.json({ id: p.id, title: p.title, data: p.data });
});

/* ---------- Pelajaran & progres ---------- */
app.get('/api/lessons', (req, res) => {
  res.json(lessons.map(({ id, title, level, summary }) => ({ id, title, level, summary })));
});

app.get('/api/lessons/:id', (req, res) => {
  const lesson = lessons.find((l) => l.id === Number(req.params.id));
  if (!lesson) return res.status(404).json({ error: 'Pelajaran tidak ditemukan' });
  res.json(lesson);
});

app.post('/api/lessons/:id/complete', auth, (req, res) => {
  const lessonId = Number(req.params.id);
  if (!lessons.some((l) => l.id === lessonId))
    return res.status(404).json({ error: 'Pelajaran tidak ditemukan' });
  const already = db.progress.some((p) => p.userId === req.user.id && p.lessonId === lessonId);
  if (!already) {
    db.progress.push({ userId: req.user.id, lessonId, completedAt: new Date().toISOString() });
    saveDb();
  }
  res.json({ lessonId, completed: true });
});

app.get('/api/progress', auth, (req, res) => {
  const done = db.progress.filter((p) => p.userId === req.user.id).map((p) => p.lessonId);
  res.json({
    completed: done,
    total: lessons.length,
    percent: Math.round((done.length / lessons.length) * 100),
  });
});

/* ---------- Cloud variable (tanpa login, dipakai extension Scratch) ---------- */
// room = nama bebas, misalnya kode kelas. Cocok untuk skor tertinggi, chat sederhana, dll.
const SAFE = /^[a-zA-Z0-9_-]{1,40}$/;

app.get('/api/cloud/:room/:name', (req, res) => {
  const { room, name } = req.params;
  if (!SAFE.test(room) || !SAFE.test(name)) return res.status(400).json({ error: 'nama tidak valid' });
  const value = db.cloud[room]?.[name] ?? '';
  res.json({ room, name, value });
});

app.put('/api/cloud/:room/:name', (req, res) => {
  const { room, name } = req.params;
  if (!SAFE.test(room) || !SAFE.test(name)) return res.status(400).json({ error: 'nama tidak valid' });
  const value = String(req.body?.value ?? '').slice(0, 1000);
  db.cloud[room] = db.cloud[room] || {};
  db.cloud[room][name] = value;
  saveDb();
  res.json({ room, name, value });
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Server jalan di http://localhost:${PORT}`));
