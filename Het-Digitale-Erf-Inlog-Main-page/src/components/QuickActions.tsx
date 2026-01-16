import { PlusCircle, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { api } from '../lib/api';
import { toast } from 'sonner';

export function QuickActions() {
  const [showNewReservation, setShowNewReservation] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
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
    }
  ];

  return (
    <>
      <div className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-border">
        <h2 className="text-gray-900 dark:text-foreground mb-6">Snelle Acties</h2>

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

        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-border">
          <h3 className="text-sm text-gray-900 dark:text-foreground mb-3">Vandaag</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-muted-foreground">Check-ins</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded">8</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-muted-foreground">Check-outs</span>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded">5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-muted-foreground">Nieuwe reserveringen</span>
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded">12</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nieuwe Reservering Modal */}
      {showNewReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-card rounded-2xl shadow-2xl max-w-md w-full">
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-input dark:bg-background dark:text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                  placeholder="Naam gast..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Plaats</label>
                <input
                  type="text"
                  value={newReservation.plaats}
                  onChange={(e) => setNewReservation({ ...newReservation, plaats: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-input dark:bg-background dark:text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 dark:border-input dark:bg-background dark:text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Check-out</label>
                  <input
                    type="date"
                    value={newReservation.checkOut}
                    onChange={(e) => setNewReservation({ ...newReservation, checkOut: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-input dark:bg-background dark:text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Aantal Gasten</label>
                <input
                  type="number"
                  value={newReservation.gasten}
                  onChange={(e) => setNewReservation({ ...newReservation, gasten: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-input dark:bg-background dark:text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                  placeholder="Aantal gasten..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleNewReservation}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Bezig...' : 'Reservering Toevoegen'}
                </button>
                <button
                  onClick={() => setShowNewReservation(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-input dark:bg-background dark:text-foreground text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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
          <div className="bg-white dark:bg-card rounded-2xl shadow-2xl max-w-md w-full">
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-input dark:bg-background dark:text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-input dark:bg-background dark:text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-input dark:bg-background dark:text-foreground text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuleren
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}