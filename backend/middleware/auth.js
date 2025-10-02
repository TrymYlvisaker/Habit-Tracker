import jwt from 'jsonwebtoken'

// Middleware to authenticate JWT tokens from Authorization header
export function authenticateToken(req, res, next) {
  // Extract token from "Bearer <token>" format
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Token required' })

  // Verify token and attach user info to request
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' })
    req.user = user
    next()
  })
}