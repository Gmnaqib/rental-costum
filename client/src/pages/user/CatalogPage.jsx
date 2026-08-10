import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { unitAPI } from '../../api';
import FittingScore from '../../components/FittingScore';
import Badge from '../../components/ui/Badge';
import { FiSearch, FiFilter } from 'react-icons/fi';

const CatalogPage = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const navigate = useNavigate();

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (sizeFilter) params.size = sizeFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await unitAPI.getAll(params);
      setUnits(res.data.units);
    } catch (err) {
      console.error('Failed to fetch units', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, [search, sizeFilter, statusFilter]);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Katalog Unit Kostum</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Cari kostum favoritmu dan lihat skor rekomendasi kecocokan ukuran (Smart Fitting)
        </p>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Cari berdasarkan nama kostum..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={sizeFilter}
          onChange={(e) => setSizeFilter(e.target.value)}
        >
          <option value="">Semua Ukuran</option>
          <option value="S">Ukuran S</option>
          <option value="M">Ukuran M</option>
          <option value="L">Ukuran L</option>
          <option value="XL">Ukuran XL</option>
          <option value="XXL">Ukuran XXL</option>
        </select>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Semua Status</option>
          <option value="available">Tersedia</option>
          <option value="borrowed">Sedang Dipinjam</option>
        </select>
      </div>

      {loading ? (
        <div className="catalog-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="card skeleton" style={{ height: '280px' }} />
          ))}
        </div>
      ) : units.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎭</div>
          <h3>Kostum Tidak Ditemukan</h3>
          <p>Coba kata kunci pencarian atau filter lain.</p>
        </div>
      ) : (
        <div className="catalog-grid">
          {units.map((unit) => (
            <div
              key={unit.id}
              className="catalog-card"
              onClick={() => navigate(`/catalog/${unit.id}`)}
            >
              <div className="catalog-card-image">
                {unit.image ? (
                  <img src={unit.image} alt={unit.name} />
                ) : (
                  <span>🎭</span>
                )}
                <div className="catalog-card-status">
                  <Badge variant={unit.status === 'available' ? 'available' : 'borrowed'}>
                    {unit.status === 'available' ? 'Tersedia' : 'Dipinjam'}
                  </Badge>
                </div>
              </div>

              <div className="catalog-card-body">
                <div className="catalog-card-code">{unit.code}</div>
                <h3 className="catalog-card-name">{unit.name}</h3>

                <div className="catalog-card-meta">
                  <Badge variant="size">Size {unit.sizeCategory}</Badge>
                  {unit.recommendedHeightMin && unit.recommendedHeightMax && (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Tinggi {unit.recommendedHeightMin}-{unit.recommendedHeightMax} cm
                    </span>
                  )}
                </div>

                <div className="catalog-card-score">
                  <FittingScore fittingScore={unit.fittingScore} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CatalogPage;
