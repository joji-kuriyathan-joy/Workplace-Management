import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const CalendarView = ({ refresh, onRefreshed, onSelectEvent }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Fetch rota data from the backend and format it for the calendar
    const fetchRotaData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/get-rotas`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          if (data.length > 0) {
            setEvents(
              data.map((rota) => ({
                ...rota, // Include the whole rota data
                title: `Shift: ${Array.isArray(rota.users) ? rota.users.map(user => user.name).join(', ') : 'N/A'}`,
                start: new Date(`${rota.date} ${rota.startTime}`),
                end: new Date(`${rota.date} ${rota.endTime}`),
                id: rota.rota_id, // Ensure rota_id is used as the event id
              }))
            );
          }
        }
      } catch (error) {
        console.error('Failed to fetch rota data:', error);
      }
    };

    fetchRotaData();
    if (refresh) {
      fetchRotaData().then(() => onRefreshed());
    }
  }, [refresh, onRefreshed]);

  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 500 }}
      onSelectEvent={onSelectEvent} // Allow event selection
    />
  );
};

export default CalendarView;
