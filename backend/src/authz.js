function requireAdmin(req, res, next) {
  // In production, replace with authenticated session role.
  const role = req.user?.role || req.header('x-role');

  if (role !== 'ADMIN') {
    return res.status(403).json({ message: 'Only ADMIN can create workers.' });
  }

  return next();
}

module.exports = { requireAdmin };
