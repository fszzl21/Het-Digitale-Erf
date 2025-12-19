import { Users, Tent, Calendar, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

export function StatsCards() {
  const stats = useMemo(() => [
    {
      title: 'Huidige Gasten',
      value: '87',
      change: '+12%',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Bezette Plekken',
      value: '43/50',
      change: '86%',
      icon: Tent,
      color: 'green'
    },
    {
      title: 'Reserveringen',
      value: '156',
      change: '+8%',
      icon: Calendar,
      color: 'purple'
    },
    {
      title: 'Bezettingsgraad',
      value: '86%',
      change: '+5%',
      icon: TrendingUp,
      color: 'orange'
    }
  ], []);

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.title} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <span className="text-sm text-green-600">{stat.change}</span>
          </div>
          <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
          <p className="text-gray-900">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}