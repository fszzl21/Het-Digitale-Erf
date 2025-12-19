import { PlusCircle, UserPlus, ClipboardList } from 'lucide-react';
import { useState, useMemo } from 'react';
import { api } from '../lib/api';
import { toast } from 'sonner';

export function QuickActions() {
  const [showNewReservation, setShowNewReservation] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newReservation, setNewReservation] = useState({
    name: '',
    plaats: '',
    checkIn: '',
    checkOut: '',
    gasten: ''
  });

  const [checkInData, setCheckInData] = useState({
    reservationId: '',
    name: ''
  });

  const handleNewReservation = async () => {
    console.log('handleNewReservation called with:', newReservation);
    console.log('name:', newReservation.name, 'truthy:', !!newReservation.name);
    console.log('plaats:', newReservation.plaats, 'truthy:', !!newReservation.plaats);
    console.log('checkIn:', newReservation.checkIn, 'truthy:', !!newReservation.checkIn);
    console.log('checkOut:', newReservation.checkOut, 'truthy:', !!newReservation.checkOut);
    console.log('gasten:', newReservation.gasten, 'truthy:', !!newReservation.gasten);

    if (newReservation.name && newReservation.plaats && newReservation.checkIn && newReservation.checkOut && newReservation.gasten) {
      setIsSubmitting(true);
      try {
        await api.createReservation({
          guest_name: newReservation.name,
          pitch_number: newReservation.plaats,
          start_date: newReservation.checkIn,
          end_date: newReservation.checkOut,
          guest_count: parseInt(newReservation.gasten),
          status: 'Bevestigd'
        });
        toast.success(`Reservering toegevoegd voor ${newReservation.name}`);
        setNewReservation({ name: '', plaats: '', checkIn: '', checkOut: '', gasten: '' });
        setShowNewReservation(false);
      } catch (error) {
        console.error('Error creating reservation:', error);
        toast.error('Kon reservering niet toevoegen');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.log('Validation failed!');
      toast.error('Vul alle velden in');
    }
  };

  const handleCheckIn = () => {
    if (checkInData.reservationId || checkInData.name) {
      alert(`Gast ${checkInData.name || checkInData.reservationId} is ingecheckt`);
      setCheckInData({ reservationId: '', name: '' });
      setShowCheckIn(false);
    }
  };

  // Generate availability data for 50 spots - memoized to prevent re-generation
  const availabilitySpots = useMemo(() => {
    const spots = [];
    const sections = ['A', 'B', 'C', 'D', 'E'];

    for (const section of sections) {
      for (let i = 1; i <= 10; i++) {
        spots.push({
          id: `${section}${i.toString().padStart(2, '0')}`,
          status: Math.random() > 0.3 ? 'bezet' : 'beschikbaar'
        });
      }
    }
    return spots;
  }, []);

  const actions = [
    {
      title: 'Nieuwe Reservering',
      icon: PlusCircle,
      color: 'bg-green-700 hover:bg-green-800',
      onClick: () => setShowNewReservation(true)
    },
    {
      title: 'Gast Inchecken',
      icon: UserPlus,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => setShowCheckIn(true)
    },
    {
      title: 'Beschikbaarheid',
      icon: ClipboardList,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => setShowAvailability(true)
    }
  ];

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-gray-900 mb-6">Snelle Acties</h2>

        <div className="space-y-3">
          {actions.map((action) => (
            <button
              key={action.title}
              onClick={action.onClick}
              className={`w-full flex items-center gap-3 px-4 py-3 ${action.color} text-white rounded-lg transition-colors`}
            >
              <action.icon className="w-5 h-5" />
              <span>{action.title}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <h3 className="text-sm text-gray-900 mb-3">Vandaag</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Check-ins</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">8</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Check-outs</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Nieuwe reserveringen</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">12</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nieuwe Reservering Modal */}
      {showNewReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-green-700 text-white p-6 rounded-t-2xl">
              <h3 className="text-white flex items-center gap-2">
                <PlusCircle className="w-6 h-6" />
                Nieuwe Reservering
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Naam</label>
                <input
                  type="text"
                  value={newReservation.name}
                  onChange={(e) => setNewReservation({ ...newReservation, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                  placeholder="Naam gast..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Plaats</label>
                <input
                  type="text"
                  value={newReservation.plaats}
                  onChange={(e) => setNewReservation({ ...newReservation, plaats: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                  placeholder="Bijv. A12"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Check-in</label>
                  <input
                    type="date"
                    value={newReservation.checkIn}
                    onChange={(e) => setNewReservation({ ...newReservation, checkIn: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Check-out</label>
                  <input
                    type="date"
                    value={newReservation.checkOut}
                    onChange={(e) => setNewReservation({ ...newReservation, checkOut: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Aantal Gasten</label>
                <input
                  type="number"
                  value={newReservation.gasten}
                  onChange={(e) => setNewReservation({ ...newReservation, gasten: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                  placeholder="Aantal gasten..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleNewReservation}
                  className="flex-1 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
                >
                  Reservering Toevoegen
                </button>
                <button
                  onClick={() => setShowNewReservation(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuleren
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Check-in Modal */}
      {showCheckIn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-blue-600 text-white p-6 rounded-t-2xl">
              <h3 className="text-white flex items-center gap-2">
                <UserPlus className="w-6 h-6" />
                Gast Inchecken
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Reservering ID</label>
                <input
                  type="text"
                  value={checkInData.reservationId}
                  onChange={(e) => setCheckInData({ ...checkInData, reservationId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Bijv. RES-001"
                />
              </div>
              <div className="text-center text-sm text-gray-500">of</div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Naam Gast</label>
                <input
                  type="text"
                  value={checkInData.name}
                  onChange={(e) => setCheckInData({ ...checkInData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Naam zoeken..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCheckIn}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Check-in Voltooien
                </button>
                <button
                  onClick={() => setShowCheckIn(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuleren
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Beschikbaarheid Modal */}
      {showAvailability && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-purple-600 text-white p-6 rounded-t-2xl">
              <h3 className="text-white flex items-center gap-2">
                <ClipboardList className="w-6 h-6" />
                Beschikbaarheid Campingplaatsen
              </h3>
              <p className="text-purple-100 text-sm mt-1">50 Totale Plaatsen</p>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="flex gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-600">Beschikbaar</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm text-gray-600">Bezet</span>
                </div>
              </div>

              <div className="space-y-6">
                {['A', 'B', 'C', 'D', 'E'].map(section => (
                  <div key={section}>
                    <h4 className="text-gray-900 mb-3">Sectie {section}</h4>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                      {availabilitySpots
                        .filter(spot => spot.id.startsWith(section))
                        .map(spot => (
                          <div
                            key={spot.id}
                            className={`aspect-square flex items-center justify-center rounded-lg text-white text-sm cursor-pointer transition-all hover:scale-105 ${spot.status === 'beschikbaar'
                              ? 'bg-green-500 hover:bg-green-600'
                              : 'bg-red-500 hover:bg-red-600'
                              }`}
                            title={`${spot.id} - ${spot.status}`}
                          >
                            {spot.id}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowAvailability(false)}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}