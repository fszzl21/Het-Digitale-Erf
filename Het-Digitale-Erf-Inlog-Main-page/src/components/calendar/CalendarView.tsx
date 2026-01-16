
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import './calendar.css';

interface CalendarEvent {
    id: number;
    title: string;
    type: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
}

export function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'month' | 'week' | 'day'>('month');
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        type: '',
        start_date: '',
        end_date: '',
        start_time: '09:00',
        end_time: '10:00'
    });

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const data = await api.getAppointments();
            setEvents(data);
        } catch (error) {
            console.error(error);
            toast.error("Kan agenda niet laden");
        }
    };

    const handleDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            if (selectedEvent) {
                await api.updateAppointment(selectedEvent.id, payload);
                toast.success("Afspraak bijgewerkt");
            } else {
                await api.addAppointment(payload);
                toast.success("Afspraak toegevoegd");
            }
            setModalOpen(false);
            loadEvents();
        } catch (error) {
            toast.error("Fout bij opslaan");
        }
    };

    const handleDelete = async () => {
        if (!selectedEvent) return;
        if (!confirm("Weet je zeker dat je deze afspraak wilt verwijderen?")) return;
        try {
            await api.deleteAppointment(selectedEvent.id);
            toast.success("Afspraak verwijderd");
            setModalOpen(false);
            loadEvents();
        } catch (error) {
            toast.error("Fout bij verwijderen");
        }
    };

    const openAddModal = (dateStr?: string) => {
        setSelectedEvent(null);
        setFormData({
            title: '',
            type: '',
            start_date: dateStr || new Date().toISOString().split('T')[0],
            end_date: dateStr || new Date().toISOString().split('T')[0],
            start_time: '09:00',
            end_time: '10:00'
        });
        setModalOpen(true);
    };

    const openEditModal = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setFormData({
            title: event.title,
            type: event.type,
            start_date: event.start_date,
            end_date: event.end_date,
            start_time: event.start_time,
            end_time: event.end_time
        });
        setModalOpen(true);
    };

    const changeDate = (offset: number) => {
        const newDate = new Date(currentDate);
        if (view === 'month') newDate.setMonth(newDate.getMonth() + offset);
        if (view === 'week') newDate.setDate(newDate.getDate() + (offset * 7));
        if (view === 'day') newDate.setDate(newDate.getDate() + offset);
        setCurrentDate(newDate);
    };

    const getWeekDays = (date: Date) => {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay()); // Sunday
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            days.push(d);
        }
        return days;
    };

    // --- RENDERERS ---

    const renderMonth = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const blanks = Array(firstDay).fill(null);
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        return (
            <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                {['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'].map(d => (
                    <div key={d} className="day-name font-bold text-center py-2 text-gray-800 dark:text-gray-200">{d}</div>
                ))}
                {blanks.map((_, i) => <div key={`blank-${i}`} className="day bg-gray-50 dark:bg-gray-800 border-transparent"></div>)}
                {days.map(day => {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayEvents = events.filter(e => e.start_date <= dateStr && e.end_date >= dateStr);
                    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

                    return (
                        <div
                            key={day}
                            className={`day relative min-h-[100px] border p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors ${isToday ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'}`}
                            onClick={() => openAddModal(dateStr)}
                        >
                            <div className="date-number font-bold mb-1 text-gray-900 dark:text-gray-100">{day}</div>
                            {dayEvents.map(ev => (
                                <div
                                    key={ev.id}
                                    className="event bg-green-500 text-white text-xs p-1 mb-1 rounded cursor-pointer truncate hover:bg-green-600"
                                    onClick={(e) => { e.stopPropagation(); openEditModal(ev); }}
                                >
                                    {ev.title}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderWeek = () => {
        const weekDays = getWeekDays(currentDate);
        const hours = Array.from({ length: 24 }, (_, i) => i);

        return (
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                {/* Fixed Header */}
                <div className="flex border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                    <div className="w-16 flex-shrink-0 h-10 border-r border-gray-200 dark:border-gray-600 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">Tijd</div>
                    {weekDays.map((date, i) => {
                        const isToday = new Date().toDateString() === date.toDateString();
                        return (
                            <div key={i} className={`flex-1 min-w-[100px] h-10 border-r border-gray-200 dark:border-gray-600 text-center font-bold py-2 text-sm ${isToday ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' : 'text-gray-700 dark:text-gray-200'}`}>
                                {date.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric' })}
                            </div>
                        );
                    })}
                </div>
                {/* Scrollable Grid */}
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 350px)', minHeight: '400px' }}>
                    {hours.map(hour => (
                        <div key={hour} className="flex border-b border-gray-100 dark:border-gray-700">
                            <div className="w-16 flex-shrink-0 h-12 border-r border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400 text-right pr-2 pt-1">
                                {String(hour).padStart(2, '0')}:00
                            </div>
                            {weekDays.map((date, dayIdx) => {
                                const dateStr = date.toISOString().split('T')[0];
                                const isToday = new Date().toDateString() === date.toDateString();
                                const hourEvents = events.filter(e => {
                                    if (e.start_date > dateStr || e.end_date < dateStr) return false;
                                    const startHour = parseInt(e.start_time.split(':')[0]);
                                    return startHour === hour;
                                });

                                return (
                                    <div
                                        key={dayIdx}
                                        className={`flex-1 min-w-[100px] h-12 border-r border-gray-100 dark:border-gray-700 relative cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 ${isToday ? 'bg-green-50/50 dark:bg-green-900/20' : 'bg-white dark:bg-gray-800'}`}
                                        onClick={() => openAddModal(dateStr)}
                                    >
                                        {hourEvents.map(ev => (
                                            <div
                                                key={ev.id}
                                                className="absolute inset-x-1 top-0 bg-green-500 text-white text-xs p-1 rounded shadow-sm cursor-pointer hover:bg-green-600 z-10 overflow-hidden"
                                                style={{ minHeight: '20px' }}
                                                onClick={(e) => { e.stopPropagation(); openEditModal(ev); }}
                                            >
                                                <div className="font-bold truncate">{ev.title}</div>
                                                <div className="truncate">{ev.start_time} - {ev.end_time}</div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderDay = () => {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayEvents = events.filter(e => e.start_date <= dateStr && e.end_date >= dateStr);
        const hours = Array.from({ length: 24 }, (_, i) => i);

        return (
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden max-w-4xl mx-auto bg-white dark:bg-gray-800">
                {/* Header */}
                <div className="flex border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                    <div className="w-20 flex-shrink-0 h-12 border-r border-gray-200 dark:border-gray-600 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">Tijd</div>
                    <div className="flex-1 h-12 flex items-center justify-center font-bold text-gray-800 dark:text-gray-100">
                        {currentDate.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                </div>
                {/* Scrollable Grid */}
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 350px)', minHeight: '400px' }}>
                    {hours.map(hour => {
                        const hourEvents = dayEvents.filter(e => {
                            const startHour = parseInt(e.start_time.split(':')[0]);
                            return startHour === hour;
                        });

                        return (
                            <div key={hour} className="flex border-b border-gray-100 dark:border-gray-700">
                                <div className="w-20 flex-shrink-0 h-16 border-r border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-500 dark:text-gray-400 text-right pr-4 pt-2">
                                    {String(hour).padStart(2, '0')}:00
                                </div>
                                <div
                                    className="flex-1 h-16 relative cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 bg-white dark:bg-gray-800"
                                    onClick={() => openAddModal(dateStr)}
                                >
                                    {hourEvents.map(ev => (
                                        <div
                                            key={ev.id}
                                            className="absolute inset-x-2 top-1 bg-green-500 text-white text-sm p-2 rounded shadow-sm cursor-pointer hover:bg-green-600 z-10"
                                            onClick={(e) => { e.stopPropagation(); openEditModal(ev); }}
                                        >
                                            <div className="font-bold">{ev.title}</div>
                                            <div>{ev.start_time} - {ev.end_time}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="calendar-module p-6 h-full flex flex-col">
            {/* Header / Nav */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold capitalize text-gray-800 dark:text-gray-100">
                        {currentDate.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}
                    </h2>
                    <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                        <button onClick={() => changeDate(-1)} className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded shadow-sm text-gray-700 dark:text-gray-200"><ChevronLeft className="w-5 h-5" /></button>
                        <button onClick={() => setCurrentDate(new Date())} className="px-3 text-sm font-medium hover:bg-white dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-200">Vandaag</button>
                        <button onClick={() => changeDate(1)} className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded shadow-sm text-gray-700 dark:text-gray-200"><ChevronRight className="w-5 h-5" /></button>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg text-sm">
                        <button onClick={() => setView('month')} className={`px-3 py-1 rounded ${view === 'month' ? 'bg-white dark:bg-gray-600 shadow-sm font-medium text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'}`}>Maand</button>
                        <button onClick={() => setView('week')} className={`px-3 py-1 rounded ${view === 'week' ? 'bg-white dark:bg-gray-600 shadow-sm font-medium text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'}`}>Week</button>
                        <button onClick={() => setView('day')} className={`px-3 py-1 rounded ${view === 'day' ? 'bg-white dark:bg-gray-600 shadow-sm font-medium text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'}`}>Dag</button>
                    </div>
                    <button
                        onClick={() => openAddModal()}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                        <Plus className="w-4 h-4" /> Nieuwe afspraak
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 p-4">
                {view === 'month' && renderMonth()}
                {view === 'week' && renderWeek()}
                {view === 'day' && renderDay()}
            </div>

            {/* General Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{selectedEvent ? 'Afspraak bewerken' : 'Nieuwe afspraak'}</h3>
                            <button onClick={() => setModalOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Afspraak naam</label>
                                <input name="title" value={formData.title} onChange={handleDataChange} required className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" placeholder="Bijv. Vergadering" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type / Omschrijving</label>
                                <input name="type" value={formData.type} onChange={handleDataChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" placeholder="Bijv. Intern" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Datum Start</label>
                                    <input type="date" name="start_date" value={formData.start_date} onChange={handleDataChange} required className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Datum Eind</label>
                                    <input type="date" name="end_date" value={formData.end_date} onChange={handleDataChange} required className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tijd Start</label>
                                    <input type="time" name="start_time" value={formData.start_time} onChange={handleDataChange} required className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tijd Eind</label>
                                    <input type="time" name="end_time" value={formData.end_time} onChange={handleDataChange} required className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">Opslaan</button>
                                {selectedEvent && (
                                    <button type="button" onClick={handleDelete} className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg">Verwijderen</button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
