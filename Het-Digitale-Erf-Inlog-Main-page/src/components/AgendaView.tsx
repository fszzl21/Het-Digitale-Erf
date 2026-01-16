import { CalendarView } from './calendar/CalendarView';

export function AgendaView() {
  return (
    <div className="min-h-[800px] h-auto bg-white dark:bg-card rounded-xl shadow-sm border border-gray-100 dark:border-border overflow-visible">
      <CalendarView />
    </div>
  );
}
