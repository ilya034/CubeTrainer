import { clsx } from 'clsx';
import { formatTime } from '../utils/formatTime';

export const StatsBar = ({ isHidden, onOpen, ao5, ao12 }) => {
  
  const formatValue = (val) => {
    if (val === null || val === undefined) return '-';
    if (val === 'DNF') return 'DNF';
    return formatTime(val);
  };

  return (
    <div className={clsx(
      "absolute left-0 right-0 flex justify-center gap-4 md:gap-6 transition-opacity duration-300", 
      "bottom-6 md:bottom-10",
      isHidden ? "opacity-0 pointer-events-none" : "opacity-100"
    )}>
       <StatButton 
         label="Ao5" 
         value={formatValue(ao5)} 
         onClick={onOpen} 
       />
       <StatButton 
         label="Ao12" 
         value={formatValue(ao12)} 
         onClick={onOpen} 
       />
    </div>
  );
};

const StatButton = ({ label, value, onClick }) => (
  <button 
    onClick={onClick}
    className={clsx(
      "bg-[#18181b] hover:bg-[#27272a] border border-gray-800 hover:border-gray-600 rounded-xl transition group",
      "px-4 py-2 min-w-[90px]",      // Mobile
      "md:px-6 md:py-3 md:min-w-[120px]" // Desktop
    )}
  >
     <span className="block text-[10px] md:text-xs text-gray-500 uppercase tracking-wider group-hover:text-blue-400 transition-colors">
       {label}
     </span>
     <span className={clsx(
       "text-xl md:text-2xl font-bold transition-colors",
       value === 'DNF' ? "text-red-500" : "text-white"
     )}>
       {value}
     </span>
  </button>
);