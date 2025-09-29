import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const CalendarContainer = styled.div`
  padding: 20px;
  color: white;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const PageTitle = styled.h1`
  color: white;
  margin: 0;
`;

const AddEventButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  }
`;

const CalendarWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
`;

const CalendarView = styled.div`
  background: #2a2a2a;
  border-radius: 12px;
  padding: 20px;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const MonthSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const NavButton = styled.button`
  background: #444;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background: #555;
  }
`;

const MonthYear = styled.h2`
  color: white;
  margin: 0;
  font-size: 24px;
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
`;

const DayHeader = styled.div`
  text-align: center;
  font-weight: 600;
  color: #aaa;
  padding: 10px;
  font-size: 14px;
`;

const DayCell = styled.div`
  background: ${props => props.isCurrentMonth ? '#333' : '#222'};
  border: 2px solid ${props => props.isToday ? '#667eea' : 'transparent'};
  border-radius: 8px;
  padding: 8px;
  min-height: 120px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #3a3a3a;
  }
`;

const DayNumber = styled.div`
  text-align: right;
  font-weight: 600;
  margin-bottom: 4px;
  color: ${props => props.isCurrentDay ? '#667eea' : props.isCurrentMonth ? 'white' : '#666'};
`;

const EventIndicator = styled.div`
  background: #f39c12;
  color: white;
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 4px;
  margin: 2px 0;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ReminderIndicator = styled.div`
  background: #e74c3c;
  color: white;
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 4px;
  margin: 2px 0;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SidebarContent = styled.div`
  background: #2a2a2a;
  border-radius: 12px;
  padding: 20px;
  position: sticky;
  top: 20px;
`;

const SidebarTitle = styled.h3`
  color: white;
  margin: 0 0 15px 0;
  font-size: 18px;
`;

const EventsList = styled.div`
  max-height: 300px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
  }
`;

const EventItem = styled.div`
  background: #333;
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 6px;
  font-size: 14px;
`;

const EventTitle = styled.div`
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
`;

const EventTime = styled.div`
  color: #ccc;
  font-size: 12px;
  margin-bottom: 4px;
`;

const EventAssignee = styled.div`
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  display: inline-block;
`;

const EventModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #2a2a2a;
  padding: 30px;
  border-radius: 12px;
  width: 500px;
  max-width: 90vw;
`;

const ModalTitle = styled.h2`
  color: white;
  margin: 0 0 20px 0;
  font-size: 24px;
`;

const ModalForm = styled.form``;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const FormLabel = styled.label`
  display: block;
  color: white;
  margin-bottom: 8px;
  font-weight: 500;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #666;
  border-radius: 6px;
  background: #333;
  color: white;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #666;
  border-radius: 6px;
  background: #333;
  color: white;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #666;
  border-radius: 6px;
  background: #333;
  color: white;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const TimeInputs = styled.div`
  display: flex;
  gap: 10px;
`;

const TimeInput = styled(FormInput)`
  flex: 1;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 30px;
`;

const ModalButton = styled.button`
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const SaveButton = styled(ModalButton)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const CancelButton = styled(ModalButton)`
  background: #666;
  color: white;
`;

const ReminderCheckbox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
`;

const CheckboxLabel = styled.label`
  color: white;
  font-size: 14px;
`;

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadEvents();
    loadUsers();
  }, []);

  const loadEvents = () => {
    const savedEvents = localStorage.getItem('calendar_events');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  };

  const saveEvents = (newEvents) => {
    setEvents(newEvents);
    localStorage.setItem('calendar_events', JSON.stringify(newEvents));
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8080/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day) => {
    setSelectedDate(day);
    setShowModal(true);
  };

  const getMonthDates = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();

    const dates = [];

    // Previous month dates
    const prevMonth = new Date(year, month - 1);
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      dates.push(new Date(year, month - 1, prevMonthLastDay - i));
    }

    // Current month dates
    for (let i = 1; i <= lastDay.getDate(); i++) {
      dates.push(new Date(year, month, i));
    }

    // Next month dates
    const remainingCells = 42 - dates.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingCells; i++) {
      dates.push(new Date(year, month + 1, i));
    }

    return dates;
  };

  const getEventsForDay = (day) => {
    const dayKey = day.toDateString();
    return events[dayKey] || [];
  };

  const getEventsForSelectedMonth = () => {
    const monthEvents = [];
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    for (let d = monthStart; d <= monthEnd; d.setDate(d.getDate() + 1)) {
      const dayEvents = getEventsForDay(new Date(d));
      if (dayEvents.length > 0) {
        monthEvents.push(...dayEvents);
      }
    }
    return monthEvents;
  };

  const formatTime = (timeStr) => {
    return timeStr; // HH:MM format
  };

  const getAssigneeName = (assigneeId) => {
    const user = users.find(u => u.id === assigneeId);
    return user ? user.full_name || user.username : 'Bilinmiyor';
  };

  const isToday = (day) => {
    const today = new Date();
    return day.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (day) => {
    return day.getMonth() === currentDate.getMonth();
  };

  return (
    <CalendarContainer>
      <PageHeader>
        <PageTitle>Takvim & Hatırlatımlar</PageTitle>
        <AddEventButton onClick={() => setShowModal(true)}>
          ➕ Etkinlik Ekle
        </AddEventButton>
      </PageHeader>

      <CalendarWrapper>
        <CalendarView>
          <CalendarHeader>
            <MonthSelector>
              <NavButton onClick={handlePrevMonth}>◀</NavButton>
              <MonthYear>
                {currentDate.toLocaleDateString('tr-TR', {
                  month: 'long',
                  year: 'numeric'
                })}
              </MonthYear>
              <NavButton onClick={handleNextMonth}>▶</NavButton>
            </MonthSelector>
          </CalendarHeader>

          <DaysGrid>
            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
              <DayHeader key={day}>{day}</DayHeader>
            ))}

            {getMonthDates().map((day, index) => {
              const dayEvents = getEventsForDay(day);
              const isTodayDate = isToday(day);
              const isCurrentMonthDay = isCurrentMonth(day);

              return (
                <DayCell
                  key={index}
                  isCurrentMonth={isCurrentMonthDay}
                  isToday={isTodayDate}
                  onClick={() => handleDayClick(day)}
                >
                  <DayNumber
                    isCurrentDay={isTodayDate}
                    isCurrentMonth={isCurrentMonthDay}
                  >
                    {day.getDate()}
                  </DayNumber>

                  {dayEvents.map((event, eventIndex) => (
                    <div key={eventIndex}>
                      {event.reminder ? (
                        <ReminderIndicator>
                          🔔 {event.time} - {event.title}
                        </ReminderIndicator>
                      ) : (
                        <EventIndicator>
                          📅 {event.time} - {event.title}
                        </EventIndicator>
                      )}
                    </div>
                  ))}
                </DayCell>
              );
            })}
          </DaysGrid>
        </CalendarView>

        <SidebarContent>
          <SidebarTitle>Aylık Etkinlikler</SidebarTitle>
          <EventsList>
            {getEventsForSelectedMonth().map((event, index) => (
              <EventItem key={index}>
                <EventTitle>{event.title}</EventTitle>
                <EventTime>
                  {new Date(event.date).toLocaleDateString('tr-TR')} {formatTime(event.time)}
                </EventTime>
                {event.assigned_to && (
                  <EventAssignee>👤 {getAssigneeName(parseInt(event.assigned_to))}</EventAssignee>
                )}
                {event.description && (
                  <div style={{ color: '#ccc', fontSize: '13px', marginTop: '4px' }}>
                    {event.description}
                  </div>
                )}
              </EventItem>
            ))}
          </EventsList>
        </SidebarContent>
      </CalendarWrapper>

      {showModal && (
        <EventModal onClick={() => setShowModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalTitle>Yeni Etkinlik</ModalTitle>
            <EventForm
              selectedDate={selectedDate}
              users={users}
              onSave={(eventData) => {
                const dayKey = selectedDate.toDateString();
                const currentEvents = { ...events };
                if (!currentEvents[dayKey]) {
                  currentEvents[dayKey] = [];
                }
                currentEvents[dayKey].push({
                  id: Date.now().toString(),
                  date: selectedDate.toISOString(),
                  ...eventData
                });
                saveEvents(currentEvents);
                setShowModal(false);
              }}
              onCancel={() => setShowModal(false)}
            />
          </ModalContent>
        </EventModal>
      )}
    </CalendarContainer>
  );
}

function EventForm({ selectedDate, users, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time: '10:00',
    assigned_to: '',
    reminder: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <ModalForm onSubmit={handleSubmit}>
      <FormGroup>
        <FormLabel>Başlık</FormLabel>
        <FormInput
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="Etkinlik başlığı..."
        />
      </FormGroup>

      <FormGroup>
        <FormLabel>Açıklama</FormLabel>
        <FormTextarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Etkinlik detayları..."
        />
      </FormGroup>

      <FormGroup>
        <FormLabel>Saat</FormLabel>
        <FormInput
          type="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
        />
      </FormGroup>

      <FormGroup>
        <FormLabel>Tarih</FormLabel>
        <FormInput
          type="date"
          value={selectedDate.toISOString().split('T')[0]}
          disabled
        />
      </FormGroup>

      <FormGroup>
        <FormLabel>Atanacak Kişi</FormLabel>
        <FormSelect
          name="assigned_to"
          value={formData.assigned_to}
          onChange={handleChange}
        >
          <option value="">Seçin...</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.full_name || user.username}
            </option>
          ))}
        </FormSelect>
      </FormGroup>

      <ReminderCheckbox>
        <Checkbox
          type="checkbox"
          name="reminder"
          checked={formData.reminder}
          onChange={handleChange}
          id="reminder"
        />
        <CheckboxLabel htmlFor="reminder">
          ⏰ Hatırlatma etkinleştir
        </CheckboxLabel>
      </ReminderCheckbox>

      <ModalActions>
        <CancelButton type="button" onClick={onCancel}>
          İptal
        </CancelButton>
        <SaveButton type="submit">
          Kaydet
        </SaveButton>
      </ModalActions>
    </ModalForm>
  );
}

export default Calendar;
