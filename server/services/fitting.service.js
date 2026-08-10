/**
 * Smart Size & Fitting Estimator Service
 * Rule-based compatibility score calculation
 */

// Size category ranges (approximate body measurements)
const SIZE_RANGES = {
  S:   { weightMin: 40, weightMax: 55, chestMin: 76, chestMax: 88, waistMin: 60, waistMax: 72 },
  M:   { weightMin: 55, weightMax: 65, chestMin: 88, chestMax: 96, waistMin: 72, waistMax: 80 },
  L:   { weightMin: 65, weightMax: 75, chestMin: 96, chestMax: 104, waistMin: 80, waistMax: 88 },
  XL:  { weightMin: 75, weightMax: 90, chestMin: 104, chestMax: 112, waistMin: 88, waistMax: 96 },
  XXL: { weightMin: 90, weightMax: 120, chestMin: 112, chestMax: 130, waistMin: 96, waistMax: 115 },
};

/**
 * Calculate compatibility score between user profile and costume unit
 * @param {Object} profile - User profile { heightCm, weightKg, chestSizeCm, waistSizeCm }
 * @param {Object} unit - Unit { sizeCategory, recommendedHeightMin, recommendedHeightMax }
 * @returns {Object} { score: number, label: string, details: object }
 */
function calculateFittingScore(profile, unit) {
  if (!profile || !profile.heightCm) {
    return { score: null, label: 'Data Belum Lengkap', details: null };
  }

  const sizeRange = SIZE_RANGES[unit.sizeCategory];
  if (!sizeRange) {
    return { score: null, label: 'Kategori Tidak Dikenal', details: null };
  }

  let totalScore = 0;
  const details = {};

  // 1. Height Score (40% weight)
  const heightScore = calculateHeightScore(profile.heightCm, unit.recommendedHeightMin, unit.recommendedHeightMax);
  details.height = { score: heightScore, weight: 40 };
  totalScore += heightScore * 0.4;

  // 2. Size Category Match based on weight + chest (30% weight)
  const sizeMatchScore = calculateSizeMatchScore(profile.weightKg, profile.chestSizeCm, sizeRange);
  details.sizeMatch = { score: sizeMatchScore, weight: 30 };
  totalScore += sizeMatchScore * 0.3;

  // 3. Waist Compatibility (15% weight)
  const waistScore = calculateWaistScore(profile.waistSizeCm, sizeRange);
  details.waist = { score: waistScore, weight: 15 };
  totalScore += waistScore * 0.15;

  // 4. Overall Bonus (15% weight) - if all parameters are within range
  const bonusScore = (heightScore >= 80 && sizeMatchScore >= 80 && waistScore >= 80) ? 100 : 
                     (heightScore >= 60 && sizeMatchScore >= 60 && waistScore >= 60) ? 60 : 20;
  details.bonus = { score: bonusScore, weight: 15 };
  totalScore += bonusScore * 0.15;

  const score = Math.round(totalScore);
  const label = score >= 80 ? 'Sangat Cocok' : score >= 60 ? 'Cocok' : 'Kurang Cocok';

  return { score, label, details };
}

function calculateHeightScore(height, min, max) {
  if (!min || !max) return 50; // Default if no range set
  if (height >= min && height <= max) return 100;

  const range = max - min;
  const tolerance = range * 0.5;

  if (height < min) {
    const diff = min - height;
    if (diff <= tolerance) return Math.max(0, 100 - (diff / tolerance) * 60);
    return Math.max(0, 40 - (diff - tolerance) * 2);
  }

  if (height > max) {
    const diff = height - max;
    if (diff <= tolerance) return Math.max(0, 100 - (diff / tolerance) * 60);
    return Math.max(0, 40 - (diff - tolerance) * 2);
  }

  return 0;
}

function calculateSizeMatchScore(weight, chest, sizeRange) {
  let weightScore = 100;
  let chestScore = 100;

  if (weight) {
    if (weight >= sizeRange.weightMin && weight <= sizeRange.weightMax) {
      weightScore = 100;
    } else {
      const diff = weight < sizeRange.weightMin
        ? sizeRange.weightMin - weight
        : weight - sizeRange.weightMax;
      weightScore = Math.max(0, 100 - diff * 5);
    }
  }

  if (chest) {
    if (chest >= sizeRange.chestMin && chest <= sizeRange.chestMax) {
      chestScore = 100;
    } else {
      const diff = chest < sizeRange.chestMin
        ? sizeRange.chestMin - chest
        : chest - sizeRange.chestMax;
      chestScore = Math.max(0, 100 - diff * 5);
    }
  }

  return Math.round((weightScore + chestScore) / 2);
}

function calculateWaistScore(waist, sizeRange) {
  if (!waist) return 50; // Default if no data
  if (waist >= sizeRange.waistMin && waist <= sizeRange.waistMax) return 100;

  const diff = waist < sizeRange.waistMin
    ? sizeRange.waistMin - waist
    : waist - sizeRange.waistMax;

  return Math.max(0, 100 - diff * 5);
}

module.exports = { calculateFittingScore, SIZE_RANGES };
