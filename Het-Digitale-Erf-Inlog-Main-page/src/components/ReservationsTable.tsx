import { Search, Filter, ChevronDown, Loader2 } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { api, Reservation } from '../lib/api';
import { toast } from 'sonner';

interface ReservationsTableProps {
  limit?: number;
}

export function ReservationsTable({ limit }: ReservationsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('none');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const data = await api.getReservations();
        setReservations(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching reservations:', err);
        setError('Kon reserveringen niet laden.');
        toast.error('Ophalen reserveringen mislukt');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  // Map API data to displayed format
  const mappedReservations = useMemo(() => {
    return reservations.map((res: Reservation) => ({
      id: `RES-${res.id}`,
      name: res.guest_name,
      plaats: res.pitch_number,
      checkIn: res.start_date,
      checkOut: res.end_date,
      gasten: res.guest_count,
      status: res.status
    }));
  }, [reservations]);

  const displayedReservations = useMemo(() =>
    limit ? mappedReservations.slice(0, limit) : mappedReservations,
    [limit, mappedReservations]
  );

  const statusColors: Record<string, string> = {
    'Bevestigd': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'confirmed': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Ingecheckt': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'checked_in': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Geannuleerd': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'cancelled': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'Uitgecheckt': 'bg-gray-100 text-gray-700 dark:bg-muted dark:text-muted-foreground',
    'checked_out': 'bg-gray-100 text-gray-700 dark:bg-muted dark:text-muted-foreground'
  };

  const getStatusColor = (status: string) => statusColors[status] || 'bg-gray-100 text-gray-700';

  // Filter/Sort logic
  const applyFilter = (filter: string) => {
    setActiveFilter(filter);
    setShowFilterMenu(false);
  };

  const sortedReservations = useMemo(() => {
    let sorted = [...displayedReservations];

    switch (activeFilter) {
      case 'plaats-az':
        sorted.sort((a, b) => a.plaats.localeCompare(b.plaats));
        break;
      case 'plaats-za':
        sorted.sort((a, b) => b.plaats.localeCompare(a.plaats));
        break;
      case 'checkin-recent':
        sorted.sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());
        break;
      case 'checkin-oudste':
        sorted.sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime());
        break;
      case 'gasten-hoog':
        sorted.sort((a, b) => b.gasten - a.gasten);
        break;
      case 'gasten-laag':
        sorted.sort((a, b) => a.gasten - b.gasten);
        break;
    }
    return sorted;
  }, [displayedReservations, activeFilter]);


  const filterOptions = [
    { label: 'Plaats A-Z', value: 'plaats-az' },
    { label: 'Plaats Z-A', value: 'plaats-za' },
    { label: 'Check-in (Meest Recent)', value: 'checkin-recent' },
    { label: 'Check-in (Minst Recent)', value: 'checkin-oudste' },
    { label: 'Gasten (Hoog-Laag)', value: 'gasten-hoog' },
    { label: 'Gasten (Laag-Hoog)', value: 'gasten-laag' }
  ];

  const getFilterLabel = () => {
    const option = filterOptions.find(opt => opt.value === activeFilter);
    return option ? option.label : 'Filter';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-100 dark:border-border p-12 flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-green-700 dark:text-green-500 animate-spin" />
        <span className="ml-3 text-gray-600 dark:text-muted-foreground">Reserveringen laden...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-100 dark:border-border p-8 text-center text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-100 dark:border-border">
      <div className="p-6 border-b border-gray-100 dark:border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-900 dark:text-foreground">Recente Reserveringen</h2>
          {limit && (
            <button className="text-sm text-green-700 hover:text-green-800">
              Alles bekijken →
            </button>
          )}
        </div>

        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Zoek reserveringen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-input dark:bg-background dark:text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${activeFilter !== 'none'
                ? 'border-green-700 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'border-gray-300 dark:border-input hover:bg-gray-50 dark:hover:bg-muted text-gray-700 dark:text-foreground'
                }`}
            >
              <Filter className="w-5 h-5" />
              <span>{getFilterLabel()}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Filter Dropdown Menu */}
            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-popover rounded-lg shadow-lg border border-gray-200 dark:border-border z-10">
                <div className="p-2">
                  <div className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wider">
                    Sorteer Op
                  </div>
                  {activeFilter !== 'none' && (
                    <button
                      onClick={() => applyFilter('none')}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      Filter Verwijderen
                    </button>
                  )}
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => applyFilter(option.value)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${activeFilter === option.value
                        ? 'bg-green-700 text-white'
                        : 'text-gray-700 dark:text-foreground hover:bg-gray-100 dark:hover:bg-muted'
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-muted/50 border-b border-gray-100 dark:border-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs text-gray-600 dark:text-muted-foreground uppercase tracking-wider">
                Reservering ID
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-600 dark:text-muted-foreground uppercase tracking-wider">
                Naam
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-600 dark:text-muted-foreground uppercase tracking-wider">
                Plaats
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-600 dark:text-muted-foreground uppercase tracking-wider">
                Check-in
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-600 dark:text-muted-foreground uppercase tracking-wider">
                Check-out
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-600 dark:text-muted-foreground uppercase tracking-wider">
                Gasten
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-600 dark:text-muted-foreground uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-border">
            {sortedReservations.length > 0 ? (
              sortedReservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-gray-50 dark:hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-foreground">
                    {reservation.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-foreground">
                    {reservation.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-foreground">
                    {reservation.plaats}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-muted-foreground">
                    {reservation.checkIn}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-muted-foreground">
                    {reservation.checkOut}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-muted-foreground">
                    {reservation.gasten}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 text-xs rounded-full ${getStatusColor(reservation.status)}`}>
                      {reservation.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-muted-foreground">
                  Geen reserveringen gevonden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}