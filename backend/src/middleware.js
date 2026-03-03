import { verifyToken } from './auth.js';
import { findUserById } from './users.js';

function readBearerToken(req) {
  const authHeader = req.headers.authorization ?? '';
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.slice('Bearer '.length).trim();
}

export function requireAuth(req, res, next) {
  const token = readBearerToken(req);

  if (!token) {
    return res.status(401).json({ message: 'Missing authentication token' });
  }

  try {
    const payload = verifyToken(token);
    const user = findUserById(Number(payload.sub));

    if (!user) {
      return res.status(401).json({ message: 'Invalid authentication token' });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireRole(...roles) {
  return function roleMiddleware(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return next();
  };
}
