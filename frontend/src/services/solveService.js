import api from './api';
import { generateScramble } from '../utils/scramble';

const GUEST_STORAGE_KEY = 'cubetrainer_guest_data';

const getLocalData = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY)) || { sessions: [] };
  } catch {
    return { sessions: [] };
  }
};

const setLocalData = (data) => {
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(data));
};

export const solveService = {
  getDisciplines: async () => {
    try {
      const response = await api.get('/disciplines/');
      return response.data;
    } catch (error) {
      console.warn("API unavailable");
      return [
        { id: 1, name: '3x3 Cube', slug: '333', scrambler_type: '333' },
        { id: 2, name: '2x2 Cube', slug: '222', scrambler_type: '222' },
        { id: 3, name: '4x4 Cube', slug: '444', scrambler_type: '444' },
        { id: 4, name: '3x3 OH', slug: '333oh', scrambler_type: '333' },
      ];
    }
  },

  getSessionsList: async (disciplineSlug, user) => {
    if (user) {
      const response = await api.get(`/sessions/?discipline_slug=${disciplineSlug}`);
      return response.data;
    } else {
      const data = getLocalData();
      let sessions = data.sessions.filter(s => s.discipline_slug === disciplineSlug);
  
      return sessions;
    }
  },

  getSession: async (identifier, user, isSmartSwitch = false, disciplineSlug = null) => {
    if (user) {
      if (isSmartSwitch) {
        const response = await api.get(`/sessions/current/${identifier}/`);
        return response.data;
      } else {
        const response = await api.get(`/sessions/${identifier}/`);
        return response.data;
      }
    } else {
      const data = getLocalData();
      
      if (isSmartSwitch) {
        let session = data.sessions.find(s => s.discipline_slug === identifier);
        if (!session) {
          session = {
            id: `local_${Date.now()}`,
            name: 'General',
            discipline_slug: identifier,
            solves: [],
            is_system: true
          };
          data.sessions.push(session);
          setLocalData(data);
        }
        return session;
      } else {
        return data.sessions.find(s => s.id === identifier) || null;
      }
    }
  },

  createSession: async (name, disciplineSlug, user) => {
    if (user) {
      const response = await api.post('/sessions/', {
        name,
        discipline_slug: disciplineSlug
      });
      return response.data;
    } else {
      const data = getLocalData();
      const newSession = {
        id: `local_${Date.now()}`,
        name,
        discipline_slug: disciplineSlug,
        solves: [],
        is_system: false
      };
      data.sessions.push(newSession);
      setLocalData(data);
      return newSession;
    }
  },

  saveSolve: async (solveData, user, sessionId) => {
   
    if (user) {
      const response = await api.post('/solves/', {
        ...solveData,
        session_id: sessionId
      });
      return response.data;
    } else {
      const data = getLocalData();
      const sessionIndex = data.sessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex === -1) throw new Error("Session not found locally");

      const newSolve = {
        id: Date.now(),
        ...solveData,
        penalty: '0',
        created_at: new Date().toISOString()
      };

      data.sessions[sessionIndex].solves.unshift(newSolve);
      setLocalData(data);
      
      return newSolve;
    }
  },

  getLastSolve: async (user, sessionId) => {
    if (user) {
      try {
        const response = await api.get(`/solves/?session_id=${sessionId}&limit=1`);
        const data = response.data;
        const list = Array.isArray(data) ? data : (data.results || []);
        
        return list.length > 0 ? list[0] : null;
      } catch (e) {
        console.error("Error fetching last solve", e);
        return null;
      }
    } else {
      const data = getLocalData();
      const session = data.sessions.find(s => s.id === sessionId);
      
      if (session && session.solves && session.solves.length > 0) {
        return session.solves[0];
      }
      return null;
    }
  },

  updatePenalty: async (solveId, penalty, user, sessionId) => {    
    if (user) {
      const response = await api.patch(`/solves/${solveId}/`, { penalty });
      return response.data;
    } else {
      const data = getLocalData();
      const session = data.sessions.find(s => s.id === sessionId);
      if (session) {
        const solve = session.solves.find(s => s.id === solveId);
        if (solve) {
          solve.penalty = penalty;
          setLocalData(data);
          return solve;
        }
      }
      return null;
    }
  },

  deleteSolve: async (solveId, user, sessionId) => {
    if (user) {
      await api.delete(`/solves/${solveId}/`);
    } else {
      const data = getLocalData();
      const session = data.sessions.find(s => s.id === sessionId);
      if (session) {
        session.solves = session.solves.filter(s => s.id !== solveId);
        setLocalData(data);
      }
    }
  },

  syncGuestData: async () => {
    const data = getLocalData();
    if (data.sessions.length === 0) return;

    try {
      await api.post('/sync/', data);
      localStorage.removeItem(GUEST_STORAGE_KEY);
    } catch (error) {
      console.error("Sync failed", error);
    }
  }
};