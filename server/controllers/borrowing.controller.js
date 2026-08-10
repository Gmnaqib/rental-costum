const prisma = require('../utils/prisma');
const { calculateFine } = require('../services/fine.service');

/**
 * Create borrowing / pre-booking (User)
 */
async function createBorrowing(req, res) {
  try {
    const { unitId, eventId, borrowDate, dueDate } = req.body;
    const userId = BigInt(req.user.id);

    // Validate dates
    const borrow = new Date(borrowDate);
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (borrow < today) {
      return res.status(400).json({ message: 'Tanggal peminjaman tidak boleh di masa lalu.' });
    }

    // Max 5 days duration
    const diffDays = Math.ceil((due - borrow) / (1000 * 60 * 60 * 24));
    if (diffDays > 5) {
      return res.status(400).json({ message: 'Maksimal durasi peminjaman adalah 5 hari.' });
    }
    if (diffDays < 1) {
      return res.status(400).json({ message: 'Durasi peminjaman minimal 1 hari.' });
    }

    // Max 2 active borrowings per user
    const activeCount = await prisma.borrowing.count({
      where: {
        userId,
        status: { in: ['booked', 'borrowed'] },
      },
    });

    if (activeCount >= 2) {
      return res.status(400).json({ message: 'Anda sudah memiliki 2 unit aktif. Maksimal pinjam 2 unit.' });
    }

    // Check unit exists and is valid
    const unit = await prisma.unit.findUnique({ where: { id: BigInt(unitId) } });
    if (!unit) {
      return res.status(404).json({ message: 'Unit tidak ditemukan.' });
    }

    // Check for date conflicts (overlap check)
    const conflict = await prisma.borrowing.findFirst({
      where: {
        unitId: BigInt(unitId),
        status: { in: ['booked', 'borrowed'] },
        AND: [
          { borrowDate: { lte: due } },
          { dueDate: { gte: borrow } },
        ],
      },
    });

    if (conflict) {
      return res.status(400).json({ message: 'Unit sudah dibooking pada tanggal tersebut.' });
    }

    // Check event if provided
    if (eventId) {
      const event = await prisma.event.findUnique({ where: { id: BigInt(eventId) } });
      if (!event) {
        return res.status(404).json({ message: 'Event tidak ditemukan.' });
      }
    }

    // Determine status: if borrow_date is today → borrowed, else → booked (pre-booking)
    const isToday = borrow.getTime() === today.getTime();
    const status = isToday ? 'borrowed' : 'booked';

    const borrowing = await prisma.borrowing.create({
      data: {
        userId,
        unitId: BigInt(unitId),
        eventId: eventId ? BigInt(eventId) : null,
        borrowDate: borrow,
        dueDate: due,
        status,
      },
      include: {
        unit: true,
        event: true,
      },
    });

    // Update unit status if borrowed today
    if (isToday) {
      await prisma.unit.update({
        where: { id: BigInt(unitId) },
        data: { status: 'borrowed' },
      });
    }

    res.status(201).json({
      message: status === 'booked' ? 'Pre-booking berhasil.' : 'Peminjaman berhasil.',
      borrowing: {
        ...borrowing,
        id: Number(borrowing.id),
        userId: Number(borrowing.userId),
        unitId: Number(borrowing.unitId),
        eventId: borrowing.eventId ? Number(borrowing.eventId) : null,
        unit: { ...borrowing.unit, id: Number(borrowing.unit.id) },
        event: borrowing.event ? { ...borrowing.event, id: Number(borrowing.event.id) } : null,
      },
    });
  } catch (error) {
    console.error('CreateBorrowing error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}

/**
 * Get all borrowings (Admin)
 */
async function getAllBorrowings(req, res) {
  try {
    const { status } = req.query;

    const where = {};
    if (status) where.status = status;

    const borrowings = await prisma.borrowing.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        unit: { select: { id: true, code: true, name: true, sizeCategory: true } },
        event: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const serialized = borrowings.map((b) => ({
      ...b,
      id: Number(b.id),
      userId: Number(b.userId),
      unitId: Number(b.unitId),
      eventId: b.eventId ? Number(b.eventId) : null,
      user: { ...b.user, id: Number(b.user.id) },
      unit: { ...b.unit, id: Number(b.unit.id) },
      event: b.event ? { ...b.event, id: Number(b.event.id) } : null,
    }));

    res.json({ borrowings: serialized });
  } catch (error) {
    console.error('GetAllBorrowings error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}

/**
 * Get my borrowings (User)
 */
async function getMyBorrowings(req, res) {
  try {
    const borrowings = await prisma.borrowing.findMany({
      where: { userId: BigInt(req.user.id) },
      include: {
        unit: { select: { id: true, code: true, name: true, sizeCategory: true } },
        event: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const serialized = borrowings.map((b) => ({
      ...b,
      id: Number(b.id),
      userId: Number(b.userId),
      unitId: Number(b.unitId),
      eventId: b.eventId ? Number(b.eventId) : null,
      unit: { ...b.unit, id: Number(b.unit.id) },
      event: b.event ? { ...b.event, id: Number(b.event.id) } : null,
    }));

    res.json({ borrowings: serialized });
  } catch (error) {
    console.error('GetMyBorrowings error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}

/**
 * Process return (Admin)
 */
async function processReturn(req, res) {
  try {
    const borrowingId = BigInt(req.params.id);

    const borrowing = await prisma.borrowing.findUnique({
      where: { id: borrowingId },
      include: { unit: true },
    });

    if (!borrowing) {
      return res.status(404).json({ message: 'Data peminjaman tidak ditemukan.' });
    }

    if (borrowing.status === 'returned') {
      return res.status(400).json({ message: 'Unit sudah dikembalikan.' });
    }

    if (borrowing.status === 'cancelled') {
      return res.status(400).json({ message: 'Peminjaman sudah dibatalkan.' });
    }

    const returnDate = new Date();
    returnDate.setHours(0, 0, 0, 0);

    const fineAmount = calculateFine(borrowing.dueDate, returnDate);

    // Update borrowing
    const updated = await prisma.borrowing.update({
      where: { id: borrowingId },
      data: {
        returnDate,
        fineAmount,
        status: 'returned',
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        unit: { select: { id: true, code: true, name: true } },
      },
    });

    // Update unit status to available
    await prisma.unit.update({
      where: { id: borrowing.unitId },
      data: { status: 'available' },
    });

    res.json({
      message: fineAmount > 0
        ? `Unit dikembalikan. Denda keterlambatan: Rp ${fineAmount.toLocaleString('id-ID')}`
        : 'Unit berhasil dikembalikan. Tidak ada denda.',
      borrowing: {
        ...updated,
        id: Number(updated.id),
        userId: Number(updated.userId),
        unitId: Number(updated.unitId),
        eventId: updated.eventId ? Number(updated.eventId) : null,
        user: { ...updated.user, id: Number(updated.user.id) },
        unit: { ...updated.unit, id: Number(updated.unit.id) },
      },
      fineAmount,
    });
  } catch (error) {
    console.error('ProcessReturn error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}

/**
 * Cancel booking (User/Admin)
 */
async function cancelBorrowing(req, res) {
  try {
    const borrowingId = BigInt(req.params.id);

    const borrowing = await prisma.borrowing.findUnique({
      where: { id: borrowingId },
    });

    if (!borrowing) {
      return res.status(404).json({ message: 'Data peminjaman tidak ditemukan.' });
    }

    // Only allow cancel for booked status
    if (borrowing.status !== 'booked') {
      return res.status(400).json({ message: 'Hanya booking yang belum aktif yang bisa dibatalkan.' });
    }

    // User can only cancel their own booking
    if (req.user.role !== 'admin' && Number(borrowing.userId) !== req.user.id) {
      return res.status(403).json({ message: 'Anda tidak memiliki izin untuk membatalkan booking ini.' });
    }

    await prisma.borrowing.update({
      where: { id: borrowingId },
      data: { status: 'cancelled' },
    });

    res.json({ message: 'Booking berhasil dibatalkan.' });
  } catch (error) {
    console.error('CancelBorrowing error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}

/**
 * Get borrowing report (Admin)
 */
async function getBorrowingReport(req, res) {
  try {
    const { startDate, endDate, status, userId } = req.query;

    const where = {};
    if (status) where.status = status;
    if (userId) where.userId = BigInt(userId);
    if (startDate || endDate) {
      where.borrowDate = {};
      if (startDate) where.borrowDate.gte = new Date(startDate);
      if (endDate) where.borrowDate.lte = new Date(endDate);
    }

    const borrowings = await prisma.borrowing.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        unit: { select: { id: true, code: true, name: true, sizeCategory: true } },
        event: { select: { id: true, title: true } },
      },
      orderBy: { borrowDate: 'desc' },
    });

    const serialized = borrowings.map((b) => ({
      ...b,
      id: Number(b.id),
      userId: Number(b.userId),
      unitId: Number(b.unitId),
      eventId: b.eventId ? Number(b.eventId) : null,
      user: { ...b.user, id: Number(b.user.id) },
      unit: { ...b.unit, id: Number(b.unit.id) },
      event: b.event ? { ...b.event, id: Number(b.event.id) } : null,
    }));

    // Summary
    const summary = {
      total: serialized.length,
      totalFine: serialized.reduce((sum, b) => sum + b.fineAmount, 0),
      byStatus: {
        booked: serialized.filter((b) => b.status === 'booked').length,
        borrowed: serialized.filter((b) => b.status === 'borrowed').length,
        returned: serialized.filter((b) => b.status === 'returned').length,
        cancelled: serialized.filter((b) => b.status === 'cancelled').length,
      },
    };

    res.json({ borrowings: serialized, summary });
  } catch (error) {
    console.error('GetBorrowingReport error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}

module.exports = { createBorrowing, getAllBorrowings, getMyBorrowings, processReturn, cancelBorrowing, getBorrowingReport };
