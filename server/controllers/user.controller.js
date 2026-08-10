const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');

/**
 * Get all users (Admin)
 */
async function getAllUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
    });

    const serialized = users.map((u) => ({
      ...u,
      id: Number(u.id),
      profile: u.profile
        ? { ...u.profile, id: Number(u.profile.id), userId: Number(u.profile.userId) }
        : null,
    }));

    res.json({ users: serialized });
  } catch (error) {
    console.error('GetAllUsers error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}

/**
 * Get user by ID (Admin)
 */
async function getUserById(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: BigInt(req.params.id) },
      include: { profile: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    res.json({
      user: {
        ...user,
        id: Number(user.id),
        profile: user.profile
          ? { ...user.profile, id: Number(user.profile.id), userId: Number(user.profile.userId) }
          : null,
      },
    });
  } catch (error) {
    console.error('GetUserById error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}

/**
 * Update user (Admin)
 */
async function updateUser(req, res) {
  try {
    const { name, email, password, role } = req.body;
    const userId = BigInt(req.params.id);

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    // Check email uniqueness
    if (email && email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken) {
        return res.status(400).json({ message: 'Email sudah digunakan.' });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: { profile: true },
    });

    res.json({
      message: 'User berhasil diupdate.',
      user: {
        ...user,
        id: Number(user.id),
        profile: user.profile
          ? { ...user.profile, id: Number(user.profile.id), userId: Number(user.profile.userId) }
          : null,
      },
    });
  } catch (error) {
    console.error('UpdateUser error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}

/**
 * Delete user (Admin)
 */
async function deleteUser(req, res) {
  try {
    const userId = BigInt(req.params.id);
    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    await prisma.user.delete({ where: { id: userId } });
    res.json({ message: 'User berhasil dihapus.' });
  } catch (error) {
    console.error('DeleteUser error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}

/**
 * Get own profile (User)
 */
async function getProfile(req, res) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: BigInt(req.user.id) },
    });

    if (!profile) {
      return res.status(404).json({ message: 'Profil belum dibuat.' });
    }

    res.json({
      profile: {
        ...profile,
        id: Number(profile.id),
        userId: Number(profile.userId),
      },
    });
  } catch (error) {
    console.error('GetProfile error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}

/**
 * Update own profile (User)
 */
async function updateProfile(req, res) {
  try {
    const { phoneNumber, address, heightCm, weightKg, chestSizeCm, waistSizeCm, name } = req.body;
    const userId = BigInt(req.user.id);

    // Update user name if provided
    if (name) {
      await prisma.user.update({
        where: { id: userId },
        data: { name },
      });
    }

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        phoneNumber: phoneNumber || undefined,
        address: address || undefined,
        heightCm: heightCm ? parseInt(heightCm) : undefined,
        weightKg: weightKg ? parseInt(weightKg) : undefined,
        chestSizeCm: chestSizeCm ? parseInt(chestSizeCm) : undefined,
        waistSizeCm: waistSizeCm ? parseInt(waistSizeCm) : undefined,
      },
      create: {
        userId,
        phoneNumber: phoneNumber || '',
        address: address || '',
        heightCm: heightCm ? parseInt(heightCm) : null,
        weightKg: weightKg ? parseInt(weightKg) : null,
        chestSizeCm: chestSizeCm ? parseInt(chestSizeCm) : null,
        waistSizeCm: waistSizeCm ? parseInt(waistSizeCm) : null,
      },
    });

    res.json({
      message: 'Profil berhasil diupdate.',
      profile: {
        ...profile,
        id: Number(profile.id),
        userId: Number(profile.userId),
      },
    });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}

module.exports = { getAllUsers, getUserById, updateUser, deleteUser, getProfile, updateProfile };
