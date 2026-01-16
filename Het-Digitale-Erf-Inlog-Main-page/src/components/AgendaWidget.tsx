
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Calendar, Clock, ChevronRight } from 'lucide-react';

interface CalendarEvent {
    id: number;
    title: string;
    type: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
}

export function AgendaWidget() {
    const [appointments, setAppointments] = useState<CalendarEvent[]>([]);

    useEffect(() => {
        api.getAppointments().then(data => {
            // Filter for upcoming events (today or later)
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];

            const upcoming = data
                .filter((a: CalendarEvent) => a.start_date >= todayStr)
                .sort((a: CalendarEvent, b: CalendarEvent) => {
                    const dtA = a.start_date + a.start_time;
                    const dtB = b.start_date + b.start_time;
                    return dtA.localeCompare(dtB);
                })
                .slice(0, 3); // Top 3
            setAppointments(upcoming);
        }).catch(err => console.error(err));
    }, []);

    return (
        <div className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-border h-full transition-colors">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-600 dark:text-green-500" />
                    Agenda
                </h3>
                <button className="text-xs text-green-600 dark:text-green-400 hover:underline flex items-center">
                    Meer <ChevronRight className="w-3 h-3" />
                </button>
            </div>

            <div className="space-y-3">
                {appointments.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 dark:text-muted-foreground text-sm">
                        Geen afspraken gepland
                    </div>
                ) : (
                    appointments.map(app => (
                        <div key={app.id} className="group flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                            <div className="flex-shrink-0 w-10 text-center bg-green-50 dark:bg-green-900/20 rounded border border-green-100 dark:border-green-800 py-1">
                                <div className="text-[10px] text-green-700 dark:text-green-400 font-bold uppercase leading-none mb-0.5">
                                    {new Date(app.start_date).toLocaleDateString('nl-NL', { month: 'short' }).slice(0, 3)}
                                </div>
                                <div className="text-sm font-bold text-green-900 dark:text-green-100 leading-none">
                                    {new Date(app.start_date).getDate()}
                                </div>
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="font-medium text-gray-900 dark:text-gray-200 truncate text-sm">{app.title}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {app.start_time.slice(0, 5)} - {app.end_time.slice(0, 5)}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
