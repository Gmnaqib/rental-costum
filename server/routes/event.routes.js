const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent } = require('../controllers/event.controller');

const router = express.Router();

router.get('/', authenticate, getAllEvents);
router.get('/:id', authenticate, getEventById);

// Admin routes
router.post(
  '/',
  authenticate,
  authorize('admin'),
  [
    body('title').notEmpty().withMessage('Judul event wajib diisi.'),
    body('startDate').isISO8601().withMessage('Tanggal mulai tidak valid.'),
    body('endDate').isISO8601().withMessage('Tanggal selesai tidak valid.'),
  ],
  validate,
  createEvent
);

router.put('/:id', authenticate, authorize('admin'), updateEvent);
router.delete('/:id', authenticate, authorize('admin'), deleteEvent);

module.exports = router;
