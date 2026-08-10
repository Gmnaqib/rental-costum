import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { unitAPI, eventAPI, borrowingAPI } from '../../api';
import FittingScore from '../../components/FittingScore';
import EventCalendar from '../../components/EventCalendar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { FiArrowLeft, FiCalendar, FiClock, FiCheckCircle } from 'react-icons/fi';

const UnitDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [unit, setUnit] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking states
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const [unitRes, availRes, eventsRes] = await Promise.all([
        unitAPI.getById(id),
        unitAPI.getAvailability(id),
        eventAPI.getAll(),
      ]);

      setUnit(unitRes.data.unit);
      setAvailability(availRes.data);
      setEvents(eventsRes.data.events);
    } catch (err) {
      console.error('Failed to load detail', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleSelectRange = (start, end) => {
    setSelectedStartDate(start);
    setSelectedEndDate(end);
  };

  const handleOpenBookingModal = () => {
    if (!selectedStartDate || !selectedEndDate) {
      alert('Silakan pilih rentang tanggal dari kalender terlebih dahulu.');
      return;
    }
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmitBooking = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await borrowingAPI.create({
        unitId: unit.id,
        eventId: selectedEventId ? parseInt(selectedEventId) : null,
        borrowDate: selectedStartDate,
        dueDate: selectedEndDate,
      });

      setSuccess(res.data.message);
      setIsModalOpen(false);
      setTimeout(() => {
        navigate('/my-borrowings');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat peminjaman.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ padding: '40px', textAlign: 'center' }}>
        Loading detail kostum...
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="empty-state">
        <h3>Unit tidak ditemukan</h3>
        <Button onClick={() => navigate('/catalog')}>Kembali ke Katalog</Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => navigate('/catalog')}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '20px' }}
      >
        <FiArrowLeft /> Kembali ke Katalog
      </button>

      {success && (
        <div style={{ padding: '16px', background: 'rgba(0, 184, 148, 0.15)', color: 'var(--success)', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
          <FiCheckCircle style={{ marginRight: '8px' }} /> {success}
        </div>
      )}

      <div className="detail-grid">
        {/* Left Column: Image & Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="detail-image">
            {unit.image ? <img src={unit.image} alt={unit.name} /> : <span>🎭</span>}
          </div>

          <div className="card">
            <div className="detail-code">{unit.code}</div>
            <h1 className="detail-name">{unit.name}</h1>

            <div className="detail-meta" style={{ marginTop: '12px' }}>
              <Badge variant={unit.status === 'available' ? 'available' : 'borrowed'}>
                {unit.status === 'available' ? 'Tersedia' : 'Sedang Dipinjam'}
              </Badge>
              <Badge variant="size">Ukuran {unit.sizeCategory}</Badge>
              {unit.recommendedHeightMin && unit.recommendedHeightMax && (
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Rekomendasi Tinggi: {unit.recommendedHeightMin} - {unit.recommendedHeightMax} cm
                </span>
              )}
            </div>

            <div style={{ marginTop: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>Deskripsi Unit</h3>
              <p className="detail-desc">{unit.description || 'Tidak ada deskripsi.'}</p>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Smart Fitting Estimator</h3>
              <FittingScore fittingScore={unit.fittingScore} />
            </div>
          </div>
        </div>

        {/* Right Column: Calendar & Booking Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '8px' }}>
              <FiCalendar style={{ marginRight: '8px' }} /> Kalender Ketersediaan Unit
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Pilih tanggal mulai dan tanggal kembali dari kalender di bawah untuk booking.
            </p>

            <EventCalendar
              bookedDates={availability?.bookedDates || []}
              selectedStartDate={selectedStartDate}
              selectedEndDate={selectedEndDate}
              onSelectRange={handleSelectRange}
            />

            {/* Selection Summary */}
            <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Ringkasan Tanggal Dipilih:</div>
              {selectedStartDate ? (
                <div style={{ fontSize: '14px', color: 'var(--primary-light)' }}>
                  {selectedStartDate} {selectedEndDate ? ` s/d ${selectedEndDate}` : ' (Pilih tanggal kembali)'}
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Belum ada tanggal dipilih</div>
              )}
            </div>

            <Button
              variant="primary"
              style={{ width: '100%', marginTop: '20px' }}
              onClick={handleOpenBookingModal}
              disabled={!selectedStartDate || !selectedEndDate}
            >
              Lanjutkan Booking Tanggal Ini
            </Button>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Konfirmasi Advance Pre-Booking"
      >
        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(225, 112, 85, 0.15)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <div style={{ fontSize: '14px', marginBottom: '20px' }}>
          <p><strong>Kostum:</strong> {unit.name} ({unit.code})</p>
          <p><strong>Ukuran:</strong> {unit.sizeCategory}</p>
          <p><strong>Tanggal Pinjam:</strong> {selectedStartDate}</p>
          <p><strong>Tanggal Kembali:</strong> {selectedEndDate}</p>
          <p><strong>Maksimal Pinjam:</strong> 5 hari (Aturan rental)</p>
        </div>

        <Input
          label="Kaitkan dengan Event (Opsional)"
          type="select"
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
        >
          <option value="">-- Tidak Dikaitkan dengan Event --</option>
          {events.map((evt) => (
            <option key={evt.id} value={evt.id}>
              {evt.title} ({new Date(evt.startDate).toLocaleDateString('id-ID')} - {new Date(evt.endDate).toLocaleDateString('id-ID')})
            </option>
          ))}
        </Input>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleSubmitBooking} disabled={submitting}>
            {submitting ? 'Memproses...' : 'Konfirmasi & Lock Tanggal'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default UnitDetailPage;
