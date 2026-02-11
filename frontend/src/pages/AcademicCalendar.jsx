import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import toast from 'react-hot-toast';

const AcademicCalendar = () => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/calendar', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const formattedEvents = res.data.map(event => ({
                id: event._id,
                title: event.title,
                start: event.startDate,
                end: event.endDate, // FullCalendar end date is exclusive
                backgroundColor: getEventColor(event.type),
                borderColor: getEventColor(event.type),
                extendedProps: {
                    description: event.description,
                    type: event.type
                }
            }));
            setEvents(formattedEvents);
        } catch (error) {
            console.error('Failed to fetch calendar events', error);
        }
    };

    const getEventColor = (type) => {
        switch (type) {
            case 'Holiday': return '#ef4444'; // Red
            case 'Exam': return '#f59e0b'; // Amber
            case 'Semester Start': return '#10b981'; // Green
            case 'Semester End': return '#3b82f6'; // Blue
            default: return '#6366f1'; // Indigo
        }
    };

    const handleDateClick = async (arg) => {
        const title = prompt('Enter Event Title:');
        if (title) {
            try {
                const token = localStorage.getItem('token');
                const newEvent = {
                    title,
                    startDate: arg.dateStr,
                    endDate: arg.dateStr,
                    type: 'Event',
                    universityId: 'dummy' // Processed by backend
                };

                await axios.post('http://localhost:5000/calendar', newEvent, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Event Added');
                fetchEvents();
            } catch (error) {
                toast.error('Failed to add event');
            }
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-md min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Academic Calendar</h1>
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events}
                dateClick={handleDateClick}
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,dayGridWeek'
                }}
                height="auto"
            />
        </div>
    );
};

export default AcademicCalendar;
