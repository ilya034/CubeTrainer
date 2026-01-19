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
  const [initLoading, setInitLoading] = useState(true);

  const [disciplines, setDisciplines] = useState([]);
  const [sessionsList, setSessionsList] = useState([]);
  
  const [discipline, setDiscipline] = useState('');
  const [scrambleType, setScrambleType] = useState('333');
  const [session, setSession] = useState(null);
  
  const [scramble, setScramble] = useState('');
  const [lastSolve, setLastSolve] = useState(null);

  const [modals, setModals] = useState({ auth: false, session: false, delete: false });
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('auth_token');
      let currentUser = null;
      if (token) {
        try {
          currentUser = await authService.getMe();
          setUser(currentUser);
        } catch { localStorage.removeItem('auth_token'); }
      }

      const discData = await solveService.getDisciplines();
      setDisciplines(discData);

      const defaultDisc = discData.find(d => d.slug === '333') || discData[0];
      if (defaultDisc) {
        setDiscipline(defaultDisc.slug);
        setScrambleType(defaultDisc.scrambler_type);
      }
      
      setInitLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!discipline || initLoading) return;

    const loadContext = async () => {
      const activeSession = await solveService.getSession(discipline, user, true);
      setSession(activeSession);

      const list = await solveService.getSessionsList(discipline, user);
      setSessionsList(list);

      const disc = disciplines.find(d => d.slug === discipline);
      const sType = disc?.scrambler_type || '333';
      setScrambleType(sType);
      setScramble(generateScramble(sType));
    };

    loadContext();
  }, [discipline, user, initLoading, disciplines]);

  const handleDisciplineChange = (newSlug) => {
    setDiscipline(newSlug);
  };

  const handleSessionChange = async (sessionId) => {
    const selectedSession = await solveService.getSession(sessionId, user, false);
    setSession(selectedSession);
  };

  const handleCreateSession = async (name) => {
    try {
      const newSession = await solveService.createSession(name, discipline, user);
      setSession(newSession);
      const list = await solveService.getSessionsList(discipline, user);
      setSessionsList(list);
    } catch (e) {
      console.error("Failed to create session", e);
    }
  };
  
  const generateNewScramble = () => setScramble(generateScramble(scrambleType));

  const handlePreviousScramble = async () => {
    if (!session) return;
  
    const last = await solveService.getLastSolve(user, session.id);
    
    if (last && last.scramble) {
      setScramble(last.scramble);
      console.log("Restored scramble from solve ID:", last.id);
    } else {
      console.log("No previous solves found in this session");
    }
  };

  const handleFinish = async (timeMs) => {
    if (!session) return;
    
    const tempId = 'temp_' + Date.now();
    setLastSolve({ time: timeMs, penalty: 'NONE', id: tempId, isLoading: true });
    
    const currentScramble = scramble;
    generateNewScramble();

    try {
      const saved = await solveService.saveSolve({ time_ms: timeMs, scramble: currentScramble }, user, session.id);
      setLastSolve({
        time: saved.time_ms,
        penalty: saved.penalty === '0' ? 'NONE' : saved.penalty,
        id: saved.id
      });
    } catch (e) { console.error(e); }
  };

  const { time, status } = useTimer(handleFinish);

  const togglePenalty = async (type) => {
    if (!lastSolve || lastSolve.isLoading) return;
    
    const mapToApi = { 'PLUS2': '2', 'DNF': 'DNF', 'NONE': '0' };
    let newUiPenalty = type;
    if (lastSolve.penalty === type) newUiPenalty = 'NONE';

    setLastSolve(prev => ({ ...prev, penalty: newUiPenalty }));
    
    try {
      await solveService.updatePenalty(lastSolve.id, mapToApi[newUiPenalty], user, session.id);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async () => {
    if (!lastSolve) return;
    try {
      await solveService.deleteSolve(lastSolve.id, user, session.id);
      setLastSolve(null);
      setModals({ ...modals, delete: false });
    } catch (e) { console.error(e); }
  };

  const handleAuthSubmit = async (formData, isLogin) => {
    try {
      if (isLogin) {
        await authService.login(formData);
      } else {
        await authService.register(formData);
        await authService.login({ username: formData.username, password: formData.password });
        await solveService.syncGuestData();
      }
      const loggedUser = await authService.getMe();
      setUser(loggedUser);
      setModals({ ...modals, auth: false });
    } catch (e) { alert("Auth Error"); }
  };
  
  const handleLogout = () => {
    authService.logout();
    window.location.reload();
  };

  const isRunning = status === STATUS.RUNNING;

  if (initLoading) return <div className="min-h-screen bg-[#0f0f11] text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0f0f11] text-[#e4e4e7] flex flex-col font-sans selection:bg-blue-500/30">
      
      <Header 
        isHidden={isRunning}
        
        disciplines={disciplines}
        currentDisciplineSlug={discipline}
        onDisciplineChange={handleDisciplineChange}

        sessionsList={sessionsList}
        currentSessionId={session?.id}
        onSessionChange={handleSessionChange}

        onOpenAuth={() => setModals({ ...modals, auth: true })}
        onNewSessionTrigger={() => setModals({ ...modals, session: true })}
      />

      <main className="flex-1 flex flex-col relative">
        <ScrambleDisplay 
          scramble={scramble} 
          onGenerate={generateNewScramble}
          onPrevious={handlePreviousScramble}
          isHidden={isRunning}
        />

        <div className="flex-1 flex flex-col items-center justify-center">
          <TimerDisplay time={time} status={status} lastSolve={lastSolve} />
          
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
        onCreate={handleCreateSession}
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