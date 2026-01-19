import { Settings, User } from 'lucide-react';
import { clsx } from 'clsx';

export const Header = ({ 
  isHidden, 
  
  disciplines, 
  currentDisciplineSlug, 
  onDisciplineChange, 

  sessionsList,
  currentSessionId,
  onSessionChange,
  
  onOpenAuth, 
  onNewSessionTrigger 
}) => {
  
  const selectClass = "appearance-none bg-[#18181b] hover:bg-[#27272a] text-white rounded-lg border border-gray-800 outline-none focus:border-blue-600 cursor-pointer font-medium transition-colors w-full text-sm md:text-base px-3 py-1.5 pr-7 md:px-4 md:py-2 md:pr-8";

  return (
    <header className={clsx("flex justify-between items-center p-3 md:p-6 transition-opacity duration-300 z-20", isHidden ? "opacity-0 pointer-events-none" : "opacity-100")}>
      <div className="flex gap-2 md:gap-4 max-w-[80%]">
        
        <div className="relative group shrink-0">
          <select 
            value={currentDisciplineSlug}
            onChange={(e) => onDisciplineChange(e.target.value)}
            className={selectClass}
          >
            {disciplines.map(disc => (
              <option key={disc.id} value={disc.slug}>
                {disc.name}
              </option>
            ))}
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>

        <div className="relative group shrink-1 min-w-0">
          <select 
            value={currentSessionId || ''}
            onChange={(e) => {
              if (e.target.value === 'NEW_SESSION_TRIGGER') {
                onNewSessionTrigger();
              } else {
                onSessionChange(e.target.value);
              }
            }}
            className={`${selectClass} truncate`}
            disabled={!currentSessionId}
          >
            {sessionsList.map(sess => (
              <option key={sess.id} value={sess.id}>
                {sess.name}
              </option>
            ))}
            
            {sessionsList.length > 0 && <hr />}
            <option value="NEW_SESSION_TRIGGER" className="text-blue-400 font-bold">+ New Session</option>
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