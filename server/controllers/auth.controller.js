const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/auth');
const prisma = require('../utils/prisma');

/**
 * Register a new user
 */
async function register(req, res) {
  try {
    const { name, email, password, phoneNumber, address } = req.body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'user',
        profile: {
          create: {
            phoneNumber: phoneNumber || '',
            address: address || '',
          },
        },
      },
      include: { profile: true },
    });

    const token = generateToken({ id: Number(user.id), email: user.email, role: user.role });

    res.status(201).json({
      message: 'Registrasi berhasil.',
      token,
      user: {
        id: Number(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}

/**
 * Login user
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    const token = generateToken({ id: Number(user.id), email: user.email, role: user.role });

    res.json({
      message: 'Login berhasil.',
      token,
      user: {
        id: Number(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}

/**
 * Get current user info
 */
async function getMe(req, res) {
  try {
    res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        profile: req.user.profile,
      },
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}

module.exports = { register, login, getMe };
