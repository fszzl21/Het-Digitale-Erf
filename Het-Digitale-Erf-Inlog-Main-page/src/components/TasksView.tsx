import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { api, Task } from '../lib/api';

export function TasksView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'normaal' as 'laag' | 'normaal' | 'hoog',
    assigned_to: ''
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await api.getTasks();
      setTasks(data);
      setError(null);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError('Kon taken niet laden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const toggleTask = async (id: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'done' ? 'todo' : 'done';
      await api.updateTask(id, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await api.deleteTask(id);
      fetchTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const addTask = async () => {
    if (newTask.title && newTask.assigned_to) {
      try {
        await api.createTask({
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          status: 'todo',
          assigned_to: newTask.assigned_to
        });
        setNewTask({ title: '', description: '', priority: 'normaal', assigned_to: '' });
        setShowAddForm(false);
        fetchTasks();
      } catch (err) {
        console.error('Error adding task:', err);
      }
    }
  };

  const priorityColors = {
    laag: 'bg-gray-100 text-gray-700',
    normaal: 'bg-blue-100 text-blue-700',
    hoog: 'bg-red-100 text-red-700'
  };

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
        <h2 className="text-gray-900 dark:text-foreground">Taken Beheer</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nieuwe Taak
        </button>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-border">
          <h3 className="text-gray-900 dark:text-foreground mb-4">Nieuwe Taak Toevoegen</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 dark:text-muted-foreground mb-2">Titel</label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent bg-transparent dark:bg-background dark:text-foreground"
                placeholder="Taak titel..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-muted-foreground mb-2">Beschrijving</label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent bg-transparent dark:bg-background dark:text-foreground"
                rows={3}
                placeholder="Taak beschrijving..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-muted-foreground mb-2">Prioriteit</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'laag' | 'normaal' | 'hoog' })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent bg-transparent dark:bg-background dark:text-foreground"
                >
                  <option value="laag">Laag</option>
                  <option value="normaal">Normaal</option>
                  <option value="hoog">Hoog</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-muted-foreground mb-2">Toegewezen aan</label>
                <input
                  type="text"
                  value={newTask.assigned_to}
                  onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent bg-transparent dark:bg-background dark:text-foreground"
                  placeholder="Naam medewerker..."
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={addTask}
                className="flex-1 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
              >
                Taak Toevoegen
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

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-border transition-all ${task.status === 'done' ? 'opacity-60' : ''
              }`}
          >
            <div className="flex items-start gap-4">
              <button
                onClick={() => toggleTask(task.id, task.status)}
                className="mt-1 text-green-700 hover:text-green-800 transition-colors"
              >
                {task.status === 'done' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Circle className="w-6 h-6" />
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className={`text-gray-900 dark:text-foreground ${task.status === 'done' ? 'line-through' : ''}`}>
                    {task.title}
                  </h3>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-muted-foreground mb-3">{task.description}</p>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs rounded-full ${priorityColors[task.priority] || priorityColors.normaal}`}>
                    {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Normaal'}
                  </span>
                  {task.assigned_to && (
                    <span className="text-sm text-gray-600 dark:text-muted-foreground">
                      Toegewezen aan: <span className="text-gray-900 dark:text-foreground">{task.assigned_to}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="bg-white dark:bg-card p-12 rounded-xl shadow-sm border border-gray-100 dark:border-border text-center">
            <p className="text-gray-500 dark:text-muted-foreground">Geen taken gevonden. Klik op "Nieuwe Taak" om te beginnen.</p>
          </div>
        )}
      </div>
    </div>
  );
}