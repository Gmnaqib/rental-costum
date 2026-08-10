const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
  createBorrowing,
  getAllBorrowings,
  getMyBorrowings,
  processReturn,
  cancelBorrowing,
  getBorrowingReport,
} = require('../controllers/borrowing.controller');

const router = express.Router();

// User routes
router.post(
  '/',
  authenticate,
  [
    body('unitId').notEmpty().withMessage('Unit ID wajib diisi.'),
    body('borrowDate').isISO8601().withMessage('Tanggal pinjam tidak valid.'),
    body('dueDate').isISO8601().withMessage('Tanggal kembali tidak valid.'),
  ],
  validate,
  createBorrowing
);

router.get('/my', authenticate, getMyBorrowings);
router.put('/:id/cancel', authenticate, cancelBorrowing);

// Admin routes
router.get('/', authenticate, authorize('admin'), getAllBorrowings);
router.put('/:id/return', authenticate, authorize('admin'), processReturn);
router.get('/report', authenticate, authorize('admin'), getBorrowingReport);

module.exports = router;
