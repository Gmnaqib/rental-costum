import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await register(formData);
      navigate('/catalog');
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal. Coba lagi nanti.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '480px' }}>
        <div className="auth-header">
          <div className="auth-logo">🎭</div>
          <h1>Daftar Akun Baru</h1>
          <p>Bergabung untuk menyewa kostum & nikmati Smart Fitting</p>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(225, 112, 85, 0.15)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Nama Lengkap"
            name="name"
            placeholder="Contoh: Budi Santoso"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="budi@mail.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Minimal 6 karakter"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <Input
            label="Nomor Telepon / WA"
            name="phoneNumber"
            placeholder="081234567890"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />

          <Input
            label="Alamat Lengkap"
            name="address"
            type="textarea"
            placeholder="Jl. Mawar No. 12, Bandung"
            value={formData.address}
            onChange={handleChange}
            required
          />

          <Button type="submit" variant="primary" style={{ width: '100%', marginTop: '10px' }} disabled={submitting}>
            {submitting ? 'Memproses...' : 'Daftar Sekarang'}
          </Button>
        </form>

        <div className="auth-footer">
          Sudah punya akun? <Link to="/login">Masuk di sini</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
