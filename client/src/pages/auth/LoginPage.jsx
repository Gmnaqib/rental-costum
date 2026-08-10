import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await login({ email, password });
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/catalog');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal. Periksa kembali email & password Anda.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🎭</div>
          <h1>Masuk ke Akun</h1>
          <p>Sistem Rental Kostum & Smart Fitting</p>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(225, 112, 85, 0.15)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            placeholder="nama@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" style={{ width: '100%', marginTop: '10px' }} disabled={submitting}>
            {submitting ? 'Memproses...' : 'Masuk'}
          </Button>
        </form>

        <div className="auth-footer">
          Belum punya akun? <Link to="/register">Daftar Sekarang</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
