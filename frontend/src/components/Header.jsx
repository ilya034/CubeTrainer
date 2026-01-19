import { Settings, User } from 'lucide-react';
import { clsx } from 'clsx';

export const Header = ({ isHidden, puzzle, setPuzzle, setSession, session, onOpenAuth, onNewSessionTrigger }) => {
  const selectClass = "appearance-none bg-[#18181b] hover:bg-[#27272a] text-white rounded-lg border border-gray-800 outline-none focus:border-blue-600 cursor-pointer font-medium transition-colors w-full" +
                      " text-sm md:text-base px-3 py-1.5 pr-7 md:px-4 md:py-2 md:pr-8";

  return (
    <header className={clsx("flex justify-between items-center p-3 md:p-4 transition-opacity duration-300 z-20", isHidden ? "opacity-0 pointer-events-none" : "opacity-100")}>
      <div className="flex gap-2 md:gap-4 max-w-[80%]">
        
        <div className="relative group shrink-0">
          <select 
            value={puzzle}
            onChange={(e) => { setPuzzle(e.target.value); setSession('General'); }}
            className={selectClass}
          >
            <option value="333">3x3x3</option>
            <option value="222">2x2x2</option>
            <option value="444">4x4x4</option>
            <option value="333oh">3x3 OH</option>
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>

        <div className="relative group shrink-1 min-w-0">
          <select 
            value={session}
            onChange={(e) => e.target.value === 'NEW_SESSION_TRIGGER' ? onNewSessionTrigger() : setSession(e.target.value)}
            className={`${selectClass} truncate`}
          >
            <option value="General">General</option>
            <option value="OH Practice">OH Practice</option>
            <hr />
            <option value="NEW_SESSION_TRIGGER">+ New</option>
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
             <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      <button 
        onClick={onOpenAuth}
        className="p-2 md:p-2.5 bg-[#18181b] hover:bg-[#27272a] rounded-full text-gray-400 hover:text-white transition border border-gray-800 shrink-0"
      >
        <User className="w-5 h-5 md:w-6 md:h-6" />
      </button>
    </header>
  );
};