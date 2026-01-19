import { Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { STATUS } from '../hooks/useTimer';
import { formatTime } from '../utils/formatTime';

export const TimerDisplay = ({ time, status, lastSolve }) => {
  const isHolding = status === STATUS.HOLDING;
  const isReady = status === STATUS.READY;
  const isRunning = status === STATUS.RUNNING;

  const getDisplayTime = () => {
    if (isRunning || isHolding || isReady) {
      return formatTime(time);
    }
    if (lastSolve) {
      if (lastSolve.penalty === 'DNF') return 'DNF';
      let t = lastSolve.time;
      if (lastSolve.penalty === 'PLUS2') t += 2000;
      return formatTime(t);
    }
    return formatTime(0);
  };

  return (
    <div className="flex justify-center items-center w-full">
       <div className="relative">
         <div className={clsx(
           "font-bold font-mono leading-none tabular-nums select-none transition-colors duration-150 text-center",
           "text-[5.5rem] sm:text-[8rem] lg:text-[12rem]", 
           isHolding && "text-red-500",
           isReady && "text-green-500",
           !isHolding && !isReady && "text-[#e4e4e7]"
         )}>
           {getDisplayTime()}
         </div>

         {lastSolve?.penalty === 'PLUS2' && !isRunning && (
           <div className={clsx(
             "absolute text-yellow-500 animate-in fade-in zoom-in duration-200",
             "-right-6 top-2",        
             "sm:-right-10 sm:top-4",  
             "lg:-right-16 lg:top-8"
           )}>
             <Plus className="w-6 h-6 sm:w-10 sm:h-10" strokeWidth={4} />
           </div>
         )}
       </div>
    </div>
  );
};