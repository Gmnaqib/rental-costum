import React, { useState, useEffect } from 'react';
import { eventAPI } from '../../api';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar } from 'react-icons/fi';

const ManageEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await eventAPI.getAll();
      setEvents(res.data.events);
    } catch (err) {
      console.error('Failed to fetch events', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOpenAddModal = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      location: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      description: '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      location: event.location || '',
      startDate: new Date(event.startDate).toISOString().split('T')[0],
      endDate: new Date(event.endDate).toISOString().split('T')[0],
      description: event.description || '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus event ini?')) return;
    try {
      await eventAPI.delete(id);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus event.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingEvent) {
        await eventAPI.update(editingEvent.id, formData);
      } else {
        await eventAPI.create(formData);
      }
      setIsModalOpen(false);
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan event.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Nama Event',
      accessor: 'title',
      cell: (row) => <span style={{ fontWeight: '700' }}>{row.title}</span>,
    },
    {
      header: 'Lokasi',
      cell: (row) => row.location || <span style={{ color: 'var(--text-muted)' }}>-</span>,
    },
    {
      header: 'Tanggal Pelaksanaan',
      cell: (row) => (
        <span>
          {new Date(row.startDate).toLocaleDateString('id-ID')} s/d {new Date(row.endDate).toLocaleDateString('id-ID')}
        </span>
      ),
    },
    {
      header: 'Keterangan',
      cell: (row) => <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{row.description || '-'}</span>,
    },
    {
      header: 'Aksi',
      cell: (row) => (
        <div className="table-actions">
          <Button variant="secondary" size="sm" onClick={() => handleOpenEditModal(row)}>
            <FiEdit2 />
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(row.id)}>
            <FiTrash2 />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Manajemen Event Pre-Booking</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Kelola event (Comic-Con, festival cosplay, dll.) yang dapat dikaitkan dengan pre-booking anggota.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenAddModal}>
          <FiPlus /> Tambah Event Baru
        </Button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>Memuat data event...</div>
        ) : (
          <Table columns={columns} data={events} />
        )}
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEvent ? 'Edit Event' : 'Tambah Event Baru'}
      >
        {error && (
          <div style={{ padding: '12px', background: 'rgba(225, 112, 85, 0.15)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Nama / Judul Event"
            placeholder="Contoh: Comic Frontier 19 (Comifuro)"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <Input
            label="Lokasi Event"
            placeholder="Contoh: ICE BSD, Tangerang"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />

          <div className="form-row">
            <Input
              label="Tanggal Mulai"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />

            <Input
              label="Tanggal Selesai"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>

          <Input
            label="Keterangan Event"
            type="textarea"
            placeholder="Deskripsi singkat event..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Memproses...' : 'Simpan Event'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageEventsPage;
