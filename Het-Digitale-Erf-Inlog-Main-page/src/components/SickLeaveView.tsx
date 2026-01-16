import { useState, useMemo, useEffect } from 'react';
import { Plus, AlertCircle, Calendar, User, Check, Trash2 } from 'lucide-react';
import { api, Absence } from '../lib/api';
import { toast } from 'sonner';

export function SickLeaveView() {
  const [sickLeaves, setSickLeaves] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSickLeave, setNewSickLeave] = useState({
    employee: '',
    type: 'ziekte',
    start_date: '',
    end_date: '',
    reason: ''
  });

  const fetchAbsences = async () => {
    try {
      setLoading(true);
      const data = await api.getAbsences();
      setSickLeaves(data);
      setError(null);
    } catch (err) {
      console.error('Error loading absences:', err);
      setError('Kon ziekmeldingen niet laden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbsences();
  }, []);

  const addSickLeave = async () => {
    console.log('addSickLeave called with:', newSickLeave);
    if (newSickLeave.employee && newSickLeave.start_date) {
      try {
        await api.createAbsence({
          employee: newSickLeave.employee,
          type: newSickLeave.type,
          start_date: newSickLeave.start_date,
          end_date: newSickLeave.end_date || undefined,
          reason: newSickLeave.reason || undefined
        });
        toast.success(`Ziekmelding toegevoegd voor ${newSickLeave.employee}`);
        setNewSickLeave({ employee: '', type: 'ziekte', start_date: '', end_date: '', reason: '' });
        setShowAddForm(false);
        fetchAbsences();
      } catch (err) {
        console.error('Error adding absence:', err);
        toast.error('Kon ziekmelding niet toevoegen');
      }
    } else {
      toast.error('Vul medewerker en startdatum in');
    }
  };

  const markAsEnded = async (id: number) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await api.updateAbsence(id, { end_date: today });
      fetchAbsences();
    } catch (err) {
      console.error('Error updating absence:', err);
    }
  };

  const deleteAbsence = async (id: number) => {
    try {
      await api.deleteAbsence(id);
      fetchAbsences();
    } catch (err) {
      console.error('Error deleting absence:', err);
    }
  };

  const isActive = (absence: Absence) => {
    if (!absence.end_date) return true;
    const endDate = new Date(absence.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return endDate >= today;
  };

  const activeSickLeaves = useMemo(() =>
    sickLeaves.filter(sl => isActive(sl)),
    [sickLeaves]
  );

  const pastSickLeaves = useMemo(() =>
    sickLeaves.filter(sl => !isActive(sl)),
    [sickLeaves]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Laden...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-gray-900 dark:text-foreground">Ziekte & Verzuim Beheer</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Ziekmelding Toevoegen
        </button>
      </div>

      {/* Add Sick Leave Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-border">
          <h3 className="text-gray-900 dark:text-foreground mb-4">Nieuwe Ziekmelding</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 dark:text-muted-foreground mb-2">Medewerker</label>
              <input
                type="text"
                value={newSickLeave.employee}
                onChange={(e) => setNewSickLeave({ ...newSickLeave, employee: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-input dark:bg-background dark:text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                placeholder="Naam medewerker..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-muted-foreground mb-2">Startdatum</label>
                <input
                  type="date"
                  value={newSickLeave.start_date}
                  onChange={(e) => setNewSickLeave({ ...newSickLeave, start_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-input dark:bg-background dark:text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-muted-foreground mb-2">Verwachte einddatum (optioneel)</label>
                <input
                  type="date"
                  value={newSickLeave.end_date}
                  onChange={(e) => setNewSickLeave({ ...newSickLeave, end_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-input dark:bg-background dark:text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-muted-foreground mb-2">Reden (optioneel)</label>
              <textarea
                value={newSickLeave.reason}
                onChange={(e) => setNewSickLeave({ ...newSickLeave, reason: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-input dark:bg-background dark:text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                rows={3}
                placeholder="Korte beschrijving..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={addSickLeave}
                className="flex-1 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
              >
                Ziekmelding Toevoegen
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-input text-gray-700 dark:text-foreground rounded-lg hover:bg-gray-50 dark:hover:bg-muted transition-colors"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Sick Leaves */}
      <div>
        <h3 className="text-gray-900 dark:text-foreground mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          Actieve Ziekmeldingen
        </h3>
        <div className="space-y-4">
          {activeSickLeaves.map((sickLeave) => (
            <div key={sickLeave.id} className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border-l-4 border-l-red-500 border-t border-r border-b border-gray-100 dark:border-border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-600 dark:text-muted-foreground" />
                  <h4 className="text-gray-900 dark:text-foreground">{sickLeave.employee}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => markAsEnded(sickLeave.id)}
                    className="p-1 text-green-600 hover:text-green-700 transition-colors"
                    title="Markeer als beëindigd"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteAbsence(sickLeave.id)}
                    className="p-1 text-red-600 hover:text-red-700 transition-colors"
                    title="Verwijderen"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                    Actief
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Van: {new Date(sickLeave.start_date).toLocaleDateString('nl-NL')}</span>
                  {sickLeave.end_date && (
                    <span>- Tot: {new Date(sickLeave.end_date).toLocaleDateString('nl-NL')}</span>
                  )}
                </div>
                {sickLeave.reason && (
                  <p className="text-sm text-gray-600 dark:text-muted-foreground">Reden: {sickLeave.reason}</p>
                )}
              </div>
            </div>
          ))}
          {activeSickLeaves.length === 0 && (
            <div className="bg-white dark:bg-card p-8 rounded-xl shadow-sm border border-gray-100 dark:border-border text-center">
              <p className="text-gray-500 dark:text-muted-foreground">Geen actieve ziekmeldingen</p>
            </div>
          )}
        </div>
      </div>

      {/* Past Sick Leaves */}
      <div>
        <h3 className="text-gray-900 dark:text-foreground mb-4">Verlopen Ziekmeldingen</h3>
        <div className="space-y-4">
          {pastSickLeaves.map((sickLeave) => (
            <div key={sickLeave.id} className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-border opacity-60">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-600 dark:text-muted-foreground" />
                  <h4 className="text-gray-900 dark:text-foreground">{sickLeave.employee}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteAbsence(sickLeave.id)}
                    className="p-1 text-red-600 hover:text-red-700 transition-colors"
                    title="Verwijderen"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    Afgelopen
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Van: {new Date(sickLeave.start_date).toLocaleDateString('nl-NL')}</span>
                  {sickLeave.end_date && (
                    <span>- Tot: {new Date(sickLeave.end_date).toLocaleDateString('nl-NL')}</span>
                  )}
                </div>
                {sickLeave.reason && (
                  <p className="text-sm text-gray-600 dark:text-muted-foreground">Reden: {sickLeave.reason}</p>
                )}
              </div>
            </div>
          ))}
          {pastSickLeaves.length === 0 && (
            <div className="bg-white dark:bg-card p-8 rounded-xl shadow-sm border border-gray-100 dark:border-border text-center">
              <p className="text-gray-500 dark:text-muted-foreground">Geen verlopen ziekmeldingen</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}