import { Calendar } from 'lucide-react';

export function AgendaView() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
      <div className="text-center max-w-md mx-auto">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <Calendar className="w-10 h-10 text-green-700" />
        </div>
        <h2 className="text-gray-900 mb-3">Agenda Module</h2>
        <p className="text-gray-600 mb-8">
          Deze module is in ontwikkeling. Hier kunt u binnenkort alle camping afspraken en planningen bekijken.
        </p>
        <button className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors">
          Binnenkort Beschikbaar
        </button>
      </div>
    </div>
  );
}
