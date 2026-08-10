import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const EventCalendar = ({ bookedDates = [], selectedStartDate, selectedEndDate, onSelectRange }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const todayStr = new Date().toISOString().split('T')[0];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const isDateBooked = (dateStr) => {
    return bookedDates.some((b) => b.date === dateStr);
  };

  const handleDateClick = (dateStr) => {
    if (isDateBooked(dateStr)) return; // Can't select booked date
    if (dateStr < todayStr) return; // Can't select past date

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      onSelectRange(dateStr, null);
    } else if (selectedStartDate && !selectedEndDate) {
      if (dateStr < selectedStartDate) {
        onSelectRange(dateStr, null);
      } else {
        // Calculate diff days
        const start = new Date(selectedStartDate);
        const end = new Date(dateStr);
        const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        if (diffDays > 5) {
          alert('Maksimal durasi peminjaman adalah 5 hari.');
          return;
        }

        // Check if range contains any booked dates
        let hasBookedInRange = false;
        const cur = new Date(start);
        while (cur <= end) {
          const checkStr = cur.toISOString().split('T')[0];
          if (isDateBooked(checkStr)) {
            hasBookedInRange = true;
            break;
          }
          cur.setDate(cur.getDate() + 1);
        }

        if (hasBookedInRange) {
          alert('Rentang tanggal yang dipilih memiliki tanggal yang sudah dibooking.');
          return;
        }

        onSelectRange(selectedStartDate, dateStr);
      }
    }
  };

  const renderDays = () => {
    const days = [];

    // Empty slots before first day
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day other-month" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      const booked = isDateBooked(dateStr);
      const isToday = dateStr === todayStr;
      const isPast = dateStr < todayStr;
      const isStart = dateStr === selectedStartDate;
      const isEnd = dateStr === selectedEndDate;
      const isInRange =
        selectedStartDate &&
        selectedEndDate &&
        dateStr > selectedStartDate &&
        dateStr < selectedEndDate;

      let dayClasses = 'calendar-day';
      if (booked) dayClasses += ' booked';
      if (isPast) dayClasses += ' disabled';
      if (isToday) dayClasses += ' today';
      if (isStart || isEnd) dayClasses += ' selected';
      if (isInRange) dayClasses += ' in-range';

      days.push(
        <div
          key={dateStr}
          className={dayClasses}
          onClick={() => handleDateClick(dateStr)}
          title={booked ? 'Sudah Di-booking' : isPast ? 'Masa Lalu' : `Pilih ${dateStr}`}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="calendar-wrapper">
      <div className="calendar-header">
        <h3>{MONTHS[month]} {year}</h3>
        <div className="calendar-nav">
          <button type="button" onClick={handlePrevMonth}>
            <FiChevronLeft />
          </button>
          <button type="button" onClick={handleNextMonth}>
            <FiChevronRight />
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        {DAYS.map((d) => (
          <div key={d} className="calendar-day-header">
            {d}
          </div>
        ))}
        {renderDays()}
      </div>

      <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '12px', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--primary)' }} />
          <span>Dipilih</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(225, 112, 85, 0.4)' }} />
          <span>Sudah Dibooking</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--bg-glass-hover)', border: '1px solid var(--border-glass)' }} />
          <span>Tersedia</span>
        </div>
      </div>
    </div>
  );
};

export default EventCalendar;
