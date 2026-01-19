import { useState, useEffect } from 'react';
import { useTimer, STATUS } from './hooks/useTimer';
import { generateScramble } from './utils/scramble';

import { authService } from './services/auth';
import { solveService } from './services/solveService';

import { Header } from './components/Header';
import { ScrambleDisplay } from './components/ScrambleDisplay';
import { TimerDisplay } from './components/TimerDisplay';
import { ControlBar } from './components/ControlBar';
import { StatsBar } from './components/StatsBar';
import { AuthModal } from './components/Modals/AuthModal';
import { NewSessionModal } from './components/Modals/NewSessionModal';
import { DeleteConfirmModal } from './components/Modals/DeleteConfirmModal';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [disciplines, setDisciplines] = useState([]);
  const [discipline, setDiscipline] = useState('333');
  const [scrambleType, setScrambleType] = useState('333');

  const [session, setSession] = useState('General');
  const [scramble, setScramble] = useState('');

  const [lastSolve, setLastSolve] = useState(null);
  
  const [modals, setModals] = useState({ auth: false, session: false, delete: false });
  const [authMode, setAuthMode] = useState('login');

  seEffect(() => {
    const initApp = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
        } catch (e) {
          console.error("Token invalid");
          localStorage.removeItem('auth_token');
        }
      }

      const discs = await solveService.getDisciplines();
      setDisciplines(discs);
      
      const defaultDisc = discs.find(d => d.slug === '333') || discs[0];
      if (defaultDisc) {
        setPuzzle(defaultDisc.slug);
        setScrambleType(defaultDisc.scrambler_type || defaultDisc.slug);
      }
      
      setLoading(false);
    };

    initApp();
  }, []);

  useEffect(() => {
    if (!discipline || loading) return;

    const loadSession = async () => {
      const sess = await solveService.getSession(discipline, user);
      setSession(sess);
      
      const disc = disciplines.find(d => d.slug === discipline);
      if (disc) setScrambleType(disc.scrambler_type || disc.slug);
  
      setScramble(generateScramble(disc?.scrambler_type || '333'));
    };

    loadSession();
  }, [discipline, user, loading, disciplines]);

  const generateNewScramble = () => {
    setScramble(generateScramble(scrambleType));
  };

  const handleFinish = async (timeMs) => {
    if (!session) return;

    const tempSolve = { 
      time: timeMs, 
      penalty: 'NONE', 
      id: 'temp',
      isLoading: true 
    };
    setLastSolve(tempSolve);
  
    const currentScramble = scramble;
    generateNewScramble();

    try {
      const savedSolve = await solveService.saveSolve(
        { time_ms: timeMs, scramble: currentScramble },
        user,
        session.id
      );
      
      setLastSolve({
        time: savedSolve.time_ms,
        penalty: savedSolve.penalty === '0' ? 'NONE' : savedSolve.penalty,
        id: savedSolve.id
      });
    } catch (e) {
      console.error("Save error", e);
      alert("Error saving solve!");
    }
  };

  const { time, status } = useTimer(handleFinish);

  const togglePenalty = async (type) => {
    if (!lastSolve || lastSolve.isLoading) return;

    const mapToApi = { 'PLUS2': '2', 'DNF': 'DNF', 'NONE': '0' };
    const mapToUi = { '2': 'PLUS2', 'DNF': 'DNF', '0': 'NONE' };

    let newUiPenalty = type;
    if (lastSolve.penalty === type) newUiPenalty = 'NONE';

    const oldSolve = { ...lastSolve };
    setLastSolve(prev => ({ ...prev, penalty: newUiPenalty }));

    try {
      await solveService.updatePenalty(
        lastSolve.id, 
        mapToApi[newUiPenalty], 
        user, 
        session.id
      );
    } catch (e) {
      console.error("Penalty update failed");
      setLastSolve(oldSolve);
    }
  };

  const handleDelete = async () => {
    if (!lastSolve) return;
    try {
      await solveService.deleteSolve(lastSolve.id, user, session.id);
      setLastSolve(null);
      setModals({ ...modals, delete: false });
    } catch (e) {
      console.error("Delete failed");
    }
  };

  const handleAuthSubmit = async (formData, isLogin) => {
    try {
      let loggedUser;
      if (isLogin) {
        await authService.login(formData);
        loggedUser = await authService.getMe();
      } else {
        await authService.register(formData);
        await authService.login({ username: formData.username, password: formData.password });
        loggedUser = await authService.getMe();
        
        await solveService.syncGuestData();
      }
      setUser(loggedUser);
      setModals({ ...modals, auth: false });
    } catch (e) {
      alert("Auth failed: " + JSON.stringify(e.response?.data || e.message));
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setLastSolve(null);
    window.location.reload();
  };

  const isRunning = status === STATUS.RUNNING;

  return (
    <div className="min-h-screen bg-[#0f0f11] text-[#e4e4e7] flex flex-col font-sans selection:bg-blue-500/30">
      
      <Header 
        isHidden={isRunning}
        puzzle={discipline}
        setPuzzle={setDiscipline}
        session={session?.name || 'Loading...'}
        setSession={(val) => console.log("TODO: Switch session")}

        onOpenAuth={() => setModals({ ...modals, auth: true })}
        onNewSessionTrigger={() => setModals({ ...modals, session: true })}

        user={user}
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
        onSubmit={handleAuthSubmit}
        onLogout={handleLogout}
        user={user}
      />
      
      <NewSessionModal 
        isOpen={modals.session} 
        onClose={() => setModals({ ...modals, session: false })} 
        onCreate={(name) => {
            // TODO: Create session API
            console.log("Create session", name);
        }}
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