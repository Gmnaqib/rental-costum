import React, { useState, useEffect } from 'react';
import { borrowingAPI } from '../../api';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';

const BorrowingsPage = () => {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchBorrowings = async () => {
    try {
      setLoading(true);
      const res = await borrowingAPI.getAll({ status: statusFilter });
      setBorrowings(res.data.borrowings);
    } catch (err) {
      console.error('Failed to fetch borrowings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowings();
  }, [statusFilter]);

  const handleReturn = async (id) => {
    if (!window.confirm('Proses pengembalian unit kostum ini? Denda akan dihitung secara otomatis jika terlambat.')) return;
    try {
      const res = await borrowingAPI.processReturn(id);
      alert(res.data.message);
      fetchBorrowings();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memproses pengembalian.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'booked':
        return <Badge variant="booked">Booked</Badge>;
      case 'borrowed':
        return <Badge variant="borrowed">Sedang Dipinjam</Badge>;
      case 'returned':
        return <Badge variant="returned">Dikembalikan</Badge>;
      case 'cancelled':
        return <Badge variant="cancelled">Dibatalkan</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  const columns = [
    {
      header: 'Anggota',
      cell: (row) => (
        <div>
          <div style={{ fontWeight: '600' }}>{row.user?.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{row.user?.email}</div>
        </div>
      ),
    },
    {
      header: 'Kostum',
      cell: (row) => (
        <div>
          <div style={{ fontWeight: '600' }}>{row.unit?.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{row.unit?.code} (Size {row.unit?.sizeCategory})</div>
        </div>
      ),
    },
    {
      header: 'Event',
      cell: (row) => row.event?.title || <span style={{ color: 'var(--text-muted)' }}>-</span>,
    },
    {
      header: 'Tanggal Pinjam',
      cell: (row) => new Date(row.borrowDate).toLocaleDateString('id-ID'),
    },
    {
      header: 'Batas Kembali',
      cell: (row) => {
        const due = new Date(row.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isLate = row.status === 'borrowed' && due < today;

        return (
          <span style={{ color: isLate ? 'var(--danger)' : 'inherit', fontWeight: isLate ? '700' : 'normal' }}>
            {due.toLocaleDateString('id-ID')}
            {isLate && ' ⚠️ TERLAMBAT'}
          </span>
        );
      },
    },
    {
      header: 'Status',
      cell: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Denda',
      cell: (row) => (
        <span style={{ color: row.fineAmount > 0 ? 'var(--danger)' : 'var(--text-secondary)' }}>
          {row.fineAmount > 0 ? `Rp ${row.fineAmount.toLocaleString('id-ID')}` : 'Rp 0'}
        </span>
      ),
    },
    {
      header: 'Aksi Admin Terpusat',
      cell: (row) => {
        if (row.status === 'borrowed' || row.status === 'booked') {
          return (
            <Button variant="success" size="sm" onClick={() => handleReturn(row.id)}>
              <FiCheckCircle /> Proses Pengembalian
            </Button>
          );
        }
        return <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Selesai / Nonaktif</span>;
      },
    },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Monitoring Peminjaman Terpusat (Admin)</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Monitoring seluruh unit terpinjam dari semua anggota & pemrosesan pengembalian unit secara terpusat oleh Admin.
        </p>
      </div>

      <div className="toolbar">
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Semua Status</option>
          <option value="borrowed">Sedang Dipinjam</option>
          <option value="booked">Booked (Pre-Booking)</option>
          <option value="returned">Dikembalikan</option>
          <option value="cancelled">Dibatalkan</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>Memuat data peminjaman...</div>
        ) : (
          <Table columns={columns} data={borrowings} />
        )}
      </div>
    </div>
  );
};

export default BorrowingsPage;
