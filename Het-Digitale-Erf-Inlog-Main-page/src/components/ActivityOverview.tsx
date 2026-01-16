import { Calendar, Users, MapPin, Clock, Edit2, Trash2, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { api, Activity } from '../lib/api';

export function ActivityOverview() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await api.getActivities();
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
      toast.error(`Fout bij laden: ${errorMessage}`);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const [isNewActivityOpen, setIsNewActivityOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const [newActivity, setNewActivity] = useState({
    name: '',
    date: '',
    time: '',
    location: '',
    max_participants: '',
    description: ''
  });

  const [editActivity, setEditActivity] = useState({
    name: '',
    date: '',
    time: '',
    location: '',
    current_participants: '',
    max_participants: '',
    description: ''
  });

  const getStatus = (current: number, max: number) => {
    return current >= max ? 'Vol' : 'Bevestigd';
  };

  const statusColors: Record<string, string> = {
    'Bevestigd': 'bg-green-100 text-green-700',
    'Vol': 'bg-red-100 text-red-700'
  };

  const handleOpenDetails = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsDetailsOpen(true);
  };

  const handleOpenManage = (activity: Activity) => {
    setSelectedActivity(activity);
    setEditActivity({
      name: activity.name,
      date: activity.date,
      time: activity.time,
      location: activity.location,
      current_participants: activity.current_participants.toString(),
      max_participants: activity.max_participants.toString(),
      description: activity.description || ''
    });
    setIsManageOpen(true);
  };

  const handleAddActivity = async () => {
    if (!newActivity.name || !newActivity.date || !newActivity.time || !newActivity.location || !newActivity.max_participants) {
      toast.error('Vul alle verplichte velden in');
      return;
    }

    try {
      await api.createActivity({
        name: newActivity.name,
        date: newActivity.date,
        time: newActivity.time,
        location: newActivity.location,
        current_participants: 0,
        max_participants: parseInt(newActivity.max_participants),
        description: newActivity.description
      });

      toast.success('Activiteit toegevoegd!');
      setIsNewActivityOpen(false);
      setNewActivity({
        name: '',
        date: '',
        time: '',
        location: '',
        max_participants: '',
        description: ''
      });
      fetchActivities(); // Refresh list
    } catch (error) {
      console.error(error);
      toast.error('Kon activiteit niet toevoegen');
    }
  };

  const handleUpdateActivity = async () => {
    if (!selectedActivity) return;

    if (!editActivity.name || !editActivity.date || !editActivity.time || !editActivity.location || !editActivity.max_participants) {
      toast.error('Vul alle verplichte velden in');
      return;
    }

    try {
      const current_participants = parseInt(editActivity.current_participants) || 0;
      const max_participants = parseInt(editActivity.max_participants);

      await api.updateActivity(selectedActivity.id, {
        name: editActivity.name,
        date: editActivity.date,
        time: editActivity.time,
        location: editActivity.location,
        current_participants,
        max_participants,
        description: editActivity.description
      });

      toast.success('Activiteit bijgewerkt!');
      setIsManageOpen(false);
      fetchActivities(); // Refresh list
    } catch (error) {
      console.error(error);
      toast.error('Kon activiteit niet bijwerken');
    }
  };

  const handleDeleteActivity = async () => {
    if (!selectedActivity) return;

    try {
      await api.deleteActivity(selectedActivity.id);
      toast.success('Activiteit verwijderd!');
      setIsManageOpen(false);
      fetchActivities(); // Refresh list
    } catch (error) {
      console.error(error);
      toast.error('Kon activiteit niet verwijderen');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Activiteiten laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-gray-900 dark:text-foreground">Geplande Activiteiten</h2>
        <button
          onClick={() => setIsNewActivityOpen(true)}
          className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
        >
          + Nieuwe Activiteit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activities.map((activity) => {
          const status = getStatus(activity.current_participants, activity.max_participants);
          return (
            <div key={activity.id} className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-gray-900 dark:text-foreground">{activity.name}</h3>
                <span className={`px-3 py-1 text-xs rounded-full ${statusColors[status]}`}>
                  {status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{activity.date}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{activity.time}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{activity.location}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{activity.current_participants}/{activity.max_participants} deelnemers</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-border">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenDetails(activity)}
                    className="flex-1 px-3 py-2 text-sm text-green-700 dark:text-green-400 border border-green-700 dark:border-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handleOpenManage(activity)}
                    className="flex-1 px-3 py-2 text-sm bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
                  >
                    Beheer
                  </button>
                </div>
              </div>

              {/* Progress bar for attendance */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 dark:bg-muted rounded-full h-2">
                  <div
                    className="bg-green-700 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((activity.current_participants / activity.max_participants) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Nieuwe Activiteit Modal */}
      <Dialog open={isNewActivityOpen} onOpenChange={setIsNewActivityOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nieuwe Activiteit Toevoegen</DialogTitle>
            <DialogDescription>
              Vul de gegevens in voor de nieuwe activiteit
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Activiteit Naam *</Label>
              <Input
                value={newActivity.name}
                onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                placeholder="bijv. Geiten Yoga"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Datum *</Label>
                <Input
                  type="date"
                  value={newActivity.date}
                  onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
                />
              </div>

              <div>
                <Label>Tijd *</Label>
                <Input
                  type="time"
                  value={newActivity.time}
                  onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Locatie *</Label>
              <Input
                value={newActivity.location}
                onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                placeholder="bijv. Geitenwei"
              />
            </div>

            <div>
              <Label>Max Deelnemers *</Label>
              <Input
                type="number"
                value={newActivity.max_participants}
                onChange={(e) => setNewActivity({ ...newActivity, max_participants: e.target.value })}
                placeholder="bijv. 12"
                min="1"
              />
            </div>

            <div>
              <Label>Beschrijving</Label>
              <Input
                value={newActivity.description}
                onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                placeholder="Korte beschrijving van de activiteit"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setIsNewActivityOpen(false)}
              className="px-4 py-2 text-gray-700 dark:text-foreground border border-gray-300 dark:border-input rounded-lg hover:bg-gray-50 dark:hover:bg-muted transition-colors"
            >
              Annuleren
            </button>
            <button
              onClick={handleAddActivity}
              className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
            >
              Toevoegen
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-green-700" />
              {selectedActivity?.name}
            </DialogTitle>
            <DialogDescription>
              Volledige details van deze activiteit
            </DialogDescription>
          </DialogHeader>

          {selectedActivity && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-muted rounded-lg">
                <span className="text-sm text-gray-600 dark:text-muted-foreground">Status</span>
                <span className={`px-3 py-1 text-xs rounded-full ${statusColors[getStatus(selectedActivity.current_participants, selectedActivity.max_participants)]}`}>
                  {getStatus(selectedActivity.current_participants, selectedActivity.max_participants)}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-muted-foreground">Datum:</span>
                  <span className="font-medium dark:text-foreground">{selectedActivity.date}</span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-muted-foreground">Tijd:</span>
                  <span className="font-medium dark:text-foreground">{selectedActivity.time}</span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-muted-foreground">Locatie:</span>
                  <span className="font-medium dark:text-foreground">{selectedActivity.location}</span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-muted-foreground">Deelnemers:</span>
                  <span className="font-medium dark:text-foreground">{selectedActivity.current_participants}/{selectedActivity.max_participants}</span>
                </div>
              </div>

              {selectedActivity.description && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-green-100">{selectedActivity.description}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-500 mb-2">Bezettingsgraad</p>
                <div className="w-full bg-gray-200 dark:bg-muted rounded-full h-3">
                  <div
                    className="bg-green-700 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min((selectedActivity.current_participants / selectedActivity.max_participants) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {Math.round((selectedActivity.current_participants / selectedActivity.max_participants) * 100)}%
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => setIsDetailsOpen(false)}
              className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
            >
              Sluiten
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Beheer Modal */}
      <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-green-700" />
              Activiteit Beheren
            </DialogTitle>
            <DialogDescription>
              Wijzig de details of verwijder de activiteit
            </DialogDescription>
          </DialogHeader>

          {selectedActivity && (
            <div className="space-y-4 py-4">
              <div>
                <Label>Activiteit Naam *</Label>
                <Input
                  value={editActivity.name}
                  onChange={(e) => setEditActivity({ ...editActivity, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Datum *</Label>
                  <Input
                    type="date"
                    value={editActivity.date}
                    onChange={(e) => setEditActivity({ ...editActivity, date: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Tijd *</Label>
                  <Input
                    type="time"
                    value={editActivity.time}
                    onChange={(e) => setEditActivity({ ...editActivity, time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Locatie *</Label>
                <Input
                  value={editActivity.location}
                  onChange={(e) => setEditActivity({ ...editActivity, location: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Huidige Deelnemers *</Label>
                  <Input
                    type="number"
                    value={editActivity.current_participants}
                    onChange={(e) => setEditActivity({ ...editActivity, current_participants: e.target.value })}
                    min="0"
                  />
                </div>

                <div>
                  <Label>Max Deelnemers *</Label>
                  <Input
                    type="number"
                    value={editActivity.max_participants}
                    onChange={(e) => setEditActivity({ ...editActivity, max_participants: e.target.value })}
                    min="1"
                  />
                </div>
              </div>

              <div>
                <Label>Beschrijving</Label>
                <Input
                  value={editActivity.description}
                  onChange={(e) => setEditActivity({ ...editActivity, description: e.target.value })}
                />
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleDeleteActivity}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Verwijder Activiteit
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setIsManageOpen(false)}
              className="px-4 py-2 text-gray-700 dark:text-foreground border border-gray-300 dark:border-input rounded-lg hover:bg-gray-50 dark:hover:bg-muted transition-colors"
            >
              Annuleren
            </button>
            <button
              onClick={handleUpdateActivity}
              className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
            >
              Opslaan
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}