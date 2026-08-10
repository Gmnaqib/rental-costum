import React, { useState, useEffect } from 'react';
import { unitAPI } from '../../api';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';

const ManageUnitsPage = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    sizeCategory: 'M',
    recommendedHeightMin: '',
    recommendedHeightMax: '',
    description: '',
    status: 'available',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const res = await unitAPI.getAll({ search });
      setUnits(res.data.units);
    } catch (err) {
      console.error('Failed to fetch units', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, [search]);

  const handleOpenAddModal = () => {
    setEditingUnit(null);
    setFormData({
      code: `KST-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      sizeCategory: 'M',
      recommendedHeightMin: '160',
      recommendedHeightMax: '175',
      description: '',
      status: 'available',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (unit) => {
    setEditingUnit(unit);
    setFormData({
      code: unit.code,
      name: unit.name,
      sizeCategory: unit.sizeCategory,
      recommendedHeightMin: unit.recommendedHeightMin || '',
      recommendedHeightMax: unit.recommendedHeightMax || '',
      description: unit.description || '',
      status: unit.status,
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus unit kostum ini?')) return;
    try {
      await unitAPI.delete(id);
      fetchUnits();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus unit.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingUnit) {
        await unitAPI.update(editingUnit.id, formData);
      } else {
        await unitAPI.create(formData);
      }
      setIsModalOpen(false);
      fetchUnits();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan unit kostum.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Kode Unit',
      accessor: 'code',
      cell: (row) => <span style={{ fontWeight: '700', color: 'var(--primary-light)' }}>{row.code}</span>,
    },
    {
      header: 'Nama Kostum',
      accessor: 'name',
      cell: (row) => <span style={{ fontWeight: '600' }}>{row.name}</span>,
    },
    {
      header: 'Ukuran',
      cell: (row) => <Badge variant="size">{row.sizeCategory}</Badge>,
    },
    {
      header: 'Rekomendasi Tinggi',
      cell: (row) =>
        row.recommendedHeightMin && row.recommendedHeightMax ? (
          `${row.recommendedHeightMin} - ${row.recommendedHeightMax} cm`
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>-</span>
        ),
    },
    {
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.status === 'available' ? 'available' : 'borrowed'}>
          {row.status === 'available' ? 'Tersedia' : 'Dipinjam'}
        </Badge>
      ),
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
          <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Manajemen Unit Kostum</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Tambah, edit, dan hapus unit kostum beserta rekomendasi ukuran untuk Smart Fitting.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenAddModal}>
          <FiPlus /> Tambah Unit Baru
        </Button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Cari berdasarkan nama unit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>Memuat data unit kostum...</div>
        ) : (
          <Table columns={columns} data={units} />
        )}
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUnit ? 'Edit Unit Kostum' : 'Tambah Unit Kostum Baru'}
      >
        {error && (
          <div style={{ padding: '12px', background: 'rgba(225, 112, 85, 0.15)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <Input
              label="Kode Unit (Unik)"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />

            <Input
              label="Kategori Ukuran"
              type="select"
              value={formData.sizeCategory}
              onChange={(e) => setFormData({ ...formData, sizeCategory: e.target.value })}
            >
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
            </Input>
          </div>

          <Input
            label="Nama Unit Kostum"
            placeholder="Contoh: Kostum Naruto Sage Mode"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="form-row">
            <Input
              label="Rekomendasi Tinggi Min (cm)"
              type="number"
              placeholder="170"
              value={formData.recommendedHeightMin}
              onChange={(e) => setFormData({ ...formData, recommendedHeightMin: e.target.value })}
            />

            <Input
              label="Rekomendasi Tinggi Max (cm)"
              type="number"
              placeholder="180"
              value={formData.recommendedHeightMax}
              onChange={(e) => setFormData({ ...formData, recommendedHeightMax: e.target.value })}
            />
          </div>

          <Input
            label="Deskripsi Unit"
            type="textarea"
            placeholder="Keterangan kelengkapan, bahan, dll."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          {editingUnit && (
            <Input
              label="Status Unit"
              type="select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="available">Tersedia</option>
              <option value="borrowed">Dipinjam</option>
            </Input>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Memproses...' : 'Simpan Unit'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageUnitsPage;
