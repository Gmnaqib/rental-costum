import React, { useState, useEffect } from 'react';
import { borrowingAPI } from '../../api';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const MyBorrowingsPage = () => {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyBorrowings = async () => {
    try {
      setLoading(true);
      const res = await borrowingAPI.getMy();
      setBorrowings(res.data.borrowings);
    } catch (err) {
      console.error('Failed to fetch borrowings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBorrowings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Yakin ingin membatalkan pre-booking ini?')) return;
    try {
      await borrowingAPI.cancel(id);
      fetchMyBorrowings();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membatalkan booking.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'booked':
        return <Badge variant="booked">Booked (Pre-Booking)</Badge>;
      case 'borrowed':
        return <Badge variant="borrowed">Sedang Dipinjam</Badge>;
      case 'returned':
        return <Badge variant="returned">Sudah Dikembalikan</Badge>;
      case 'cancelled':
        return <Badge variant="cancelled">Dibatalkan</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  const columns = [
    {
      header: 'Kode & Unit Kostum',
      cell: (row) => (
        <div>
          <div style={{ fontWeight: '600' }}>{row.unit?.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{row.unit?.code} (Size {row.unit?.sizeCategory})</div>
        </div>
      ),
    },
    {
      header: 'Event Terkait',
      cell: (row) => (row.event ? row.event.title : <span style={{ color: 'var(--text-muted)' }}>-</span>),
    },
    {
      header: 'Tanggal Pinjam',
      accessor: 'borrowDate',
      cell: (row) => new Date(row.borrowDate).toLocaleDateString('id-ID'),
    },
    {
      header: 'Batas Kembali',
      accessor: 'dueDate',
      cell: (row) => new Date(row.dueDate).toLocaleDateString('id-ID'),
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
      header: 'Aksi',
      cell: (row) =>
        row.status === 'booked' ? (
          <Button variant="danger" size="sm" onClick={() => handleCancel(row.id)}>
            Batalkan
          </Button>
        ) : (
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>-</span>
        ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Peminjaman & Riwayat Saya</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Daftar kostum yang sedang/pernah Anda pinjam atau book. (Maksimal 2 unit aktif)
        </p>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>Memuat data peminjaman...</div>
        ) : (
          <Table columns={columns} data={borrowings} emptyMessage="Anda belum pernah melakukan peminjaman." />
        )}
      </div>
    </div>
  );
};

export default MyBorrowingsPage;
