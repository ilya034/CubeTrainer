import { ChevronLeft, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';

export const ScrambleDisplay = ({ scramble, onGenerate, isHidden }) => {
  return (
    <div className={clsx(
      "w-full flex justify-center px-4 transition-opacity duration-300 z-10",
      "mt-2 md:mt-4", 
      isHidden ? "opacity-0" : "opacity-100"
    )}>
      <div className="flex items-center justify-between gap-2 md:gap-6 w-full max-w-5xl">
         
         <button 
           className="p-2 md:p-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition flex-shrink-0"
           title="Previous Scramble"
         >
           <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
         </button>
         
         <div className="flex-1 text-center">
           <p className={clsx(
             "font-mono leading-relaxed break-words whitespace-normal text-gray-300",
             "text-xl sm:text-2xl md:text-3xl lg:text-3xl"
           )}>
             {scramble}
           </p>
         </div>

         <button 
            onClick={onGenerate}
            className="p-2 md:p-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition flex-shrink-0"
            title="Next Scramble"
         >
           <RefreshCw className="w-5 h-5 md:w-7 md:h-7" />
         </button>
      </div>
    </div>
  );
};