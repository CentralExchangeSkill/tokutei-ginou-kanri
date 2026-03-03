import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { signToken } from './auth.js';
import { requireAuth, requireRole } from './middleware.js';
import { findUserByEmail, listUsers, seedUsers, Roles } from './users.js';

dotenv.config();

const app = express();
const port = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (_, res) => {
  res.json({ ok: true });
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signToken(user);
  return res.json({ token, user: user.toSafeJSON() });
});

app.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

app.get('/admin/users', requireAuth, requireRole(Roles.ADMIN), (_, res) => {
  res.json({ users: listUsers() });
});

seedUsers().then(() => {
  app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
  });
});
