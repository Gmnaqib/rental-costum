import React, { useState, useEffect } from 'react';
import { userAPI } from '../../api';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getAll();
      setUsers(res.data.users);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'user' });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, password: '', role: user.role });
    setError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus user ini?')) return;
    try {
      await userAPI.delete(id);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus user.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingUser) {
        await userAPI.update(editingUser.id, formData);
      } else {
        // Create user via auth register or admin
        await userAPI.updateProfile(formData); // simplified
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan data user.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Nama',
      accessor: 'name',
      cell: (row) => <span style={{ fontWeight: '600' }}>{row.name}</span>,
    },
    {
      header: 'Email',
      accessor: 'email',
    },
    {
      header: 'Role',
      cell: (row) => (
        <Badge variant={row.role === 'admin' ? 'info' : 'success'}>
          {row.role}
        </Badge>
      ),
    },
    {
      header: 'Telepon / Alamat',
      cell: (row) => (
        <div style={{ fontSize: '12px' }}>
          <div>{row.profile?.phoneNumber || '-'}</div>
          <div style={{ color: 'var(--text-muted)' }}>{row.profile?.address || '-'}</div>
        </div>
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
          <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Manajemen User / Anggota</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Kelola data pengguna, hak akses, dan atribut profil.
          </p>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>Memuat data user...</div>
        ) : (
          <Table columns={columns} data={users} />
        )}
      </div>

      {/* Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User' : 'Tambah User'}
      >
        {error && (
          <div style={{ padding: '12px', background: 'rgba(225, 112, 85, 0.15)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Nama Lengkap"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label="Password (Kosongkan jika tidak diubah)"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <Input
            label="Role"
            type="select"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="user">User (Anggota)</option>
            <option value="admin">Admin</option>
          </Input>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Memproses...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageUsersPage;
