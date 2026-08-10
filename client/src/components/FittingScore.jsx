import React from 'react';

const FittingScore = ({ fittingScore }) => {
  if (!fittingScore || fittingScore.score === null) {
    return (
      <div className="fitting-gauge">
        <div className="fitting-info">
          <div className="fitting-label" style={{ color: 'var(--text-muted)' }}>Data Fisik Belum Lengkap</div>
          <div className="fitting-sub">Lengkapi profil untuk melihat tingkat kecocokan ukuran</div>
        </div>
      </div>
    );
  }

  const { score, label } = fittingScore;
  const strokeClass = score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low';
  
  // Circumference for r=20 circle: 2 * PI * 20 = 125.6
  const circumference = 125.6;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="fitting-gauge">
      <div className="fitting-circle">
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle className="fitting-circle-bg" cx="24" cy="24" r="20" />
          <circle
            className={`fitting-circle-progress ${strokeClass}`}
            cx="24"
            cy="24"
            r="20"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className="fitting-circle-text">{score}%</div>
      </div>
      <div className="fitting-info">
        <div className={`fitting-label ${strokeClass}`}>{label}</div>
        <div className="fitting-sub">Smart Size Compatibility</div>
      </div>
    </div>
  );
};

export default FittingScore;
