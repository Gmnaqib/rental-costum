import React, { useState, useEffect } from 'react';
import { userAPI, unitAPI, borrowingAPI, eventAPI } from '../../api';
import { FiUsers, FiBox, FiCalendar, FiClock } from 'react-icons/fi';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalUnits: 0,
    availableUnits: 0,
    borrowedUnits: 0,
    activeBorrowings: 0,
    totalEvents: 0,
  });
  const [recentBorrowings, setRecentBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [usersRes, unitsRes, borrowingsRes, eventsRes] = await Promise.all([
        userAPI.getAll(),
        unitAPI.getAll(),
        borrowingAPI.getAll(),
        eventAPI.getAll(),
      ]);

      const units = unitsRes.data.units;
      const borrowings = borrowingsRes.data.borrowings;

      setStats({
        totalUsers: usersRes.data.users.length,
        totalUnits: units.length,
        availableUnits: units.filter((u) => u.status === 'available').length,
        borrowedUnits: units.filter((u) => u.status === 'borrowed').length,
        activeBorrowings: borrowings.filter((b) => b.status === 'borrowed' || b.status === 'booked').length,
        totalEvents: eventsRes.data.events.length,
      });

      setRecentBorrowings(borrowings.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Ringkasan sistem rental kostum, statistik unit, dan peminjaman aktif.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">
            <FiBox />
          </div>
          <div className="stat-info">
            <h3>{stats.totalUnits}</h3>
            <p>Total Unit Kostum</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <FiBox />
          </div>
          <div className="stat-info">
            <h3>{stats.availableUnits}</h3>
            <p>Unit Tersedia</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon yellow">
            <FiClock />
          </div>
          <div className="stat-info">
            <h3>{stats.activeBorrowings}</h3>
            <p>Peminjaman Aktif</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon teal">
            <FiUsers />
          </div>
          <div className="stat-info">
            <h3>{stats.totalUsers}</h3>
            <p>Total Anggota</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pink">
            <FiCalendar />
          </div>
          <div className="stat-info">
            <h3>{stats.totalEvents}</h3>
            <p>Event Terdaftar</p>
          </div>
        </div>
      </div>

      {/* Recent Borrowings Preview */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Peminjaman Terbaru</h2>
        </div>

        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Memuat data...</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Anggota</th>
                  <th>Kostum</th>
                  <th>Tanggal Pinjam</th>
                  <th>Batas Kembali</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBorrowings.map((b) => (
                  <tr key={b.id}>
                    <td>{b.user?.name}</td>
                    <td>{b.unit?.name} ({b.unit?.code})</td>
                    <td>{new Date(b.borrowDate).toLocaleDateString('id-ID')}</td>
                    <td>{new Date(b.dueDate).toLocaleDateString('id-ID')}</td>
                    <td>
                      <span className={`badge badge-${b.status}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
