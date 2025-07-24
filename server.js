const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const db = new sqlite3.Database('./notes.db');

db.run(`CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT (datetime('now','localtime'))
)`);

// Tüm notları getir
app.get('/notes', (req, res) => {
  db.all('SELECT * FROM notes ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Yeni not ekle
app.post('/notes', (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Not boş olamaz' });
  db.run('INSERT INTO notes(content) VALUES(?)', [content], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, content, created_at: new Date() });
  });
});

// Notu güncelle
app.put('/notes/:id', (req, res) => {
  const id = req.params.id;
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'İçerik zorunlu' });
  db.run('UPDATE notes SET content=? WHERE id=?', [content, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: this.changes });
  });
});

// Notu sil
app.delete('/notes/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM notes WHERE id=?', id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
});
