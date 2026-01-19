import { clsx } from 'clsx';

export const StatsBar = ({ isHidden }) => {
  return (
    <div className={clsx(
      "absolute left-0 right-0 flex justify-center gap-4 md:gap-6 transition-opacity duration-300", 
      "bottom-6 md:bottom-10",
      isHidden ? "opacity-0" : "opacity-100"
    )}>
       <StatButton label="Ao5" value="16.12" />
       <StatButton label="Ao12" value="17.05" />
    </div>
  );
};

const StatButton = ({ label, value }) => (
  <button className={clsx(
    "bg-[#18181b] hover:bg-[#27272a] border border-gray-800 hover:border-gray-600 rounded-xl transition group",
    "px-4 py-2 min-w-[90px]",      // Mobile
    "md:px-6 md:py-3 md:min-w-[120px]" // Desktop
  )}>
     <span className="block text-[10px] md:text-xs text-gray-500 uppercase tracking-wider group-hover:text-blue-400">
       {label}
     </span>
     <span className="text-xl md:text-2xl font-bold text-white">
       {value}
     </span>
  </button>
);