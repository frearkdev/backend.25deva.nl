const pool = require('../config/db');

exports.createPost = async (req, res) => {
  try {
    const { title, content, avatar } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Titel en inhoud zijn verplicht.' });
    }

    const authorName = req.user.name;
    const studentnummer = req.user.studentnummer || null;

    await pool.query(
      'INSERT INTO posts (title, content, author_name, studentnummer, avatar) VALUES (?, ?, ?, ?, ?)',
      [title, content, authorName, studentnummer, avatar || null]
    );

    res.json({ message: 'Post aangemaakt.' });
  } catch (err) {
    console.error('Create post error', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM posts ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Get posts error', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Post niet gevonden.' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Get post error', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const id = req.params.id;

    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Post niet gevonden.' });
    }

    const post = rows[0];

    if (req.user.role !== 'admin' && req.user.studentnummer !== post.studentnummer) {
      return res.status(403).json({ error: 'Geen permissie om deze post te verwijderen.' });
    }

    await pool.query('DELETE FROM posts WHERE id = ?', [id]);
    res.json({ message: 'Post verwijderd.' });
  } catch (err) {
    console.error('Delete post error', err);
    res.status(500).json({ error: 'Server error.' });
  }
};
