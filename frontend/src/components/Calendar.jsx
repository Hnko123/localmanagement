import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const CalendarContainer = styled.div`
  min-height: 100vh;
  background: #1a1a1a;
  padding: 0;
  margin: 0;
`;

const PageHeader = styled.div`
  background: #2a2a2a;
  border-bottom: 1px solid #3a3a3a;
  padding: 20px 30px;
  
  h1 {
    color: white;
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 8px 0;
  }
  
  p {
    color: #a0a0a0;
    margin: 0;
    font-size: 14px;
  }
`;

const ContentArea = styled.div`
  padding: 30px;
`;

const CalendarGrid = styled.div`
  background: #2a2a2a;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 30px;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 20px;
  
  h2 {
    color: white;
    font-size: 20px;
    font-weight: 600;
  }
  
  .nav-buttons {
    display: flex;
    gap: 10px;
  }
  
  button {
    background: #3a3a3a;
    border: none;
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    
    &:hover {
      background: #4a4a4a;
    }
  }
`;

const WeekDays = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 1px;
`;

const WeekDay = styled.div`
  background: #333;
  color: #a0a0a0;
  padding: 12px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
`;

const CalendarDays = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
`;

const CalendarDay = styled.div`
  background: ${props => props.isToday ? '#667eea' : '#2a2a2a'};
  color: ${props => props.isOtherMonth ? '#666' : 'white'};
  padding: 12px 8px;
  min-height: 80px;
  border: 1px solid #3a3a3a;
  cursor: pointer;
  position: relative;
  
  &:hover {
    background: ${props => props.isToday ? '#5a6fd8' : '#333'};
  }
  
  .day-number {
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .day-events {
    font-size: 10px;
    color: #a0a0a0;
  }
  
  .note-indicator {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 8px;
    height: 8px;
    background: #4CAF50;
    border-radius: 50%;
    display: ${props => props.hasNote ? 'block' : 'none'};
  }
`;

const EventsList = styled.div`
  background: #2a2a2a;
  border-radius: 12px;
  padding: 24px;
`;

const EventItem = styled.div`
  background: #333;
  border-left: 4px solid ${props => props.color || '#667eea'};
  padding: 12px 16px;
  margin-bottom: 12px;
  border-radius: 0 8px 8px 0;
  
  .event-title {
    color: white;
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .event-time {
    color: #a0a0a0;
    font-size: 12px;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #2a2a2a;
  border-radius: 12px;
  padding: 24px;
  width: 400px;
  max-width: 90vw;
  
  h3 {
    color: white;
    margin-bottom: 16px;
  }
  
  textarea {
    width: 100%;
    height: 120px;
    background: #333;
    border: 1px solid #555;
    border-radius: 6px;
    color: white;
    padding: 12px;
    resize: vertical;
    font-family: inherit;
    
    &::placeholder {
      color: #999;
    }
  }
  
  .modal-buttons {
    display: flex;
    gap: 12px;
    margin-top: 16px;
    justify-content: flex-end;
    
    button {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      
      &.save-btn {
        background: #4CAF50;
        color: white;
        
        &:hover {
          background: #45a049;
        }
      }
      
      &.cancel-btn {
        background: #666;
        color: white;
        
        &:hover {
          background: #777;
        }
      }
    }
  }
`;

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  
  // localStorage'dan notları yükle
  const loadNotes = () => {
    try {
      const savedNotes = localStorage.getItem('calendar-notes');
      return savedNotes ? JSON.parse(savedNotes) : {};
    } catch (error) {
      console.error('Notlar yüklenirken hata:', error);
      return {};
    }
  };
  
  const [dayNotes, setDayNotes] = useState(loadNotes);

  // dayNotes değiştiğinde localStorage'a kaydet
  useEffect(() => {
    try {
      localStorage.setItem('calendar-notes', JSON.stringify(dayNotes));
    } catch (error) {
      console.error('Notlar kaydedilirken hata:', error);
    }
  }, [dayNotes]);
  
  // Handle functions
  const handlePreviousMonth = () => {
    console.log('Previous month clicked');
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    console.log('Next month clicked');
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    console.log('Today button clicked');
    setCurrentDate(new Date());
  };

  const handleDayClick = (dayInfo) => {
    console.log('Day clicked:', dayInfo);
    setSelectedDay(dayInfo);
    const dayKey = `${dayInfo.year}-${dayInfo.month}-${dayInfo.date}`;
    setNoteText(dayNotes[dayKey] || '');
    setIsModalOpen(true);
  };

  const handleSaveNote = () => {
    if (selectedDay) {
      const dayKey = `${selectedDay.year}-${selectedDay.month}-${selectedDay.date}`;
      setDayNotes(prev => ({
        ...prev,
        [dayKey]: noteText
      }));
    }
    setIsModalOpen(false);
    setNoteText('');
    setSelectedDay(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNoteText('');
    setSelectedDay(null);
  };
  
  // Basit takvim günleri oluştur
  const generateCalendarDays = () => {
    const today = new Date();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayInfo = {
        date: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        isToday: date.toDateString() === today.toDateString(),
        isOtherMonth: date.getMonth() !== currentDate.getMonth(),
        fullDate: date
      };
      
      const dayKey = `${dayInfo.year}-${dayInfo.month}-${dayInfo.date}`;
      dayInfo.hasNote = dayNotes[dayKey] && dayNotes[dayKey].length > 0;
      
      days.push(dayInfo);
    }
    return days;
  };

  const upcomingEvents = [
    {
      id: 1,
      title: "Maltese Pendant - Teslimat",
      time: "09:00",
      date: "2025-08-22",
      color: "#10b981"
    },
    {
      id: 2,
      title: "Tiger Pendant - Gravür",
      time: "14:00", 
      date: "2025-08-22",
      color: "#f59e0b"
    },
    {
      id: 3,
      title: "Phoenix Pendant - Kargo",
      time: "11:00",
      date: "2025-08-23",
      color: "#8b5cf6"
    },
    {
      id: 4,
      title: "Samoyed x3 - Üretim Başla",
      time: "08:00",
      date: "2025-08-24",
      color: "#3b82f6"
    }
  ];

  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
                     'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

  return (
    <CalendarContainer>
      <PageHeader>
        <h1>Takvim</h1>
        <p>Üretim programı ve teslimat takvibi</p>
      </PageHeader>
      <ContentArea>
        <CalendarGrid>
          <CalendarHeader>
            <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
            <div className="nav-buttons">
              <button onClick={handlePreviousMonth}>← Önceki</button>
              <button onClick={handleToday}>Bugün</button>
              <button onClick={handleNextMonth}>Sonraki →</button>
            </div>
          </CalendarHeader>
          
          <WeekDays>
            {weekDays.map(day => (
              <WeekDay key={day}>{day}</WeekDay>
            ))}
          </WeekDays>
          
          <CalendarDays>
            {generateCalendarDays().map((day, index) => (
              <CalendarDay 
                key={index}
                isToday={day.isToday}
                isOtherMonth={day.isOtherMonth}
                hasNote={day.hasNote}
                onClick={() => handleDayClick(day)}
              >
                <div className="day-number">{day.date}</div>
                <div className="day-events">
                  {day.isToday && <div>📅 Bugün</div>}
                </div>
                <div className="note-indicator"></div>
              </CalendarDay>
            ))}
          </CalendarDays>
        </CalendarGrid>
        
        <EventsList>
          <h3 style={{ color: 'white', marginBottom: '20px' }}>Yaklaşan Etkinlikler</h3>
          {upcomingEvents.map(event => (
            <EventItem key={event.id} color={event.color}>
              <div className="event-title">{event.title}</div>
              <div className="event-time">📅 {event.date} • 🕐 {event.time}</div>
            </EventItem>
          ))}
        </EventsList>
      </ContentArea>
      
      {isModalOpen && (
        <Modal onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h3>Not Ekle - {selectedDay?.date}/{selectedDay?.month + 1}/{selectedDay?.year}</h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Notunuzu buraya yazın..."
            />
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={handleCloseModal}>
                İptal
              </button>
              <button className="save-btn" onClick={handleSaveNote}>
                Kaydet
              </button>
            </div>
          </ModalContent>
        </Modal>
      )}
    </CalendarContainer>
  );
};

export default Calendar;
