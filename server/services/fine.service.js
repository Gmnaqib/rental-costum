/**
 * Fine Calculator Service
 * Calculates late return fines
 */

const FINE_PER_DAY = 5000; // Rp 5.000 per hari

/**
 * Calculate fine amount for late return
 * @param {Date} dueDate - The due date
 * @param {Date} returnDate - The actual return date
 * @returns {number} Fine amount in Rupiah
 */
function calculateFine(dueDate, returnDate) {
  const due = new Date(dueDate);
  const returned = new Date(returnDate);

  // Reset time component for accurate day calculation
  due.setHours(0, 0, 0, 0);
  returned.setHours(0, 0, 0, 0);

  const diffTime = returned.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 0;

  return diffDays * FINE_PER_DAY;
}

module.exports = { calculateFine, FINE_PER_DAY };
