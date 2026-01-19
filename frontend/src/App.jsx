import { useState, useEffect } from 'react';
import { useTimer, STATUS } from './hooks/useTimer';
import { generateScramble } from './utils/scramble';

import { Header } from './components/Header';
import { ScrambleDisplay } from './components/ScrambleDisplay';
import { TimerDisplay } from './components/TimerDisplay';
import { ControlBar } from './components/ControlBar';
import { StatsBar } from './components/StatsBar';
import { AuthModal } from './components/Modals/AuthModal';
import { NewSessionModal } from './components/Modals/NewSessionModal';
import { DeleteConfirmModal } from './components/Modals/DeleteConfirmModal';

function App() {
  const [puzzle, setPuzzle] = useState('333');
  const [session, setSession] = useState('General');
  const [scramble, setScramble] = useState('');
  const [lastSolve, setLastSolve] = useState(null);
  
  const [modals, setModals] = useState({ auth: false, session: false, delete: false });
  const [authMode, setAuthMode] = useState('login');

  const generateNewScramble = () => setScramble(generateScramble(puzzle));

  useEffect(() => {
    generateNewScramble();
  }, [puzzle]);

  const handleFinish = (timeMs) => {
    setLastSolve({ time: timeMs, penalty: 'NONE', id: Date.now() });
    generateNewScramble();
  };

  const { time, status } = useTimer(handleFinish);

  const togglePenalty = (type) => {
    if (!lastSolve) return;
    setLastSolve(prev => ({
      ...prev,
      penalty: prev.penalty === type ? 'NONE' : type
    }));
  };

  const handleDelete = () => {
    setLastSolve(null);
    setModals({ ...modals, delete: false });
  };

  const isRunning = status === STATUS.RUNNING;

  return (
    <div className="min-h-screen bg-[#0f0f11] text-[#e4e4e7] flex flex-col font-sans selection:bg-blue-500/30">
      
      <Header 
        isHidden={isRunning}
        puzzle={puzzle}
        setPuzzle={setPuzzle}
        session={session}
        setSession={setSession}
        onOpenAuth={() => setModals({ ...modals, auth: true })}
        onNewSessionTrigger={() => setModals({ ...modals, session: true })}
      />

      <main className="flex-1 flex flex-col relative">
        <ScrambleDisplay 
          scramble={scramble} 
          onGenerate={generateNewScramble}
          isHidden={isRunning}
        />

        <div className="flex-1 flex flex-col items-center mt-20 sm:mt-16 md:mt-20">
          <TimerDisplay 
            time={time} 
            status={status} 
            lastSolve={lastSolve} 
          />
          
          <ControlBar 
            isHidden={isRunning || !lastSolve}
            lastSolve={lastSolve}
            onTogglePenalty={togglePenalty}
            onDeleteClick={() => setModals({ ...modals, delete: true })}
          />
        </div>

        <StatsBar isHidden={isRunning} />
      </main>

      <AuthModal 
        isOpen={modals.auth} 
        onClose={() => setModals({ ...modals, auth: false })} 
        isLoginMode={authMode === 'login'}
        toggleMode={() => setAuthMode(m => m === 'login' ? 'register' : 'login')}
      />
      
      <NewSessionModal 
        isOpen={modals.session} 
        onClose={() => setModals({ ...modals, session: false })} 
        onCreate={(name) => setSession(name)}
      />

      <DeleteConfirmModal 
        isOpen={modals.delete} 
        onClose={() => setModals({ ...modals, delete: false })} 
        onConfirm={handleDelete}
      />

    </div>
  );
}

export default App;