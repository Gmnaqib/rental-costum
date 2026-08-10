const prisma = require('../utils/prisma');
const { calculateFittingScore } = require('../services/fitting.service');

/**
 * Get all units (with search)
 */
async function getAllUnits(req, res) {
  try {
    const { search, size, status } = req.query;

    const where = {};
    if (search) {
      where.name = { contains: search };
    }
    if (size) {
      where.sizeCategory = size;
    }
    if (status) {
      where.status = status;
    }

    const units = await prisma.unit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Calculate fitting score if user is authenticated and has profile
    const serializedUnits = units.map((unit) => {
      const serialized = {
        ...unit,
        id: Number(unit.id),
      };

      if (req.user && req.user.profile) {
        const fitting = calculateFittingScore(req.user.profile, unit);
        serialized.fittingScore = fitting;
      }

      return serialized;
    });

    res.json({ units: serializedUnits });
  } catch (error) {
    console.error('GetAllUnits error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}

/**
 * Get unit by ID with fitting score
 */
async function getUnitById(req, res) {
  try {
    const unit = await prisma.unit.findUnique({
      where: { id: BigInt(req.params.id) },
    });

    if (!unit) {
      return res.status(404).json({ message: 'Unit tidak ditemukan.' });
    }

    const serialized = { ...unit, id: Number(unit.id) };

    if (req.user && req.user.profile) {
      serialized.fittingScore = calculateFittingScore(req.user.profile, unit);
    }

    res.json({ unit: serialized });
  } catch (error) {
    console.error('GetUnitById error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}

/**
 * Create unit (Admin)
 */
async function createUnit(req, res) {
  try {
    const { code, name, sizeCategory, recommendedHeightMin, recommendedHeightMax, description } = req.body;

    // Check code uniqueness
    const existingUnit = await prisma.unit.findUnique({ where: { code } });
    if (existingUnit) {
      return res.status(400).json({ message: 'Kode unit sudah digunakan.' });
    }

    const unit = await prisma.unit.create({
      data: {
        code,
        name,
        sizeCategory: sizeCategory || 'M',
        recommendedHeightMin: recommendedHeightMin ? parseInt(recommendedHeightMin) : null,
        recommendedHeightMax: recommendedHeightMax ? parseInt(recommendedHeightMax) : null,
        description: description || null,
      },
    });

    res.status(201).json({
      message: 'Unit berhasil ditambahkan.',
      unit: { ...unit, id: Number(unit.id) },
    });
  } catch (error) {
    console.error('CreateUnit error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}

/**
 * Update unit (Admin)
 */
async function updateUnit(req, res) {
  try {
    const unitId = BigInt(req.params.id);
    const { code, name, sizeCategory, recommendedHeightMin, recommendedHeightMax, description, status } = req.body;

    const existing = await prisma.unit.findUnique({ where: { id: unitId } });
    if (!existing) {
      return res.status(404).json({ message: 'Unit tidak ditemukan.' });
    }

    // Check code uniqueness if changed
    if (code && code !== existing.code) {
      const codeTaken = await prisma.unit.findUnique({ where: { code } });
      if (codeTaken) {
        return res.status(400).json({ message: 'Kode unit sudah digunakan.' });
      }
    }

    const unit = await prisma.unit.update({
      where: { id: unitId },
      data: {
        code: code || undefined,
        name: name || undefined,
        sizeCategory: sizeCategory || undefined,
        recommendedHeightMin: recommendedHeightMin !== undefined ? parseInt(recommendedHeightMin) : undefined,
        recommendedHeightMax: recommendedHeightMax !== undefined ? parseInt(recommendedHeightMax) : undefined,
        description: description !== undefined ? description : undefined,
        status: status || undefined,
      },
    });

    res.json({
      message: 'Unit berhasil diupdate.',
      unit: { ...unit, id: Number(unit.id) },
    });
  } catch (error) {
    console.error('UpdateUnit error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}

/**
 * Delete unit (Admin)
 */
async function deleteUnit(req, res) {
  try {
    const unitId = BigInt(req.params.id);
    const existing = await prisma.unit.findUnique({ where: { id: unitId } });
    if (!existing) {
      return res.status(404).json({ message: 'Unit tidak ditemukan.' });
    }

    // Check for active borrowings
    const activeBorrowing = await prisma.borrowing.findFirst({
      where: {
        unitId,
        status: { in: ['booked', 'borrowed'] },
      },
    });

    if (activeBorrowing) {
      return res.status(400).json({ message: 'Unit masih dalam status dipinjam/dibook. Tidak bisa dihapus.' });
    }

    await prisma.unit.delete({ where: { id: unitId } });
    res.json({ message: 'Unit berhasil dihapus.' });
  } catch (error) {
    console.error('DeleteUnit error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}

/**
 * Get unit availability calendar
 */
async function getUnitAvailability(req, res) {
  try {
    const unitId = BigInt(req.params.id);

    const unit = await prisma.unit.findUnique({ where: { id: unitId } });
    if (!unit) {
      return res.status(404).json({ message: 'Unit tidak ditemukan.' });
    }

    // Get all active bookings for this unit
    const bookings = await prisma.borrowing.findMany({
      where: {
        unitId,
        status: { in: ['booked', 'borrowed'] },
      },
      select: {
        id: true,
        borrowDate: true,
        dueDate: true,
        status: true,
      },
      orderBy: { borrowDate: 'asc' },
    });

    // Generate booked date ranges
    const bookedDates = [];
    bookings.forEach((booking) => {
      const start = new Date(booking.borrowDate);
      const end = new Date(booking.dueDate);
      const current = new Date(start);

      while (current <= end) {
        bookedDates.push({
          date: current.toISOString().split('T')[0],
          status: booking.status,
          borrowingId: Number(booking.id),
        });
        current.setDate(current.getDate() + 1);
      }
    });

    res.json({
      unitId: Number(unitId),
      unitCode: unit.code,
      bookedDates,
    });
  } catch (error) {
    console.error('GetUnitAvailability error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}

module.exports = { getAllUnits, getUnitById, createUnit, updateUnit, deleteUnit, getUnitAvailability };
