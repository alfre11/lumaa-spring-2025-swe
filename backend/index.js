import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;

dotenv.config({ path: './data.env' });
const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
console.log('Database URL:', process.env.DATABASE_URL);

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
console.log('Secret Key: ', process.env.JWT_SECRET);

// User registration
app.post('/auth/register', async (req, res) => {
    console.log("registering user");
  const { username, password } = req.body;
  console.log(username);
  console.log(password);
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(hashedPassword);

  try {
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);
    console.log("registered");
    res.status(201).send('User registered');
  } catch (err) {
    console.error("error with query:", err);
    res.status(500).send(err.message);
  }
});

// User login
app.post('/auth/login', async (req, res) => {
  console.log("logging in");
  const { username, password } = req.body;
  const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

  if (user.rows.length === 0) return res.status(404).json('User not found');

  const validPassword = await bcrypt.compare(password, user.rows[0].password);
  if (!validPassword) return res.status(401).send('Invalid password');

  const token = jwt.sign({ id: user.rows[0].id }, JWT_SECRET, { expiresIn: '1h' });
  console.log("token: ", token);
  res.json({ token });
});

// Middleware to verify token
const authenticate = (req, res, next) => {
  const authHead = req.headers['authorization'];
  if (!authHead || !authHead.startsWith('Bearer ')) return res.status(403).json('Token required');

  const token = authHead.split(' ')[1];

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json('Invalid token');
    req.userId = decoded.id;
    next();
  });
};

// Tasks endpoints
app.get('/tasks', authenticate, async (req, res) => {
    console.log("GET tasks");
  const tasks = await pool.query('SELECT * FROM tasks WHERE userId = $1', [req.userId]);
  res.json(tasks.rows);
});

// Create a task
app.post('/tasks', authenticate, async (req, res) => {
    console.log("POST tasks");
  const { title, description } = req.body;
  await pool.query('INSERT INTO tasks (title, description, userId) VALUES ($1, $2, $3)', [title, description, req.userId]);
  res.status(201).send('Task created');
});

// Update an existing task (Mark complete or edit)
app.put('/tasks/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { title, completed } = req.body; 
  
    try {
      const result = await pool.query(
        'UPDATE tasks SET title = $1, iscomplete = $2 WHERE id = $3 AND userId = $4 RETURNING *',
        [title, completed, id, req.userId]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Task not found or not authorized' });
      }
  
      res.json(result.rows[0]); 
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
// Delete a task
app.delete('/tasks/:id', authenticate, async (req, res) => {
  await pool.query('DELETE FROM tasks WHERE id = $1 AND userId = $2', [req.params.id, req.userId]);
  res.send('Task deleted');
});

app.listen(4000, () => {
  console.log('Backend running on http://localhost:4000');
});