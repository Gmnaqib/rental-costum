import React, { useState, useEffect, useRef } from 'react';
import { borrowingAPI } from '../../api';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { FiPrinter, FiFilter } from 'react-icons/fi';

const ReportsPage = () => {
  const [borrowings, setBorrowings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const printRef = useRef();

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (statusFilter) params.status = statusFilter;

      const res = await borrowingAPI.getReport(params);
      setBorrowings(res.data.borrowings);
      setSummary(res.data.summary);
    } catch (err) {
      console.error('Failed to fetch report', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate, statusFilter]);

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    {
      header: 'ID Trx',
      accessor: 'id',
      cell: (row) => `#TRX-${row.id}`,
    },
    {
      header: 'Nama Anggota',
      cell: (row) => row.user?.name,
    },
    {
      header: 'Unit Kostum',
      cell: (row) => `${row.unit?.name} (${row.unit?.code})`,
    },
    {
      header: 'Event',
      cell: (row) => row.event?.title || '-',
    },
    {
      header: 'Tgl Pinjam',
      cell: (row) => new Date(row.borrowDate).toLocaleDateString('id-ID'),
    },
    {
      header: 'Tgl Kembali (Aktual)',
      cell: (row) => (row.returnDate ? new Date(row.returnDate).toLocaleDateString('id-ID') : '-'),
    },
    {
      header: 'Status',
      cell: (row) => <Badge variant={row.status}>{row.status}</Badge>,
    },
    {
      header: 'Denda',
      cell: (row) => `Rp ${row.fineAmount.toLocaleString('id-ID')}`,
    },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Laporan Riwayat Peminjaman (Admin)</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Lihat dan cetak laporan transaksi penyewaan kostum secara menyeluruh.
          </p>
        </div>
        <Button variant="primary" onClick={handlePrint}>
          <FiPrinter /> Cetak / Export Laporan
        </Button>
      </div>

      <div className="toolbar">
        <div className="form-row" style={{ flex: 1, gap: '12px' }}>
          <Input
            type="date"
            placeholder="Dari Tanggal"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            type="date"
            placeholder="Sampai Tanggal"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Semua Status</option>
          <option value="returned">Dikembalikan</option>
          <option value="borrowed">Sedang Dipinjam</option>
          <option value="booked">Booked</option>
          <option value="cancelled">Dibatalkan</option>
        </select>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="stats-grid" style={{ marginBottom: '24px' }}>
          <div className="stat-card">
            <div className="stat-info">
              <h3>{summary.total}</h3>
              <p>Total Transaksi</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <h3 style={{ color: 'var(--danger)' }}>Rp {summary.totalFine.toLocaleString('id-ID')}</h3>
              <p>Total Denda Terkumpul</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <h3 style={{ color: 'var(--success)' }}>{summary.byStatus.returned}</h3>
              <p>Selesai / Dikembalikan</p>
            </div>
          </div>
        </div>
      )}

      {/* Printable Area */}
      <div className="card" ref={printRef}>
        <div className="print-only" style={{ marginBottom: '20px', textAlign: 'center' }}>
          <h2>LAPORAN RIWAYAT PEMINJAMAN KOSTUM</h2>
          <p>Sistem Rental Kostum - Smart & Interactive Platform</p>
          <hr style={{ margin: '10px 0' }} />
        </div>

        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>Memuat laporan...</div>
        ) : (
          <Table columns={columns} data={borrowings} />
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
