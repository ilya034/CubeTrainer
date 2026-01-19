import { Trash2 } from 'lucide-react';
import { clsx } from 'clsx';

export const ControlBar = ({ isHidden, lastSolve, onTogglePenalty, onDeleteClick }) => {
  return (
    <div className={clsx("mt-2 flex gap-4 h-10 transition-all duration-300", isHidden ? "opacity-0 translate-y-4 pointer-events-none" : "opacity-100 translate-y-0")}>
       
       <button 
         onClick={() => onTogglePenalty('PLUS2')}
         className={clsx(
           "px-6 rounded-lg font-bold text-lg border transition-all",
           lastSolve?.penalty === 'PLUS2' 
             ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]" 
             : "bg-transparent text-gray-500 border-gray-700 hover:border-yellow-700 hover:text-yellow-600"
         )}
       >
         +2
       </button>

       <button 
         onClick={() => onTogglePenalty('DNF')}
         className={clsx(
           "px-6 rounded-lg font-bold text-lg border transition-all",
           lastSolve?.penalty === 'DNF' 
             ? "bg-red-500/20 text-red-500 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]" 
             : "bg-transparent text-gray-500 border-gray-700 hover:border-red-700 hover:text-red-600"
         )}
       >
         DNF
       </button>

       <button 
         onClick={onDeleteClick}
         className="px-4 rounded-lg text-gray-600 border border-transparent hover:bg-gray-800 hover:text-gray-300 transition"
       >
         <Trash2 size={24} />
       </button>
    </div>
  );
};