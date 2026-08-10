const { verifyToken } = require('../config/auth');
const prisma = require('../utils/prisma');

/**
 * Middleware: Verify JWT token and attach user to request
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: BigInt(decoded.id) },
      include: { profile: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'User tidak ditemukan.' });
    }

    // Convert BigInt to string for JSON serialization
    req.user = {
      ...user,
      id: Number(user.id),
      profile: user.profile
        ? { ...user.profile, id: Number(user.profile.id), userId: Number(user.profile.userId) }
        : null,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token tidak valid atau sudah expired.' });
  }
}

/**
 * Middleware: Role-based authorization
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Akses ditolak.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Anda tidak memiliki izin untuk mengakses resource ini.' });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
