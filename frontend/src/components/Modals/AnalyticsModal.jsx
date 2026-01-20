import { X, Trophy, Hash, Activity, Calendar, Trash2, Copy } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { clsx } from 'clsx';
import { formatTime } from '../../utils/formatTime';

const StatCard = ({ label, value, subValue, icon: Icon, isBest }) => (
  <div className="bg-[#18181b] border border-gray-800 p-4 rounded-xl flex items-start justify-between group hover:border-gray-700 transition">
    <div>
      <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">{label}</p>
      <div className={clsx("text-2xl font-bold font-mono", isBest ? "text-yellow-500" : "text-white")}>
        {value}
      </div>
      {subValue && <div className="text-xs text-gray-500 mt-1">{subValue}</div>}
    </div>
    {Icon && <Icon className="text-gray-700 group-hover:text-blue-500 transition" size={20} />}
  </div>
);

const ProgressChart = ({ data }) => {
  if (!data || data.length < 2) return <div className="h-64 flex items-center justify-center text-gray-600">Not enough data for graph</div>;

  const chartData = data.map((solve, idx) => ({
    name: idx + 1,
    time: solve.penalty === 'DNF' ? null : solve.time_ms / 1000,
    rawTime: solve.time_ms,
    penalty: solve.penalty
  })).reverse();

  const validTimes = chartData.filter(d => d.time !== null).map(d => d.time);
  const avg = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f0f11] border border-gray-700 p-3 rounded-lg shadow-xl">
          <p className="text-gray-400 text-xs mb-1">Solve #{label}</p>
          <p className="text-xl font-bold font-mono text-blue-400">
             {formatTime(payload[0].payload.rawTime)}
             {payload[0].payload.penalty === 'PLUS2' && '+'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="name" stroke="#52525b" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
          <YAxis stroke="#52525b" tick={{fontSize: 12}} tickLine={false} axisLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3f3f46', strokeWidth: 2 }} />
          <Line 
            type="monotone" 
            dataKey="time" 
            stroke="#3b82f6" 
            strokeWidth={2} 
            dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }} 
            activeDot={{ r: 6, fill: '#60a5fa' }} 
            connectNulls={true}
          />
          <ReferenceLine y={avg} stroke="#22c55e" strokeDasharray="3 3" opacity={0.5} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const HistoryTable = ({ solves, onDelete }) => {
  return (
    <div className="flex-1 overflow-y-auto min-h-0 pr-2 custom-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 bg-[#0f0f11] z-10 text-xs text-gray-500 uppercase">
          <tr>
            <th className="py-3 font-medium">#</th>
            <th className="py-3 font-medium">Time</th>
            <th className="py-3 font-medium hidden sm:table-cell">Ao5</th>
            <th className="py-3 font-medium w-full pl-4">Scramble</th>
            <th className="py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {solves.map((solve, index) => {
             const number = solves.length - index;
             
             const isBest = false;
             const isWorst = solve.penalty === 'DNF';

             return (
              <tr key={solve.id} className="border-b border-gray-800/50 hover:bg-[#18181b] group transition-colors">
                <td className="py-3 text-gray-500 font-mono w-12">{number}</td>
                <td className={clsx("py-3 font-bold font-mono w-24", 
                  isWorst ? "text-red-500" : "text-white"
                )}>
                  {solve.penalty === 'DNF' ? 'DNF' : formatTime(solve.time_ms + (solve.penalty === '2' ? 2000 : 0))}
                  {solve.penalty === '2' && <span className="text-yellow-500 ml-1">+</span>}
                </td>
                <td className="py-3 text-gray-400 font-mono hidden sm:table-cell">-</td>
                <td className="py-3 pl-4">
                  <div className="truncate w-32 sm:w-64 md:w-full text-gray-500 text-xs font-mono cursor-help" title={solve.scramble}>
                    {solve.scramble}
                  </div>
                </td>
                <td className="py-3 text-right">
                  <button 
                    onClick={() => onDelete(solve.id)}
                    className="p-1.5 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded transition opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export const AnalyticsModal = ({ isOpen, onClose, sessionName, solves = [], onDeleteSolve }) => {
  if (!isOpen) return null;

  const validSolves = solves.filter(s => s.penalty !== 'DNF');
  
  const bestSolve = validSolves.reduce((min, s) => {
    const time = s.time_ms + (s.penalty === '2' ? 2000 : 0);
    return time < min ? time : min;
  }, Infinity);
  
  const mean = validSolves.length > 0 
    ? validSolves.reduce((sum, s) => sum + s.time_ms + (s.penalty === '2' ? 2000 : 0), 0) / validSolves.length 
    : 0;

  // 4. Current Ao5
  // TODO: Вынести расчет Ao5 в утилиту, чтобы не дублировать логику
  
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-6" onClick={onClose}>
      <div 
        className="bg-[#0f0f11] w-full max-w-5xl h-full sm:h-[90vh] rounded-2xl border border-gray-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Activity className="text-blue-500" />
              Analytics
            </h2>
            <p className="text-gray-400 text-sm mt-1">Session: <span className="text-blue-400 font-medium">{sessionName}</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          <div className="flex-1 p-6 overflow-y-auto border-b md:border-b-0 md:border-r border-gray-800">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard label="Solves" value={solves.length} icon={Hash} />
              <StatCard label="Best Single" value={bestSolve === Infinity ? '-' : formatTime(bestSolve)} icon={Trophy} isBest />
              <StatCard label="Global Mean" value={mean ? formatTime(mean) : '-'} icon={Activity} />
              <StatCard label="Current Ao5" value="-" subValue="Best: -" />
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-2">Progression</h3>
              <div className="bg-[#18181b] border border-gray-800 rounded-xl p-4">
                 <ProgressChart data={solves} />
              </div>
            </div>

          </div>

          <div className="w-full md:w-[400px] bg-[#0f0f11] flex flex-col p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
              History
              <span className="text-xs font-normal text-gray-500 bg-gray-800 px-2 py-1 rounded-md">Newest first</span>
            </h3>
            <HistoryTable solves={solves} onDelete={onDeleteSolve} />
          </div>

        </div>
      </div>
    </div>
  );
};