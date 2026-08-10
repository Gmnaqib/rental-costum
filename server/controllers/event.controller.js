const prisma = require('../utils/prisma');

/**
 * Get all events
 */
async function getAllEvents(req, res) {
  try {
    const events = await prisma.event.findMany({
      orderBy: { startDate: 'asc' },
    });

    res.json({
      events: events.map((e) => ({ ...e, id: Number(e.id) })),
    });
  } catch (error) {
    console.error('GetAllEvents error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}

/**
 * Get event by ID
 */
async function getEventById(req, res) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: BigInt(req.params.id) },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event tidak ditemukan.' });
    }

    res.json({ event: { ...event, id: Number(event.id) } });
  } catch (error) {
    console.error('GetEventById error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}

/**
 * Create event (Admin)
 */
async function createEvent(req, res) {
  try {
    const { title, location, startDate, endDate, description } = req.body;

    const event = await prisma.event.create({
      data: {
        title,
        location: location || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description: description || null,
      },
    });

    res.status(201).json({
      message: 'Event berhasil ditambahkan.',
      event: { ...event, id: Number(event.id) },
    });
  } catch (error) {
    console.error('CreateEvent error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}

/**
 * Update event (Admin)
 */
async function updateEvent(req, res) {
  try {
    const eventId = BigInt(req.params.id);
    const { title, location, startDate, endDate, description } = req.body;

    const existing = await prisma.event.findUnique({ where: { id: eventId } });
    if (!existing) {
      return res.status(404).json({ message: 'Event tidak ditemukan.' });
    }

    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: title || undefined,
        location: location !== undefined ? location : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        description: description !== undefined ? description : undefined,
      },
    });

    res.json({
      message: 'Event berhasil diupdate.',
      event: { ...event, id: Number(event.id) },
    });
  } catch (error) {
    console.error('UpdateEvent error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}

/**
 * Delete event (Admin)
 */
async function deleteEvent(req, res) {
  try {
    const eventId = BigInt(req.params.id);
    const existing = await prisma.event.findUnique({ where: { id: eventId } });
    if (!existing) {
      return res.status(404).json({ message: 'Event tidak ditemukan.' });
    }

    await prisma.event.delete({ where: { id: eventId } });
    res.json({ message: 'Event berhasil dihapus.' });
  } catch (error) {
    console.error('DeleteEvent error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}

module.exports = { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent };
