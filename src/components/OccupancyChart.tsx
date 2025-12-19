export function OccupancyChart() {
  const data = [
    { date: 'Ma', bezetting: 45 },
    { date: 'Di', bezetting: 52 },
    { date: 'Wo', bezetting: 48 },
    { date: 'Do', bezetting: 61 },
    { date: 'Vr', bezetting: 72 },
    { date: 'Za', bezetting: 85 },
    { date: 'Zo', bezetting: 78 }
  ];

  const maxValue = 100;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="mb-6">
        <h2 className="text-gray-900 mb-1">Bezettingsgraad Deze Week</h2>
        <p className="text-sm text-gray-600">Percentage bezette campingplekken per dag</p>
      </div>
      
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="w-8 text-sm text-gray-600">{item.date}</div>
            <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-700 to-green-600 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                style={{ width: `${(item.bezetting / maxValue) * 100}%` }}
              >
                <span className="text-white text-sm">{item.bezetting}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
        <div>
          <span className="text-gray-600">Gemiddeld: </span>
          <span className="text-gray-900">{Math.round(data.reduce((sum, d) => sum + d.bezetting, 0) / data.length)}%</span>
        </div>
        <div>
          <span className="text-gray-600">Hoogste: </span>
          <span className="text-green-700">{Math.max(...data.map(d => d.bezetting))}%</span>
        </div>
      </div>
    </div>
  );
}
