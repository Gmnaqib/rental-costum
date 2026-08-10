import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { FiUser, FiCheckCircle } from 'react-icons/fi';

const ProfilePage = () => {
  const { user, refreshProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    address: '',
    heightCm: '',
    weightKg: '',
    chestSizeCm: '',
    waistSizeCm: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getProfile();
      const prof = res.data.profile;
      setFormData({
        name: user?.name || '',
        phoneNumber: prof.phoneNumber || '',
        address: prof.address || '',
        heightCm: prof.heightCm || '',
        weightKg: prof.weightKg || '',
        chestSizeCm: prof.chestSizeCm || '',
        waistSizeCm: prof.waistSizeCm || '',
      });
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await userAPI.updateProfile(formData);
      await refreshProfile();
      setSuccess('Profil & Atribut Fisik berhasil diperbarui!');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengupdate profil.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Manajemen Profil & Body Size</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Atribut fisik Anda digunakan oleh <strong>Smart Size & Fitting Estimator</strong> untuk mengukur tingkat kecocokan ukuran kostum.
        </p>
      </div>

      {success && (
        <div style={{ padding: '16px', background: 'rgba(0, 184, 148, 0.15)', color: 'var(--success)', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
          <FiCheckCircle style={{ marginRight: '8px' }} /> {success}
        </div>
      )}

      {error && (
        <div style={{ padding: '16px', background: 'rgba(225, 112, 85, 0.15)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 className="card-title" style={{ marginBottom: '20px', fontSize: '16px' }}>
            <FiUser style={{ marginRight: '8px' }} /> Informasi Dasar
          </h2>

          <Input
            label="Nama Lengkap"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <Input
            label="Nomor Telepon / WA"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />

          <Input
            label="Alamat Lengkap"
            name="address"
            type="textarea"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>

        {/* Physical Attributes for Fitting */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 className="card-title" style={{ marginBottom: '8px', fontSize: '16px' }}>
            📏 Atribut Fisik Pengguna (Rule-Based Fitting)
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Masukkan data tubuh yang akurat untuk mendapatkan hasil estimasi kecocokan terbaik saat memilih kostum.
          </p>

          <div className="form-row">
            <Input
              label="Tinggi Badan (cm)"
              name="heightCm"
              type="number"
              placeholder="Contoh: 170"
              value={formData.heightCm}
              onChange={handleChange}
            />

            <Input
              label="Berat Badan (kg)"
              name="weightKg"
              type="number"
              placeholder="Contoh: 65"
              value={formData.weightKg}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <Input
              label="Lingkar Dada (cm)"
              name="chestSizeCm"
              type="number"
              placeholder="Contoh: 95"
              value={formData.chestSizeCm}
              onChange={handleChange}
            />

            <Input
              label="Lingkar Pinggang (cm)"
              name="waistSizeCm"
              type="number"
              placeholder="Contoh: 80"
              value={formData.waistSizeCm}
              onChange={handleChange}
            />
          </div>
        </div>

        <Button type="submit" variant="primary" style={{ width: '100%' }} disabled={submitting}>
          {submitting ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
        </Button>
      </form>
    </div>
  );
};

export default ProfilePage;
